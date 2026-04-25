import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import { redirect } from 'next/navigation';
import TrackRecord from '@/components/TrackRecord';
import Link from 'next/link';
import { ChevronLeft, Building2, Hash, FileSignature } from 'lucide-react';

export default async function AdminMonitoringPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  oracledb.fetchAsString = [oracledb.CLOB];
  
  const conn = await getConnection();

  try {
    // Ambil Data Header
    const headerRes: any = await conn.execute(
      `SELECT "ID_PERMOHONAN", "NAMA_PERUSAHAAN", "NCAGE", "NO_KONTRAK", "STATUS_SAAT_INI", "PENGADAAN" 
       FROM "SYSTEM"."PERMOHONAN_HEADER" WHERE "ID_PERMOHONAN" = :1`,
      [id], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (headerRes.rows.length === 0) {
      console.log(`[Monitoring] ID ${id} tidak ditemukan di database.`);
      await conn.close();
      return redirect('/admin/monitoring');
    }

    // Ambil Data Log (Join dengan Users)
    // Pastikan kolom TANGGAL_LOG benar namanya di tabel PERMOHONAN_LOG kamu
    const logsRes: any = await conn.execute(
      `SELECT l.*, u."NAMA_LENGKAP", u."JABATAN", u."NOMOR_IDENTITAS"
       FROM "SYSTEM"."PERMOHONAN_LOG" l
       LEFT JOIN "SYSTEM"."USERS" u ON l."ID_USER_PETUGAS" = u."ID_USER"
       WHERE l."ID_PERMOHONAN" = :1
       ORDER BY l."TANGGAL_LOG" ASC`,
      [id], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await conn.close();

    const data = JSON.parse(JSON.stringify(headerRes.rows[0]));
    const logs = JSON.parse(JSON.stringify(logsRes.rows));

    return (
      <div className="p-8 max-w-5xl mx-auto space-y-8 min-h-screen bg-gray-50/20">
        <div className="flex items-center gap-4">
          <Link href="/admin/monitoring" className="p-2 bg-white border rounded-full hover:bg-gray-50 transition shadow-sm">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-xl font-black uppercase italic tracking-tighter">Monitoring Progres (Admin)</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Hash size={12}/> NCAGE
            </p>
            <p className="text-xl font-black text-gray-900 italic">{data.NCAGE || '-'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={12}/> Nama Perusahaan
            </p>
            <p className="text-xl font-black text-gray-900 italic uppercase">{data.NAMA_PERUSAHAAN}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FileSignature size={12}/> Nomor Kontrak
            </p>
            <p className="text-sm font-bold text-gray-700 leading-tight">{data.NO_KONTRAK || '-'}</p>
          </div>
        </div>

        <TrackRecord logs={logs} currentStatus={data.STATUS_SAAT_INI} />
      </div>
    );
  } catch (error: any) {
    console.error("--- ERROR MONITORING DETAIL ---");
    console.error(error); 
    
    if (conn) {
        try { await conn.close(); } catch (e) {}
    }

    return (
        <div className="p-20 text-center">
            <h1 className="text-red-500 font-bold">Terjadi Kesalahan Server</h1>
            <p className="text-sm text-gray-500">{error.message}</p>
            <Link href="/admin/monitoring" className="text-blue-500 underline mt-4 inline-block">Kembali</Link>
        </div>
    );
  }
}