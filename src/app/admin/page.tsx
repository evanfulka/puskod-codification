import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import { 
  FileText, Activity, CheckCircle2, AlertCircle, 
  Clock, ShieldCheck, ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  oracledb.fetchAsString = [oracledb.CLOB];
  
  const conn = await getConnection();

  try {
    // Ambil Statistik Utama
    const statsRes: any = await conn.execute(
      `SELECT 
        COUNT(*) as TOTAL,
        SUM(CASE WHEN "STATUS_SAAT_INI" = 'Selesai' THEN 1 ELSE 0 END) as SELESAI,
        SUM(CASE WHEN "STATUS_SAAT_INI" = 'Revisi Berkas' THEN 1 ELSE 0 END) as REVISI,
        SUM(CASE WHEN "STATUS_SAAT_INI" NOT IN ('Selesai', 'Draft', 'Revisi Berkas') THEN 1 ELSE 0 END) as PROSES
       FROM "SYSTEM"."PERMOHONAN_HEADER"`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Ambil Aktifitas Terbaru (Audit Trail)
    const recentLogsRes: any = await conn.execute(
      `SELECT l.*, u."NAMA_LENGKAP", h."NAMA_PERUSAHAAN"
       FROM "SYSTEM"."PERMOHONAN_LOG" l
       JOIN "SYSTEM"."USERS" u ON l."ID_USER_PETUGAS" = u."ID_USER"
       JOIN "SYSTEM"."PERMOHONAN_HEADER" h ON l."ID_PERMOHONAN" = h."ID_PERMOHONAN"
       ORDER BY l."TANGGAL_LOG" DESC
       FETCH NEXT 6 ROWS ONLY`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Ambil Antrean Berkas Baru
    const pendingRes: any = await conn.execute(
      `SELECT "ID_PERMOHONAN", "NAMA_PERUSAHAAN", "STATUS_SAAT_INI"
       FROM "SYSTEM"."PERMOHONAN_HEADER"
       WHERE "STATUS_SAAT_INI" IN ('Permohonan Baru', 'Verifikasi Berkas')
       ORDER BY "ID_PERMOHONAN" ASC
       FETCH NEXT 5 ROWS ONLY`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await conn.close();

    const stats = statsRes.rows[0];
    const logs = JSON.parse(JSON.stringify(recentLogsRes.rows));
    const pending = pendingRes.rows;

    return (
      <div className="p-8 space-y-10 bg-gray-50/30 min-h-screen">
        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900 italic">
              Operational <span className="text-[#800000]">Dashboard</span>
            </h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
              Pusat Kodifikasi Baranahan Kemhan — Real-time Monitor
            </p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">System Live</span>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Permohonan" value={stats.TOTAL} icon={<FileText />} color="bg-blue-600" />
          <StatCard title="Sedang Diproses" value={stats.PROSES} icon={<Activity />} color="bg-orange-500" />
          <StatCard title="Perlu Revisi" value={stats.REVISI} icon={<AlertCircle />} color="bg-red-600" />
          <StatCard title="Proses Tuntas" value={stats.SELESAI} icon={<CheckCircle2 />} color="bg-green-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AKTIFITAS TERBARU */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <Clock className="text-[#800000]" size={20} /> Aktifitas Petugas Terkini
            </h3>
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 space-y-6">
              {logs.map((log: any, i: number) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#800000] group-hover:text-white transition-all duration-300">
                      <ShieldCheck size={20} />
                  </div>
                  <div className="flex-1 border-b border-gray-50 pb-4 last:border-0">
                      <div className="flex justify-between items-start">
                          <p className="text-sm font-black text-gray-900 uppercase tracking-tight">
                              {log.NAMA_LENGKAP} 
                              <span className="ml-2 font-bold text-[9px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase border border-blue-100">
                                  {log.STATUS}
                              </span>
                          </p>
                          <span className="text-[10px] font-bold text-gray-300 italic">
                              {new Date(log.TANGGAL_LOG).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 uppercase font-bold">
                          {log.NAMA_PERUSAHAAN} — <span className="italic font-medium normal-case text-gray-400">"{log.KETERANGAN}"</span>
                      </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ANTREAN PRIORITAS */}
          <div className="space-y-6">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <AlertCircle className="text-orange-500" size={20} /> Berkas Masuk Terbaru
            </h3>
            <div className="bg-[#1A1A1A] rounded-[2.5rem] p-8 shadow-xl text-white space-y-6">
              {pending.map((item: any) => (
                <div key={item.ID_PERMOHONAN} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition group">
                  <div className="flex justify-between items-start mb-1">
                      <p className="text-[10px] font-black text-[#800000] uppercase">ID #{item.ID_PERMOHONAN}</p>
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-orange-500 text-white rounded">NEW</span>
                  </div>
                  <h4 className="text-sm font-bold uppercase leading-tight line-clamp-1">{item.NAMA_PERUSAHAAN}</h4>
                  <div className="mt-4 flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 italic">
                          {item.STATUS_SAAT_INI}
                      </span>
                      <Link href={`/admin/permohonan`} className="p-2 bg-white text-black rounded-lg group-hover:bg-[#800000] group-hover:text-white transition shadow-lg">
                          <ArrowRight size={14} />
                      </Link>
                  </div>
                </div>
              ))}
              {pending.length === 0 && <p className="text-xs text-gray-500 italic text-center py-10">Tidak ada antrean baru.</p>}
              
              <Link href="/admin/permohonan" className="block text-center pt-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition">
                  Buka Menu Permohonan
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    console.error("--- ERROR DASHBOARD ---", error);
    if (conn) await conn.close();
    return (
      <div className="p-20 text-center">
        <h2 className="text-red-600 font-black uppercase">Database Error</h2>
        <p className="text-sm text-gray-500">{error.message}</p>
      </div>
    );
  }
}

// HELPER STAT CARD
function StatCard({ title, value, icon, color }: { title: string, value: any, icon: any, color: string }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 hover:scale-[1.02] transition-transform duration-300">
      <div className={`p-4 rounded-2xl text-white shadow-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{title}</p>
        <p className="text-3xl font-black text-gray-900 tracking-tighter italic">{value || 0}</p>
      </div>
    </div>
  );
}