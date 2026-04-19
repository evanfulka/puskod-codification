import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { EyeIcon, ClockIcon, InboxStackIcon } from '@heroicons/react/24/outline';

const SECRET_KEY = new TextEncoder().encode('rahasia_puskod_kemhan_2026');

export default async function AdminPermohonanPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  // Ambil Role dan User ID dari Token
  let role = '';
  let userId = null;
  if (token) {
    const { payload }: any = await jwtVerify(token, SECRET_KEY);
    role = payload.role;
    userId = payload.userId;
  }

  const conn = await getConnection();

  // Logika Query Berdasarkan Role (Pemisahan Antrean Kerja)
  let query = `
    SELECT 
      "ID_PERMOHONAN", 
      "NAMA_PERUSAHAAN", 
      "NO_SURAT_PERMOHONAN", 
      "PENGADAAN", 
      "STATUS_SAAT_INI",
      TO_CHAR("TANGGAL_SUBMIT", 'DD/MM/YYYY HH24:MI') as TGL
    FROM "SYSTEM"."PERMOHONAN_HEADER"
    WHERE "STATUS_SAAT_INI" IN ('Permohonan Baru', 'Verifikasi Berkas', 'Terbitkan SPRIN')
  `;
  
  let params: any = [];

  if (role === 'STAF_PUSKOD') {
    // Staf hanya melihat berkas baru yang perlu dicek administrasinya
    query += ` AND "STATUS_SAAT_INI" IN ('Permohonan Baru', 'Verifikasi Berkas')`;
  }
  // ADMINISTRATOR tidak difilter (bisa lihat semua status)

  query += ` ORDER BY "TANGGAL_SUBMIT" DESC`;

  const result: any = await conn.execute(query, params, { outFormat: oracledb.OUT_FORMAT_OBJECT });
  const permohonanList = result.rows;
  await conn.close();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[#1A1A1A] uppercase tracking-tight flex items-center gap-3">
            <InboxStackIcon className="w-8 h-8 text-[#800000]" />
            Antrean Permohonan
          </h1>
          <p className="text-gray-500 text-sm">Menampilkan data sesuai dengan wewenang akses: <span className="font-bold text-[#800000]">{role?.replace('_', ' ')}</span></p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-400 shadow-sm">
          {permohonanList.length} BERKAS DITEMUKAN
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Perusahaan & Proyek</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Tanggal Masuk</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {permohonanList.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm italic">
                        Tidak ada permohonan dalam antrean pengerjaan Anda saat ini.
                    </td>
                </tr>
            ) : (
                permohonanList.map((p: any) => (
                <tr key={p.ID_PERMOHONAN} className="hover:bg-gray-50/50 transition group">
                    <td className="px-6 py-4">
                        <div className="font-bold text-sm text-[#1A1A1A] group-hover:text-[#800000] transition-colors">{p.NAMA_PERUSAHAAN}</div>
                        <div className="text-[11px] text-gray-500 uppercase tracking-tight font-medium">{p.PENGADAAN}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            <ClockIcon className="w-3.5 h-3.5" />
                            {p.TGL}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm ${getStatusStyle(p.STATUS_SAAT_INI)}`}>
                            {p.STATUS_SAAT_INI}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <Link 
                            href={`/admin/permohonan/${p.ID_PERMOHONAN}`}
                            className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#800000] transition shadow-md active:scale-95"
                        >
                            <EyeIcon className="w-4 h-4" />
                            Detail & Proses
                        </Link>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getStatusStyle(status: string) {
    switch (status) {
        case 'Permohonan Baru': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'Terbitkan SPRIN': return 'bg-purple-50 text-purple-600 border-purple-100';
        case 'Proses Pengerjaan Kodifikasi': return 'bg-orange-50 text-orange-600 border-orange-100';
        case 'Selesai - Sertifikat Terbit': return 'bg-green-50 text-green-600 border-green-100';
        default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
}