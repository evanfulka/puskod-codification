'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

interface NavbarProps {
  isLoggedIn: boolean;
}

export default function Navbar({ isLoggedIn }: NavbarProps) {
  const pathname = usePathname();

  // Fungsi kecil untuk menentukan gaya teks berdasarkan URL aktif
  const getLinkClass = (path: string) => {
    return pathname === path ? 'text-[#800000] font-bold' : 'hover:text-[#800000] transition';
  };

  return (
    <nav className="flex items-center justify-between px-12 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Image src="/images/logo-puskod.png" alt="Logo Puskod" width={50} height={50} />
        <div>
          <h1 className="text-sm font-bold text-[#800000] uppercase leading-tight">Pelayanan NSN</h1>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Pusat Kodifikasi</p>
        </div>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
        <Link href="/" className={getLinkClass('/')}>Beranda</Link>
        <Link href="/permohonan-nsn" className={getLinkClass('/permohonan-nsn')}>Permohonan NSN</Link>
        <Link href="/pantau-status" className={getLinkClass('/pantau-status')}>Pantau Status</Link>
        
        {/* Sembunyikan Cek NCAGE jika user sudah login */}
        {!isLoggedIn && (
          <Link href="/cek-ncage" className={getLinkClass('/cek-ncage')}>Cek NCAGE</Link>
        )}
      </div>
      
      <div className="flex items-center gap-6">
        {!isLoggedIn ? (
          <div className="flex gap-4">
            <Link href="/login" className="text-[#800000] font-bold py-2 px-4 hover:bg-gray-50 rounded-lg transition">Masuk</Link>
            <Link href="/register" className="bg-[#800000] text-white px-6 py-2 rounded-full font-bold shadow-sm hover:bg-red-900 transition">Daftar</Link>
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition group">
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-xl hidden group-focus:block p-4 z-[100] text-left">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Notifikasi Terbaru</p>
                <div className="text-sm text-gray-700 border-b pb-2">Berkas permohonan Anda sedang diverifikasi Staf Puskod.</div>
              </div>
            </button>

            <LogoutButton variant="default" />
          </div>
        )}
      </div>
    </nav>
  );
}