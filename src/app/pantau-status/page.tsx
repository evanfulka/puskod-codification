import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import PantauStatusClient from '@/components/PantauStatusClient';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { logoutAction } from '../auth-actions';

const SECRET_KEY = new TextEncoder().encode('rahasia_puskod_kemhan_2026');

export default async function PantauStatusPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session_token');
  const token = cookieStore.get('session_token')?.value;
  if (!token) redirect('/login');

  let listPermohonan = [];

  try {
    const { payload }: any = await jwtVerify(token, SECRET_KEY);
    const conn = await getConnection();

    // Ambil semua permohonan milik user ini
    const result: any = await conn.execute(
      `SELECT 
        "ID_PERMOHONAN", 
        "NO_SURAT_PERMOHONAN", 
        "PENGADAAN", 
        "STATUS_SAAT_INI", 
        "FILE_BA", "FILE_HASIL_KODIFIKASI", "FILE_SERTIFIKAT",
        TO_CHAR("TANGGAL_SUBMIT", 'DD Mon YYYY') as TGL
       FROM "SYSTEM"."PERMOHONAN_HEADER"
       WHERE "ID_USER" = :1
       ORDER BY "TANGGAL_SUBMIT" DESC`,
      [payload.userId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    listPermohonan = result.rows;
    await conn.close();
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-12 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Image src="/images/logo-puskod.png" alt="Logo Puskod" width={50} height={50} />
          <div>
            <h1 className="text-sm font-bold text-[#800000] uppercase leading-tight">Pelayanan NSN</h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Pusat Kodifikasi</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <Link href="/" className="hover:text-[#800000]">Beranda</Link>
          <Link href="/permohonan-nsn" className="hover:text-[#800000]">Permohonan NSN</Link>
          <Link href="/pantau-status" className="text-[#800000]">Pantau Status</Link>
          <Link href="/cek-ncage" className="hover:text-[#800000]">Cek NCAGE</Link>
        </div>
        <div className="flex items-center gap-6">
          {!session ? (
            <div className="flex gap-4">
              <Link href="/login" className="text-[#800000] font-bold py-2 px-4">Masuk</Link>
              <Link href="/register" className="bg-[#800000] text-white px-6 py-2 rounded-full font-bold">Daftar</Link>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              {/* Notifikasi Pop-up */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition group">
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                
                {/* Dropdown Notifikasi Sederhana */}
                <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-xl hidden group-focus:block p-4 z-[100]">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Notifikasi Terbaru</p>
                  <div className="text-sm text-gray-700 border-b pb-2">Berkas permohonan Anda sedang diverifikasi Staf Puskod.</div>
                </div>
              </button>

              {/* Form Logout menggunakan Server Action */}
              <form action={logoutAction}>
                <button 
                  type="submit" 
                  className="bg-[#800000] text-white px-6 py-2 rounded-full font-bold"
                >
                  Keluar
                </button>
              </form>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="flex justify-between items-end mb-8 border-b-2 border-[#800000] pb-4">
          <div>
            <h1 className="text-3xl font-black text-[#800000] uppercase tracking-tighter">Pantau Status Permohonan</h1>
            <p className="text-gray-500 text-sm">Lacak progres kodifikasi materiil pertahanan Anda secara real-time.</p>
          </div>
          <Link 
            href="/permohonan-nsn" 
            className="flex items-center gap-2 bg-[#800000] text-white px-6 py-3 rounded-lg font-bold hover:bg-red-900 transition shadow-lg mb-1"
          >
            <Plus size={20} strokeWidth={3} />
            Buat Permohonan Baru
          </Link>
        </div>

        {/* Kirim data ke Client Component untuk interaksi (seperti buka detail track) */}
        <PantauStatusClient data={listPermohonan} />
      </div>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-12 px-12 mt-20">
        <div className="grid md:grid-cols-3 gap-12 border-b border-gray-800 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image src="/images/logo-puskod.png" alt="Logo Puskod" width={50} height={50} />
              <p className="font-bold text-lg">Pelayanan NSN <br /><span className="text-sm font-normal text-gray-400 text-sm">Pusat Kodifikasi</span></p>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">Jl. Pd. Labu Raya, RT.6/RW.6 Pd. Labu, Cilandak, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Tautan</h4>
            <ul className="text-gray-400 text-sm space-y-2">
              <li><Link href="/">Beranda</Link></li>
              <li><Link href="/permohonan-nsn">Permohonan NSN</Link></li>
              <li><Link href="/pantau-status">Pantau Status</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Kontak</h4>
            <p className="text-gray-400 text-sm">📞 Call Center Puskod: 0812-8882-4545</p>
            <p className="text-gray-400 text-sm mt-2">🕒 Jam Pelayanan: Senin - Jumat, 08:00 - 15:30 WIB</p>
          </div>
        </div>
        <p className="text-center text-gray-500 text-xs mt-8">© 2026 Pusat Kodifikasi, Baranahan, Kementerian Pertahanan Republik Indonesia.</p>
      </footer>
    </div>
  );
}