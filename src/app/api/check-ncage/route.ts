import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';

export async function POST(request: Request) {
  try {
    const { ncageCode } = await request.json();
    const conn = await getConnection();

    // Cari di Master Data NCAGE
    const resultNcage: any = await conn.execute(
      `SELECT ENTITY_NAME FROM "SYSTEM"."NCAGE_RECORDS" WHERE "NCAGE_CODE" = :1`,
      [ncageCode],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Jika NCAGE tidak ditemukan
    if (resultNcage.rows.length === 0) {
      await conn.close();
      return NextResponse.json({ 
        exists: false, 
        message: "NCAGE belum terdaftar. Silakan hubungi bagian pendaftaran NCAGE." 
      });
    }

    const entityName = resultNcage.rows[0].ENTITY_NAME;

    // Cek apakah sudah ada user yang mendaftar dengan NCAGE ini
    const resultUser: any = await conn.execute(
      `SELECT "ID_USER" FROM "SYSTEM"."USERS" WHERE "NCAGE_KODE" = :1`,
      [ncageCode]
    );

    await conn.close();

    // Tentukan arah navigasi
    if (resultUser.rows.length > 0) {
      return NextResponse.json({ exists: true, hasAccount: true, target: '/login' });
    } else {
      // Bawa data nama perusahaan ke halaman register agar user tidak perlu ketik ulang
      const targetUrl = `/register?ncage=${ncageCode}&name=${encodeURIComponent(entityName)}`;
      return NextResponse.json({ exists: true, hasAccount: false, target: targetUrl });
    }

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}