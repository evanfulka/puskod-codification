'use client';

import { useActionState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { registerAction } from '../auth-actions';

function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const searchParams = useSearchParams();

  // Ambil data dari URL hasil pengecekan NCAGE
  const ncageFromUrl = searchParams.get('ncage') || '';
  const nameFromUrl = searchParams.get('name') || '';

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-center mb-2">Daftar Akun POC</h2>
      <p className="text-gray-500 text-sm text-center mb-8">Lengkapi data akun perusahaan Anda</p>
      {state?.success === true && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-green-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Registrasi Berhasil!</h3>
            <p className="text-sm text-gray-500 mb-6">
              Akun POC perusahaan Anda telah terdaftar. Silakan masuk untuk memulai pengajuan NSN.
            </p>
            <Link
              href="/login"
              className="block w-full bg-[#800000] text-white py-3 rounded-lg font-bold hover:bg-red-900 transition"
            >
              Masuk ke Portal
            </Link>
          </div>
        </div>
      )}
      {state?.success === false && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium">
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="block text-sm font-semibold mb-1 text-gray-700">NCAGE</label>
            <input 
              name="ncageKode"
              type="text" 
              defaultValue={ncageFromUrl}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium focus:ring-2 focus:ring-[#800000] outline-none transition" 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Nama Perusahaan</label>
            <input 
              name="namaPerusahaan"
              type="text" 
              defaultValue={nameFromUrl}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium focus:ring-2 focus:ring-[#800000] outline-none transition truncate" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Nama Lengkap POC</label>
          <input 
            name="namaLengkap" 
            type="text" 
            required
            placeholder="Nama penanggung jawab" 
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] outline-none transition" 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Email Perusahaan</label>
          <input 
            name="email" 
            type="email" 
            required
            placeholder="email@perusahaan.com" 
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] outline-none transition" 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Nomor WhatsApp</label>
          <input 
            name="noTelp" 
            type="tel" 
            required
            placeholder="0812xxxxxxxx" 
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] outline-none transition" 
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
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] outline-none transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Konfirmasi</label>
            <input 
              name="confirmPassword"
              type="password" 
              required
              placeholder="••••••••" 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] outline-none transition" 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-[#800000] text-white font-bold py-3 rounded-lg mt-4 hover:bg-red-900 transition shadow-md disabled:bg-gray-400"
        >
          {isPending ? 'Memproses...' : 'Selesaikan Pendaftaran'}
        </button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6">
      <Link href="/" className="flex items-center gap-3 mb-8">
        <Image src="/images/logo-puskod.png" alt="Logo Puskod" width={60} height={60} />
        <div>
          <h1 className="text-xl font-bold text-[#800000] uppercase leading-tight">Pelayanan NSN</h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Pusat Kodifikasi</p>
        </div>
      </Link>

      <Suspense fallback={<div className="text-[#800000] font-bold">Memuat data NCAGE...</div>}>
        <RegisterForm />
      </Suspense>

      <p className="text-center text-sm text-gray-600 mt-6">
        Sudah memiliki akun? <Link href="/login" className="text-[#800000] font-bold hover:underline">Masuk di sini</Link>
      </p>
      <p className="text-xs text-gray-400 mt-8">© 2026 Pusat Kodifikasi Kementerian Pertahanan RI</p>
    </div>
  );
}