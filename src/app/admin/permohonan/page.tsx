import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export default async function AdminPermohonanPage() {
  const conn = await getConnection();
  let listPermohonan: any[] = [];

  try {
    // Ambil data yang sudah dikirim (Bukan 'Draft')
    const result = await conn.execute(
      `SELECT 
        p.ID_PERMOHONAN, 
        p.PERMINTAAN_DARI, 
        p.NAMA_BARANG, 
        p.STATUS_PENGAJUAN, 
        p.TANGGAL_INPUT,
        u.NAMA_LENGKAP_POC
       FROM PERMOHONAN_NSN p
       JOIN USERS u ON p.ID_USER = u.ID_USER
       WHERE p.STATUS_PENGAJUAN != 'Draft'
       ORDER BY p.TANGGAL_INPUT DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    listPermohonan = result.rows || [];
  } catch (err) {
    console.error("Gagal mengambil data permohonan admin:", err);
  } finally {
    await conn.close();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Permohonan NSN</h1>
        <p className="text-sm text-gray-500">Kelola dan verifikasi pengajuan kodifikasi materiil dari pemohon.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {listPermohonan.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {listPermohonan.map((p: any) => (
              <Link 
                key={p.ID_PERMOHONAN} 
                href={`/admin/permohonan/${p.ID_PERMOHONAN}`}
                className="flex items-center justify-between p-6 hover:bg-gray-50 transition group"
              >
                <div className="flex items-center gap-6">
                  {/* Badge ID */}
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-[#800000] font-bold">
                    <span className="text-[10px] text-gray-400 uppercase">ID</span>
                    <span className="text-sm">{p.ID_PERMOHONAN}</span>
                  </div>

                  {/* Informasi Utama */}
                  <div>
                    <h4 className="font-bold text-gray-800 group-hover:text-[#800000] transition">
                      {p.NAMA_BARANG || 'Tanpa Nama Barang'}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="font-semibold text-gray-700">{p.PERMINTAAN_DARI}</span>
                      <span>•</span>
                      <span>POC: {p.NAMA_LENGKAP_POC}</span>
                      <span>•</span>
                      <span>{new Date(p.TANGGAL_INPUT).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Status Badge */}
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                    p.STATUS_PENGAJUAN === 'Menunggu Verifikasi' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    p.STATUS_PENGAJUAN === 'Verifikasi Teknis' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    p.STATUS_PENGAJUAN === 'Sertifikat Terbit' ? 'bg-green-50 text-green-600 border border-green-100' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {p.STATUS_PENGAJUAN}
                  </span>
                  
                  <ChevronRightIcon className="w-5 h-5 text-gray-300 group-hover:text-[#800000] transition" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center">
            <p className="text-gray-400 font-medium">Belum ada permohonan yang masuk untuk saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}