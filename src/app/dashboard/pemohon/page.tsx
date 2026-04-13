import Link from 'next/link';
import { PlusIcon, ClipboardDocumentListIcon, ClockIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getConnection } from '@/lib/db';

const SECRET_KEY = new TextEncoder().encode('rahasia_puskod_kemhan_2026');

export default async function DashboardPemohon() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;

  // Ambil ID User dari JWT
  let idUser: number;
  try {
    const { payload } = await jwtVerify(sessionToken || '', SECRET_KEY);
    idUser = Number(payload.userId);
  } catch (e) {
    // Jika token tidak valid, arahkan ke login
    return (
      <div className="p-8 text-center">
        <p>Sesi habis, silakan login kembali.</p>
        <Link href="/login" className="text-blue-600 underline">Login</Link>
      </div>
    );
  }

  // Tarik Data dari Oracle
  const conn = await getConnection();
  let listPermohonan: any[] = [];
  let stats = { diproses: 0, terbit: 0, revisi: 0 };

  try {
    // Ambil semua daftar permohonan milik user ini
    const result = await conn.execute(
      `SELECT ID_PERMOHONAN, NAMA_BARANG, STATUS_PENGAJUAN 
       FROM PERMOHONAN_NSN 
       WHERE ID_USER = :1 
       ORDER BY TANGGAL_INPUT DESC`,
      [idUser]
    );
    listPermohonan = result.rows || [];

    // Hitung Stats secara dinamis
    stats.diproses = listPermohonan.filter(p => p[2] === 'Menunggu Verifikasi' || p[2] === 'Sedang Diproses').length;
    stats.terbit = listPermohonan.filter(p => p[2] === 'Sertifikat Terbit' || p[2] === 'Selesai').length;
    stats.revisi = listPermohonan.filter(p => p[2] === 'Perlu Revisi').length;

  } catch (err) {
    console.error("Gagal tarik data dashboard:", err);
  } finally {
    await conn.close();
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-[#800000] mb-6 transition w-fit">
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="text-sm font-bold">Kembali ke Halaman Utama</span>
        </Link>

        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Pemohon</h1>
            <p className="text-gray-500">Selamat datang, {idUser ? 'Evan' : 'User'}</p>
          </div>
          <Link href="/dashboard/pemohon/baru" className="flex items-center gap-2 bg-[#800000] text-white px-6 py-3 rounded-lg font-bold hover:bg-red-900 transition shadow-md">
            <PlusIcon className="w-5 h-5" />
            Buat Permohonan Baru
          </Link>
        </div>

        {/* Stats Dinamis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={<ClockIcon />} label="Sedang Diproses" value={stats.diproses} color="blue" />
          <StatCard icon={<CheckCircleIcon />} label="Sertifikat Terbit" value={stats.terbit} color="green" />
          <StatCard icon={<ClipboardDocumentListIcon />} label="Perlu Revisi" value={stats.revisi} color="red" />
        </div>

        {/* Tabel List Permohonan */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-700">Daftar Pengajuan NSN Anda</h3>
          </div>
          
          {listPermohonan.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Nama Barang</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {listPermohonan.map((row: any) => (
                    <tr key={row[0]} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono text-xs text-gray-400">#{row[0]}</td>
                      <td className="px-6 py-4 font-bold text-gray-700">{row[1] || 'Tanpa Nama'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          row[2] === 'Sertifikat Terbit' ? 'bg-green-100 text-green-700' :
                          row[2] === 'Perlu Revisi' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {row[2]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                <ClipboardDocumentListIcon className="w-12 h-12 text-gray-300" />
              </div>
              <p className="text-gray-500">Belum ada pengajuan. Klik tombol di atas untuk memulai.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Komponen Helper untuk Stats
function StatCard({ icon, label, value, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600"
  };
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}