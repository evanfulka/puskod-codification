import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

const SECRET_KEY = new TextEncoder().encode('rahasia_puskod_kemhan_2026');

export default async function ValidasiPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token) redirect('/login');

  let role;
  try {
    const { payload }: any = await jwtVerify(token, SECRET_KEY);
    role = payload.role;
  } catch (err) {
    redirect('/login');
  }

  // Cek jika bukan VALTAKOD atau ADMINISTRATOR
  if (role !== 'VALTAKOD' && role !== 'ADMINISTRATOR') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50">
        <div className="p-6 bg-red-100 text-red-600 rounded-full mb-6">
            <ShieldAlert size={64} />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900 mb-2 italic">Akses Terbatas</h1>
        <p className="text-gray-500 max-w-md font-medium">Maaf, hanya personil dengan role <strong>VALTAKOD</strong> atau <strong>ADMINISTRATOR</strong> yang diizinkan mengelola output dokumen.</p>
        <Link href="/admin" className="mt-8 px-8 py-3 bg-[#1A1A1A] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#800000] transition-all">
            Kembali ke Dashboard
        </Link>
      </div>
    );
  }
  // ---------------------

  const conn = await getConnection();
  
  // Ambil semua data yang sudah masuk tahap validasi hingga selesai
  const result: any = await conn.execute(
    `SELECT "ID_PERMOHONAN", "NAMA_PERUSAHAAN", "PENGADAAN", "STATUS_SAAT_INI" 
     FROM "SYSTEM"."PERMOHONAN_HEADER" 
     WHERE "STATUS_SAAT_INI" IN (
        'Berita Acara dan Hasil Kodifikasi',
        'Verifikasi Data Materiil dengan Mitra',
        'Validasi Data Kodifikasi',
        'Sertifikat Kodifikasi',
        'Selesai'
     )
     ORDER BY CASE WHEN "STATUS_SAAT_INI" = 'Selesai' THEN 1 ELSE 0 END, "ID_PERMOHONAN" DESC`,
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  await conn.close();

  const waitingCount = result.rows.filter((item: any) => item.STATUS_SAAT_INI !== 'Selesai').length;

  return (
    <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900 italic">Validasi & <span className="text-[#800000]">Output</span></h1>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Manajemen dokumen hasil kodifikasi dan sertifikasi.</p>
        </div>
        <div className="bg-[#800000] px-5 py-2.5 rounded-2xl border border-[#800000]/20 text-white text-xs font-black uppercase tracking-[0.1em] shadow-lg shadow-[#800000]/20 flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            {waitingCount} Proyek Menunggu
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {result.rows.map((item: any) => {
          const isSelesai = item.STATUS_SAAT_INI === 'Selesai';
          
          return (
            <div 
              key={item.ID_PERMOHONAN} 
              className={`rounded-[2rem] border p-7 transition-all duration-500 group shadow-sm hover:scale-[1.02] ${
                isSelesai 
                ? 'bg-white border-green-200 hover:shadow-green-200/50' 
                : 'bg-white border-red-200 hover:shadow-red-200/50'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl transition-all duration-300 ${
                    isSelesai 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-100' 
                    : 'bg-red-600 text-white shadow-lg shadow-red-100'
                  }`}>
                      {isSelesai ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                  </div>
                  <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full tracking-[0.15em] shadow-sm border ${
                    isSelesai 
                    ? 'bg-green-50 text-green-700 border-green-100' 
                    : 'bg-red-50 text-red-700 border-red-100 animate-pulse'
                  }`}>
                      {item.STATUS_SAAT_INI}
                  </span>
              </div>
              
              <div className="space-y-2 mb-8">
                <h3 className="font-black text-xl text-gray-900 uppercase leading-tight line-clamp-2 italic">
                  {item.NAMA_PERUSAHAAN}
                </h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-tight line-clamp-2 opacity-70">
                  {item.PENGADAAN}
                </p>
              </div>
              
              <Link 
                  href={`/admin/validasi/${item.ID_PERMOHONAN}`}
                  className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-md active:scale-95 ${
                    isSelesai
                    ? 'bg-gray-100 text-gray-900 hover:bg-green-600 hover:text-white'
                    : 'bg-[#1A1A1A] text-white hover:bg-[#800000]'
                  }`}
              >
                  {isSelesai ? 'Buka Arsip' : 'Kelola Dokumen'} <ArrowRight size={16} />
              </Link>
            </div>
          );
        })}
      </div>

      {result.rows.length === 0 && (
          <div className="py-20 text-center">
              <p className="text-gray-400 font-black uppercase tracking-widest italic">Tidak ada antrean validasi dokumen.</p>
          </div>
      )}
    </div>
  );
}