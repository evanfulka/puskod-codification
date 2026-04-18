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
        type: 'error',
        title: 'NCAGE Tidak Ditemukan',
        message: "Kode NCAGE belum terdaftar di database Pusat Kodifikasi. Silakan daftarkan NCAGE perusahaan Anda terlebih dahulu." 
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
      // Skenario: NCAGE Ada & Sudah Punya Akun
      return NextResponse.json({ 
        exists: true, 
        type: 'info',
        title: 'Akun Sudah Terdaftar',
        message: `Perusahaan ${entityName} sudah memiliki akun POC. Silakan masuk ke sistem.`,
        target: '/login' 
      });
    } else {
      // Skenario: NCAGE Ada & Belum Punya Akun
      const targetUrl = `/register?ncage=${ncageCode}&name=${encodeURIComponent(entityName)}`;
      return NextResponse.json({ 
        exists: true, 
        type: 'success',
        title: 'NCAGE Tervalidasi',
        message: `NCAGE ditemukan untuk ${entityName}. Silakan lanjutkan pendaftaran akun POC.`,
        target: targetUrl 
      });
    }

  } catch (err) {
    return NextResponse.json({ 
      exists: false, 
      type: 'error',
      title: 'Kesalahan Sistem',
      message: "Terjadi kesalahan pada server saat memeriksa NCAGE." 
    }, { status: 500 });
  }
}