import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default async function ValidasiPage() {
  const conn = await getConnection();
  
  // Ambil semua data yang sudah masuk tahap validasi hingga selesai
  const result: any = await conn.execute(
    `SELECT "ID_PERMOHONAN", "NAMA_PERUSAHAAN", "PENGADAAN", "STATUS_SAAT_INI" 
     FROM "SYSTEM"."PERMOHONAN_HEADER" 
     WHERE "STATUS_SAAT_INI" IN ('Berita Acara dan Hasil Kodifikasi',
    'Verifikasi Data Materiil dengan Mitra',
    'Validasi Data Kodifikasi',
    'Sertifikat Kodifikasi',
    'Selesai')
     ORDER BY CASE WHEN "STATUS_SAAT_INI" = 'Selesai' THEN 1 ELSE 0 END, "ID_PERMOHONAN" DESC`,
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  await conn.close();

  const waitingCount = result.rows.filter((item: any) => item.STATUS_SAAT_INI !== 'Selesai').length;

  return (
    <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Validasi & Output</h1>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Manajemen dokumen hasil kodifikasi dan sertifikasi.</p>
        </div>
        <div className="bg-[#800000] px-5 py-2.5 rounded-2xl border border-[#800000]/20 text-white text-xs font-black uppercase tracking-[0.1em] shadow-lg shadow-[#800000]/20">
            {waitingCount} Proyek Menunggu
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {result.rows.map((item: any) => {
          const isSelesai = item.STATUS_SAAT_INI === 'Selesai';
          
          return (
            <div 
              key={item.ID_PERMOHONAN} 
              className={`rounded-[2rem] border p-7 transition-all duration-300 group shadow-sm ${
                isSelesai 
                ? 'bg-green-50/50 border-green-200 hover:shadow-green-200/50 hover:bg-green-50' 
                : 'bg-red-50/50 border-red-200 hover:shadow-red-200/50 hover:bg-red-50'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl transition-all duration-300 ${
                    isSelesai 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-200' 
                    : 'bg-red-600 text-white shadow-lg shadow-red-200'
                  }`}>
                      {isSelesai ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                  </div>
                  <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest shadow-sm ${
                    isSelesai 
                    ? 'bg-green-200/50 text-green-700' 
                    : 'bg-red-200/50 text-red-700'
                  }`}>
                      {item.STATUS_SAAT_INI}
                  </span>
              </div>
              
              <div className="space-y-2 mb-8">
                <h3 className="font-black text-xl text-gray-900 uppercase leading-tight line-clamp-2">
                  {item.NAMA_PERUSAHAAN}
                </h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-tight line-clamp-2 opacity-70">
                  {item.PENGADAAN}
                </p>
              </div>
              
              <Link 
                  href={`/admin/validasi/${item.ID_PERMOHONAN}`}
                  className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ${
                    isSelesai
                    ? 'bg-white text-green-700 border border-green-200 hover:bg-green-600 hover:text-white'
                    : 'bg-[#1A1A1A] text-white hover:bg-red-700'
                  }`}
              >
                  {isSelesai ? 'Buka Arsip' : 'Kelola Dokumen'} <ArrowRight size={16} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}