import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import { 
  BarChart3, TrendingUp, Timer, Users2, 
  Award, AlertTriangle, FileSpreadsheet, Download 
} from 'lucide-react';

export default async function StatistikPage() {
  oracledb.fetchAsString = [oracledb.CLOB];
  const conn = await getConnection();

  try {
    // STATISTIK PERFORMA PEGAWAI (Top 5 Leaderboard berdasarkan aksi di Log)
    const rankRes: any = await conn.execute(
      `SELECT u."NAMA_LENGKAP", u."ROLE", COUNT(l."ID_LOG") as TOTAL_AKSI
       FROM "SYSTEM"."PERMOHONAN_LOG" l
       JOIN "SYSTEM"."USERS" u ON l."ID_USER_PETUGAS" = u."ID_USER"
       WHERE u."ROLE" != 'PEMOHON'
       GROUP BY u."NAMA_LENGKAP", u."ROLE"
       ORDER BY TOTAL_AKSI DESC
       FETCH NEXT 5 ROWS ONLY`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // SLA (Rata-rata Hari dari Submit sampai Log Status 'Selesai' muncul)
    const slaRes: any = await conn.execute(
        `SELECT AVG(CAST(l."TANGGAL_LOG" AS DATE) - CAST(h."TANGGAL_SUBMIT" AS DATE)) as AVG_DAYS
        FROM "SYSTEM"."PERMOHONAN_HEADER" h
        JOIN "SYSTEM"."PERMOHONAN_LOG" l ON h."ID_PERMOHONAN" = l."ID_PERMOHONAN"
        WHERE l."STATUS" = 'Selesai'`,
        [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // DISTRIBUSI STATUS (Untuk melihat Bottleneck/Kemacetan)
    const distRes: any = await conn.execute(
      `SELECT "STATUS_SAAT_INI", COUNT(*) as JUMLAH
       FROM "SYSTEM"."PERMOHONAN_HEADER"
       GROUP BY "STATUS_SAAT_INI"
       ORDER BY JUMLAH DESC`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await conn.close();

    const rankings = rankRes.rows;
    const sla = slaRes.rows[0]?.AVG_DAYS ? Math.round(slaRes.rows[0].AVG_DAYS) : 0;
    const distribusi = distRes.rows;

    return (
      <div className="p-8 space-y-10 bg-gray-50/30 min-h-screen">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic text-gray-900">
              Strategic <span className="text-[#800000]">Insights</span>
            </h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Laporan Analisis Efisiensi & Performa Puskod</p>
          </div>
        </div>

        {/* TOP ROW: SLA & OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#800000] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Rata-rata Penyelesaian</p>
            <h2 className="text-6xl font-black italic tracking-tighter mb-2">{sla} <span className="text-xl not-italic opacity-60">Hari</span></h2>
            <p className="text-xs font-bold text-red-100">Dihitung dari berkas masuk hingga sertifikat terbit.</p>
          </div>

          <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                    <BarChart3 className="text-[#800000]" size={20} /> Kemacetan Proses (Bottlenecks)
                </h3>
            </div>
            <div className="flex items-end gap-3 h-32">
                {distribusi.map((d: any, i: number) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div 
                          className="w-full bg-gray-100 rounded-t-xl group-hover:bg-[#800000] transition-all relative"
                          style={{ height: `${(d.JUMLAH / distribusi[0].JUMLAH) * 100}%` }}
                        >
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                                {d.JUMLAH}
                            </span>
                        </div>
                        <p className="text-[8px] font-black uppercase text-gray-400 text-center line-clamp-1 w-full">{d.STATUS_SAAT_INI}</p>
                    </div>
                ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEADERBOARD PERFORMA */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <Award className="text-yellow-500" size={24} /> Pegawai Terproduktif
            </h3>
            <div className="space-y-6">
                {rankings.map((r: any, i: number) => (
                    <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center font-black text-gray-300 group-hover:bg-[#800000] group-hover:text-white transition">
                                {i + 1}
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900 uppercase">{r.NAMA_LENGKAP}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{r.ROLE}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-black italic text-gray-900">{r.TOTAL_AKSI}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">Tindakan</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* RINGKASAN STATUS DETAIL */}
          <div className="bg-[#1A1A1A] p-10 rounded-[3rem] text-white space-y-8 shadow-2xl">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <AlertTriangle className="text-orange-500" size={24} /> Distribusi Beban Kerja
            </h3>
            <div className="space-y-4">
                {distribusi.map((d: any, i: number) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-gray-400">{d.STATUS_SAAT_INI}</span>
                            <span>{d.JUMLAH} Berkas</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-orange-500 rounded-full" 
                                style={{ width: `${(d.JUMLAH / distribusi.reduce((a: any, b: any) => a + b.JUMLAH, 0)) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl">
                    <Timer className="text-blue-400" size={24} />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                    Data di atas menunjukkan distribusi berkas yang sedang aktif. Pantau status dengan persentase tertinggi untuk menghindari <span className="text-white font-bold italic">overload</span> pada petugas tertentu.
                </p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    console.error("--- ERROR STATISTIK ---", error);
    if (conn) await conn.close();
    return <div className="p-20 text-center font-black uppercase text-red-600">Gagal Memuat Laporan Statistik</div>;
  }
}