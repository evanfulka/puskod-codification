'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { loginAction } from '../auth-actions';

export default function LoginPage() {
  // state menampung return dari loginAction { success, message }
  const [state, formAction, isPending] = useActionState(loginAction, null);

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
        <h2 className="text-2xl font-bold text-center mb-2">Masuk ke Portal</h2>
        <p className="text-gray-500 text-sm text-center mb-8">Gunakan akun perusahaan Anda untuk masuk</p>

        {/* Notifikasi Error */}
        {state?.success === false && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium">
            {state.message}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Email</label>
            <input 
              name="email" 
              type="email" 
              required
              placeholder="Masukkan email Anda" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none transition" 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <Link href="/lupa-password" className="text-xs text-[#800000] hover:underline">Lupa password?</Link>
            </div>
            <input 
              name="password" 
              type="password" 
              required
              placeholder="••••••••" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none transition" 
            />
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#800000] text-white font-bold py-3 rounded-lg hover:bg-red-900 transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? 'Menghubungkan ke Server...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-8">
          Belum punya akun? <Link href="/register" className="text-[#800000] font-bold hover:underline">Daftar di sini</Link>
        </p>
      </div>
      <p className="text-xs text-gray-400 mt-12">© 2026 Pusat Kodifikasi Kementerian Pertahanan RI</p>
    </div>
  );
}