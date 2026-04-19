import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import LembarKerjaClient from '@/components/LembarKerjaClient';

const SECRET_KEY = new TextEncoder().encode('rahasia_puskod_kemhan_2026');

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) redirect('/login');

  const { payload }: any = await jwtVerify(token, SECRET_KEY);

  // Set agar CLOB dibaca sebagai String biasa
  oracledb.fetchAsString = [oracledb.CLOB];

  const conn = await getConnection();

  try {
    // Ambil info header
    const resultHeader: any = await conn.execute(
      `SELECT "ID_PERMOHONAN", "NAMA_PERUSAHAAN", "PENGADAAN", "STATUS_SAAT_INI", 
              "NCAGE", "NO_KONTRAK", TO_CHAR("TANGGAL_KONTRAK", 'YYYY-MM-DD') as TGL_KONTRAK, 
              "NO_SURAT_PERMOHONAN" 
       FROM "SYSTEM"."PERMOHONAN_HEADER" WHERE "ID_PERMOHONAN" = :1`,
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Ambil daftar materiil
    const resultMateriil: any = await conn.execute(
      `SELECT * FROM "SYSTEM"."PERMOHONAN_MATERIIL" WHERE "ID_PERMOHONAN" = :1 ORDER BY "ID_MATERIIL" ASC`,
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Ambil data team
    const resultTeam: any = await conn.execute(
      `SELECT t.*, u."NAMA_LENGKAP" 
       FROM "SYSTEM"."PERMOHONAN_TEAM" t
       JOIN "SYSTEM"."USERS" u ON t."ID_USER_PETUGAS" = u."ID_USER"
       WHERE t."ID_PERMOHONAN" = :1`,
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Tutup koneksi SEBELUM melakukan JSON parse/stringify untuk keamanan
    await conn.close();

    if (resultHeader.rows.length === 0) redirect('/admin/pengerjaan');

    // Bersihkan data secara manual (Deep Copy) untuk memutus referensi object Oracle
    const cleanHeader = JSON.parse(JSON.stringify(resultHeader.rows[0]));
    const cleanMateriil = JSON.parse(JSON.stringify(resultMateriil.rows));
    const cleanTeam = JSON.parse(JSON.stringify(resultTeam.rows));

    return (
      <LembarKerjaClient 
        header={cleanHeader} 
        materiil={cleanMateriil}
        team={cleanTeam}
        currentUserId={payload.userId} 
      />
    );

  } catch (error) {
    console.error("Error Lembar Kerja:", error);
    // Cek apakah koneksi masih terbuka sebelum mencoba menutupnya
    if (conn && conn.close) {
        try { await conn.close(); } catch (e) {}
    }
    redirect('/admin/pengerjaan');
  }
}