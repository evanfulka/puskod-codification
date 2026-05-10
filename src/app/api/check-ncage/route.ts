import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';

export async function POST(request: Request) {
  let conn; // Deklarasikan di luar blok try agar bisa diakses oleh blok finally
  
  try {
    const { query } = await request.json();
    conn = await getConnection();

    // Menggunakan Named Bind Variable (:searchTerm)
    // Karena parameter digunakan dua kali, kita lemparkan object { searchTerm: query }
    const resultNcage: any = await conn.execute(
      `SELECT "NCAGE_CODE", "ENTITY_NAME" 
       FROM "SYSTEM"."NCAGE_RECORDS" 
       WHERE "NCAGE_CODE" = :searchTerm OR UPPER("ENTITY_NAME") LIKE UPPER('%' || :searchTerm || '%')
       FETCH FIRST 1 ROWS ONLY`,
      { searchTerm: query }, // Object binding, bukan array
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Jika NCAGE atau Nama Perusahaan tidak ditemukan
    if (resultNcage.rows.length === 0) {
      return NextResponse.json({ 
        exists: false, 
        type: 'error',
        title: 'Data Tidak Ditemukan',
        message: "Kode NCAGE atau Nama Perusahaan tersebut belum terdaftar di database Pusat Kodifikasi. Silakan pastikan input Anda benar." 
      });
    }

    const entityName = resultNcage.rows[0].ENTITY_NAME;
    const ncageCode = resultNcage.rows[0].NCAGE_CODE;

    // Cek apakah sudah ada user yang mendaftar dengan NCAGE ini
    // Gunakan Named Bind Variable juga di sini untuk konsistensi
    const resultUser: any = await conn.execute(
      `SELECT "ID_USER" FROM "SYSTEM"."USERS" WHERE "NCAGE_KODE" = :ncageCode`,
      { ncageCode: ncageCode }
    );

    // Tentukan arah navigasi
    if (resultUser.rows.length > 0) {
      // Skenario: NCAGE Ada & Sudah Punya Akun
      return NextResponse.json({ 
        exists: true, 
        type: 'info',
        title: 'Akun Sudah Terdaftar',
        message: `Perusahaan ${entityName} (${ncageCode}) sudah memiliki akun. Silakan masuk ke sistem.`,
        target: '/login' 
      });
    } else {
      // Skenario: NCAGE Ada & Belum Punya Akun
      const targetUrl = `/register?ncage=${ncageCode}&name=${encodeURIComponent(entityName)}`;
      return NextResponse.json({ 
        exists: true, 
        type: 'success',
        title: 'Data Tervalidasi',
        message: `Data ditemukan untuk ${entityName} (NCAGE: ${ncageCode}). Silakan lanjutkan pendaftaran akun.`,
        target: targetUrl 
      });
    }

  } catch (err) {
    console.error("Error check-ncage API:", err);
    return NextResponse.json({ 
      exists: false, 
      type: 'error',
      title: 'Kesalahan Sistem',
      message: "Terjadi kesalahan pada server saat memeriksa database." 
    }, { status: 500 });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Gagal menutup koneksi database:", err);
      }
    }
  }
}