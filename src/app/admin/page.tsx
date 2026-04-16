import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import { 
  InboxIcon, 
  CheckCircleIcon, 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default async function AdminDashboard() {
  const conn = await getConnection();
  
  // Ambil statistik permohonan secara real-time dari database
  const stats: any = await conn.execute(
    `SELECT 
        COUNT(*) as TOTAL,
        COUNT(CASE WHEN "STATUS_SAAT_INI" = 'Permohonan Baru' THEN 1 END) as BARU,
        COUNT(CASE WHEN "STATUS_SAAT_INI" LIKE 'Proses%' OR "STATUS_SAAT_INI" LIKE 'Validasi%' THEN 1 END) as PROSES,
        COUNT(CASE WHEN "STATUS_SAAT_INI" = 'Selesai - Sertifikat Terbit' THEN 1 END) as SELESAI
     FROM "SYSTEM"."PERMOHONAN_HEADER"`,
    [],
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  
  const data = stats.rows[0];
  await conn.close();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[#1A1A1A] uppercase tracking-tight">Dashboard Ringkasan</h1>
        <p className="text-gray-500 text-sm">Selamat datang di Panel Kontrol Pelayanan NSN.</p>
      </div>

      {/* Grid Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Masuk" value={data.TOTAL} icon={InboxIcon} color="bg-blue-500" />
        <StatCard title="Perlu Verifikasi" value={data.BARU} icon={ExclamationTriangleIcon} color="bg-orange-500" />
        <StatCard title="Sedang Diproses" value={data.PROSES} icon={ArrowPathIcon} color="bg-[#800000]" />
        <StatCard title="Selesai" value={data.SELESAI} icon={CheckCircleIcon} color="bg-green-500" />
      </div>

      {/* Section Tambahan (Akan kita isi dengan Aktivitas Terakhir nanti) */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center">
         <div className="text-gray-300 mb-2">
            <ChartBarIcon className="w-12 h-12 mx-auto" />
         </div>
         <p className="text-gray-400 text-sm font-medium">Grafik aktivitas mingguan akan muncul di sini <br/>setelah lebih banyak data masuk.</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]">
      <div className={`${color} p-3 rounded-lg text-white`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black text-gray-900">{value}</p>
      </div>
    </div>
  );
}