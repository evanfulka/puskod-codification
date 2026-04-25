import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import { redirect } from 'next/navigation';
import PenyelesaianProyekClient from '@/components/PenyelesaianProyekClient';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  // Amankan pembacaan CLOB jika ada
  oracledb.fetchAsString = [oracledb.CLOB];
  
  const conn = await getConnection();

  try {
    const result: any = await conn.execute(
      `SELECT h.*, u."NAMA_LENGKAP", u."NO_TELP_WA" 
       FROM "SYSTEM"."PERMOHONAN_HEADER" h
       LEFT JOIN "SYSTEM"."USERS" u ON h."ID_USER" = u."ID_USER"
       WHERE h."ID_PERMOHONAN" = :1`,
      [id], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      console.log(`[Validasi] Data tidak ditemukan untuk ID: ${id}`);
      await conn.close();
      return redirect('/admin/validasi');
    }

    // Bersihkan data dari object Oracle yang melingkar
    const data = JSON.parse(JSON.stringify(result.rows[0]));
    
    await conn.close();

    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
            <Link href="/admin/validasi" className="p-2 hover:bg-white rounded-full transition shadow-sm border bg-gray-50">
                <ChevronLeft />
            </Link>
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter">{data.NAMA_PERUSAHAAN}</h1>
                <p className="text-xs font-bold text-[#800000] uppercase tracking-widest">
                  Status: {data.STATUS_SAAT_INI}
                </p>
            </div>
        </div>

        <PenyelesaianProyekClient data={data} />
      </div>
    );
  } catch (error: any) {
    console.error("--- ERROR DI HALAMAN VALIDASI DETAIL ---");
    console.error(error);
    
    if (conn) {
      try { await conn.close(); } catch (e) {}
    }
    
    return redirect('/admin/validasi');
  }
}