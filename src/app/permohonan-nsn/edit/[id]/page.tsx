import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import EditPermohonanClient from '@/components/EditPermohonanClient';

const SECRET_KEY = new TextEncoder().encode('rahasia_puskod_kemhan_2026');

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) redirect('/login');

  oracledb.fetchAsString = [oracledb.CLOB];

  const conn = await getConnection();
  try {
    const { payload }: any = await jwtVerify(token, SECRET_KEY);
    
    // Ambil data header
    const result: any = await conn.execute(
      `SELECT * FROM "SYSTEM"."PERMOHONAN_HEADER" WHERE "ID_PERMOHONAN" = :1`,
      [id], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      await conn.close();
      return redirect('/pantau-status');
    }

    const row = result.rows[0];

    // Cek kepemilikan (ID_USER harus sama dengan yang sedang login)
    if (row.ID_USER != payload.userId) {
      console.log(`[Edit] Unauthorized: User ${payload.userId} mencoba akses data milik ${row.ID_USER}`);
      await conn.close();
      return redirect('/pantau-status');
    }

    const initialData = JSON.parse(JSON.stringify(row));
    
    await conn.close();

    return (
      <div className="min-h-screen bg-[#FDFBF7] p-8">
        <EditPermohonanClient id={id} initialData={initialData} />
      </div>
    );
  } catch (error: any) {
    console.error("--- ERROR DI HALAMAN EDIT ---");
    console.error(error);
    if (conn) {
        try { await conn.close(); } catch (e) {}
    }
    return redirect('/pantau-status');
  }
}