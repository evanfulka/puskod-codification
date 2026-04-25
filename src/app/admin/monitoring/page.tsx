import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import Link from 'next/link';
import { 
  ArrowRight, LayoutGrid, 
  Clock, CheckCircle2, AlertCircle, FileText,
  ChevronLeft, ChevronRight 
} from 'lucide-react';

export default async function MonitoringListPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const conn = await getConnection();
  
  // Konfigurasi Paginasi
  const currentPage = Number(searchParams.page) || 1;
  const pageSize = 10;
  const offset = (currentPage - 1) * pageSize;

  // Ambil data dengan OFFSET dan FETCH (Oracle 12c+)
  const result: any = await conn.execute(
    `SELECT "ID_PERMOHONAN", "NAMA_PERUSAHAAN", "NCAGE", "NO_KONTRAK", "PENGADAAN", "STATUS_SAAT_INI" 
     FROM "SYSTEM"."PERMOHONAN_HEADER" 
     ORDER BY "ID_PERMOHONAN" DESC
     OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
    { offset: offset, limit: pageSize }, 
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  // Ambil total data untuk menghitung halaman
  const countResult: any = await conn.execute(
    `SELECT COUNT(*) as TOTAL FROM "SYSTEM"."PERMOHONAN_HEADER"`,
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  
  await conn.close();

  const permohonan = result.rows;
  const totalData = countResult.rows[0].TOTAL;
  const totalPages = Math.ceil(totalData / pageSize);

  return (
    <div className="p-8 space-y-8 bg-gray-50/30 min-h-screen">
      {/* HEADER & STATS */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">
            Monitoring Keseluruhan
          </h1>
          <p className="text-sm text-gray-500 font-medium">Pantau seluruh track record permohonan NSN secara real-time.</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-white border px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                <LayoutGrid size={16} className="text-gray-400" />
                <span className="text-xs font-black uppercase">{totalData} Total Data</span>
            </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">ID</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Nama Perusahaan / Pengadaan</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">NCAGE / Kontrak</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Status Terkini</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {permohonan.map((item: any) => (
                <tr key={item.ID_PERMOHONAN} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-6 text-sm font-black text-gray-300 italic">
                    #{item.ID_PERMOHONAN}
                  </td>
                  <td className="px-6 py-6">
                    <p className="font-black text-gray-900 uppercase tracking-tight leading-none mb-1">
                        {item.NAMA_PERUSAHAAN}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase line-clamp-1">
                        {item.PENGADAAN}
                    </p>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-gray-100 rounded font-mono text-[10px] font-black">
                            {item.NCAGE || 'N/A'}
                        </span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase truncate max-w-[150px]">
                        {item.NO_KONTRAK || 'No Contract'}
                    </p>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex justify-center">
                        <StatusBadge status={item.STATUS_SAAT_INI} />
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <Link 
                        href={`/admin/monitoring/${item.ID_PERMOHONAN}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#800000] transition-all shadow-md active:scale-95 group"
                    >
                        Track Record <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EMPTY STATE */}
        {permohonan.length === 0 && (
            <div className="p-20 text-center space-y-4">
                <FileText size={48} className="mx-auto text-gray-200" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Belum ada permohonan masuk</p>
            </div>
        )}

        {/* PAGINATION CONTROLS */}
        {totalData > 0 && (
          <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex gap-2">
              <Link
                href={`?page=${Math.max(1, currentPage - 1)}`}
                className={`p-2 rounded-lg border transition-all ${
                  currentPage <= 1 
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                  : 'bg-white text-gray-600 hover:border-gray-900 hover:text-gray-900 shadow-sm'
                }`}
              >
                <ChevronLeft size={16} />
              </Link>
              <Link
                href={`?page=${Math.min(totalPages, currentPage + 1)}`}
                className={`p-2 rounded-lg border transition-all ${
                  currentPage >= totalPages 
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                  : 'bg-white text-gray-600 hover:border-gray-900 hover:text-gray-900 shadow-sm'
                }`}
              >
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// HELPER COMPONENT UNTUK BADGE STATUS
function StatusBadge({ status }: { status: string }) {
  let style = "bg-gray-100 text-gray-500 border-gray-200";
  let icon = <Clock size={12} />;

  if (status === 'Selesai') {
    style = "bg-green-100 text-green-700 border-green-200";
    icon = <CheckCircle2 size={12} />;
  } else if (status === 'Perbaikan Berkas') {
    style = "bg-red-100 text-red-700 border-red-200";
    icon = <AlertCircle size={12} />;
  } else if (status === 'Proses Pengerjaan Kodifikasi') {
    style = "bg-blue-100 text-blue-700 border-blue-200";
    icon = <Clock size={12} />;
  } else if (status === 'Permohonan Baru') {
    style = "bg-orange-100 text-orange-700 border-orange-200";
    icon = <Clock size={12} />;
  }

  return (
    <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap ${style}`}>
      {icon} {status}
    </div>
  );
}