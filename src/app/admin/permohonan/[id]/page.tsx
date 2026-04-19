import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import { redirect } from 'next/navigation';
import DetailPermohonanClient from '@/components/DetailPermohonanClient';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  
  const resolvedParams = await params;
  const id = resolvedParams.id;

  oracledb.fetchAsString = [ oracledb.CLOB ];

  const conn = await getConnection();

  try {
    // Ambil Data Detail Permohonan
    const result: any = await conn.execute(
      `SELECT 
        "ID_PERMOHONAN", "NCAGE", "TOEC", "NAMA_PERUSAHAAN", "NAMA_LENGKAP", "ALAMAT", 
        "NOMOR_IDENTITAS", "NOMOR_TELEPON", "EMAIL_PERUSAHAAN", "JABATAN", 
        "PENGADAAN", "NO_SURAT_PERMOHONAN", "NO_KONTRAK", 
        TO_CHAR("TANGGAL_KONTRAK", 'YYYY-MM-DD') as TGL_KONTRAK,
        "FILE_SURAT_PERMOHONAN", "FILE_DOKUMEN_KONTRAK", "FILE_DOKUMEN_MATERIIL", "FILE_IPC_IPB",
        "STATUS_SAAT_INI"
       FROM "SYSTEM"."PERMOHONAN_HEADER"
       WHERE "ID_PERMOHONAN" = :1`,
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const data = result.rows[0];

    // Ambil Daftar Kataloger untuk Dropdown SPRIN
    const resultKataloger: any = await conn.execute(
      `SELECT "ID_USER", "NAMA_LENGKAP" FROM "SYSTEM"."USERS" WHERE "ROLE" = 'KATALOGER'`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const katalogers = resultKataloger.rows;
    
    await conn.close();

    if (!data) {
        redirect('/admin/permohonan');
    }

    // Kirim data permohonan dan daftar kataloger ke client
    return <DetailPermohonanClient 
              data={JSON.parse(JSON.stringify(data))} 
              katalogers={JSON.parse(JSON.stringify(katalogers))} 
           />;

  } catch (error) {
    console.error("Gagal ambil detail:", error);
    if (conn) await conn.close();
    redirect('/admin/permohonan');
  }
}