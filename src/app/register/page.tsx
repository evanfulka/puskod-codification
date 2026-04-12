'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { registerAction } from '../auth-actions';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6">
      <Link href="/" className="flex items-center gap-3 mb-8">
        <Image src="/images/logo-puskod.png" alt="Logo Puskod" width={60} height={60} />
        <div>
          <h1 className="text-xl font-bold text-[#800000] uppercase leading-tight">Pelayanan NSN</h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Pusat Kodifikasi</p>
        </div>
      </Link>

      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-center mb-2">Daftar Akun Baru</h2>
        <p className="text-gray-500 text-sm text-center mb-8">Lengkapi data di bawah untuk mulai mengajukan NSN</p>

        {/* Notifikasi Error jika registrasi gagal (misal email duplikat) */}
        {state?.success === false && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium">
            {state.message}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Nama Lengkap (Point of Contact)</label>
            <input 
              name="namaLengkap" 
              type="text" 
              required
              placeholder="Masukkan nama lengkap Anda" 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none transition" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Email</label>
            <input 
              name="email" 
              type="email" 
              required
              placeholder="contoh@perusahaan.com" 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none transition" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Nama Perusahaan</label>
            <input 
              name="namaPerusahaan" 
              type="text" 
              required
              placeholder="Contoh: PT. Dirgantara Indonesia" 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none transition" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Nomor Telepon (WhatsApp)</label>
            <input 
              name="noTelp" 
              type="tel" 
              required
              placeholder="0812xxxxxxxx" 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none transition" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Password</label>
              <input 
                name="password" 
                type="password" 
                required
                placeholder="••••••••" 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none transition" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Konfirmasi</label>
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none transition" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#800000] text-white font-bold py-3 rounded-lg mt-4 hover:bg-red-900 transition shadow-md disabled:bg-gray-400"
          >
            {isPending ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Sudah memiliki akun? <Link href="/login" className="text-[#800000] font-bold hover:underline">Masuk di sini</Link>
        </p>
      </div>
      <p className="text-xs text-gray-400 mt-12">© 2026 Pusat Kodifikasi Kementerian Pertahanan RI</p>
    </div>
  );
}