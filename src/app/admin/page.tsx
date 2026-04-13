import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import { 
  ClipboardDocumentListIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default async function AdminDashboardPage() {
  const conn = await getConnection();
  let stats = {
    total: 0,
    menungguVerifikasi: 0,
    verifikasiTeknis: 0,
    menungguPersetujuan: 0,
    terbit: 0,
    revisi: 0
  };

  try {
    // Query untuk menghitung jumlah berdasarkan status
    const result = await conn.execute(
      `SELECT STATUS_PENGAJUAN, COUNT(*) as JUMLAH 
       FROM PERMOHONAN_NSN 
       WHERE STATUS_PENGAJUAN != 'Draft'
       GROUP BY STATUS_PENGAJUAN`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = result.rows as any[];
    rows.forEach(row => {
      stats.total += row.JUMLAH;
      if (row.STATUS_PENGAJUAN === 'Menunggu Verifikasi') stats.menungguVerifikasi = row.JUMLAH;
      if (row.STATUS_PENGAJUAN === 'Verifikasi Teknis') stats.verifikasiTeknis = row.JUMLAH;
      if (row.STATUS_PENGAJUAN === 'Menunggu Persetujuan') stats.menungguPersetujuan = row.JUMLAH;
      if (row.STATUS_PENGAJUAN === 'Sertifikat Terbit') stats.terbit = row.JUMLAH;
      if (row.STATUS_PENGAJUAN === 'Perlu Revisi') stats.revisi = row.JUMLAH;
    });

  } catch (err) {
    console.error("Gagal memuat statistik admin:", err);
  } finally {
    await conn.close();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Ringkasan Operasional</h1>
        <p className="text-sm text-gray-500">Pantau progres kodifikasi materiil secara keseluruhan.</p>
      </div>

      {/* Baris Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard 
          label="Total Masuk" 
          value={stats.total} 
          icon={<ClipboardDocumentListIcon className="w-6 h-6" />} 
          color="bg-gray-100 text-gray-600" 
        />
        <StatCard 
          label="Verif. Berkas" 
          value={stats.menungguVerifikasi} 
          icon={<ClockIcon className="w-6 h-6" />} 
          color="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          label="Verif. Teknis" 
          value={stats.verifikasiTeknis} 
          icon={<DocumentMagnifyingGlassIcon className="w-6 h-6" />} 
          color="bg-amber-50 text-amber-600" 
        />
        <StatCard 
          label="Siap Terbit" 
          value={stats.menungguPersetujuan} 
          icon={<CheckCircleIcon className="w-6 h-6" />} 
          color="bg-green-50 text-green-600" 
        />
        <StatCard 
          label="Perlu Revisi" 
          value={stats.revisi} 
          icon={<ExclamationTriangleIcon className="w-6 h-6" />} 
          color="bg-red-50 text-red-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visualisasi Sederhana: Grafik Batang CSS */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-6 text-sm uppercase tracking-wider">Beban Kerja Petugas</h3>
          <div className="space-y-4">
            <ProgressBar label="Staf Puskod (Verif. Berkas)" value={stats.menungguVerifikasi} total={stats.total} color="bg-blue-500" />
            <ProgressBar label="Kataloger (Verif. Teknis)" value={stats.verifikasiTeknis} total={stats.total} color="bg-amber-500" />
            <ProgressBar label="Pimpinan (Persetujuan)" value={stats.menungguPersetujuan} total={stats.total} color="bg-green-500" />
          </div>
        </div>

        {/* Info Tambahan: Quick Actions */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center text-center">
          <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-[#800000] mx-auto">
            <ClipboardDocumentListIcon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-800">Kelola Permohonan</h3>
          <p className="text-xs text-gray-500 mb-6">Terdapat {stats.menungguVerifikasi + stats.verifikasiTeknis} berkas yang butuh tindakan segera.</p>
          <a 
            href="/admin/permohonan" 
            className="bg-[#800000] text-white py-2 px-6 rounded-lg font-bold text-sm hover:bg-red-900 transition shadow-md"
          >
            Buka Daftar Permohonan
          </a>
        </div>
      </div>
    </div>
  );
}

// Komponen Helper untuk Kartu Statistik
function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
      <div className={`p-2 w-fit rounded-lg mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

// Komponen Helper untuk Progress Bar (Simulasi Grafik)
function ProgressBar({ label, value, total, color }: any) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-400">{value} Berkas</span>
      </div>
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}