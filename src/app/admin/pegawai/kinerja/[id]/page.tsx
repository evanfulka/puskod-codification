import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, ArrowRight } from 'lucide-react';

export default async function AuditKinerjaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  oracledb.fetchAsString = [oracledb.CLOB];
  const conn = await getConnection();

  try {
    // Ambil Profil Pegawai
    const userRes: any = await conn.execute(
      `SELECT "NAMA_LENGKAP", "JABATAN", "ROLE" FROM "SYSTEM"."USERS" WHERE "ID_USER" = :1`,
      [id], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (userRes.rows.length === 0) redirect('/admin/pegawai');
    const user = userRes.rows[0];

    // Ambil History Log
    const logsRes: any = await conn.execute(
      `SELECT l.*, h."NAMA_PERUSAHAAN", h."PENGADAAN"
       FROM "SYSTEM"."PERMOHONAN_LOG" l
       JOIN "SYSTEM"."PERMOHONAN_HEADER" h ON l."ID_PERMOHONAN" = h."ID_PERMOHONAN"
       WHERE l."ID_USER_PETUGAS" = :1
       ORDER BY l."TANGGAL_LOG" DESC`,
      [id], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    await conn.close();

    const logs = JSON.parse(JSON.stringify(logsRes.rows));

    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/pegawai" className="p-2 bg-white border rounded-full hover:bg-gray-50 transition shadow-sm">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter italic">Log Aktivitas Pegawai</h1>
            <p className="text-xs font-bold text-[#800000] uppercase tracking-widest">{user.NAMA_LENGKAP} — {user.ROLE}</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">
                <th className="px-8 py-5">Waktu</th>
                <th className="px-6 py-5">Proyek / Perusahaan</th>
                <th className="px-6 py-5">Aksi Realisasi</th>
                <th className="px-8 py-5 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log: any) => (
                <tr key={log.ID_LOG} className="hover:bg-gray-50/30 transition">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(log.TANGGAL_LOG).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-xs font-black uppercase text-gray-800 line-clamp-1">{log.NAMA_PERUSAHAAN}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase line-clamp-1">{log.PENGADAAN}</p>
                  </td>
                  <td className="px-6 py-6">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[9px] font-black uppercase rounded tracking-wider border border-blue-100">
                        {log.STATUS}
                    </span>
                    <p className="mt-1 text-[10px] text-gray-500 italic">"{log.KETERANGAN}"</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link href={`/admin/monitoring/${log.ID_PERMOHONAN}`} className="text-[#800000] hover:underline text-[10px] font-black uppercase">
                        Cek Proyek <ArrowRight size={12} className="inline ml-1" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="p-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                Belum ada aktivitas tercatat
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    if (conn) await conn.close();
    redirect('/admin/pegawai');
  }
}