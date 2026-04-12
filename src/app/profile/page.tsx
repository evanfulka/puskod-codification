'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="flex flex-col items-center mb-10">
          <div className="relative group w-32 h-32 mb-4">
            <Image 
              src="/images/default-avatar.png" 
              alt="Profile" 
              width={128} 
              height={128} 
              className="rounded-full object-cover border-4 border-[#800000]" 
            />
            <button className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-[10px] font-bold">
              Ganti Foto
            </button>
          </div>
          <h2 className="text-xl font-bold">Data Profil Perusahaan</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Nama Lengkap POC</label>
            <input type="text" className="w-full p-2 border rounded-md bg-gray-50 text-sm" defaultValue="Evan Fulka Bima Maheswara" />
          </div>
          {/* Tambahkan field lainnya sesuai data registrasi */}
        </div>
        
        <div className="mt-8 flex gap-4">
          <button className="bg-[#800000] text-white px-8 py-2 rounded-md font-bold hover:bg-red-900 transition text-sm">
            Simpan Perubahan
          </button>
          <Link href="/" className="px-8 py-2 border border-gray-300 rounded-md font-bold text-sm hover:bg-gray-50 transition text-center">
            Kembali
          </Link>
        </div>
      </div>
    </div>
  );
}