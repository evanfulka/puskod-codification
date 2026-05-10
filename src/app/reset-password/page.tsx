'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

// Pisahkan komponen form yang menggunakan useSearchParams ke dalam komponen terpisah
// Ini praktik terbaik di Next.js untuk menghindari error build saat menggunakan parameter URL
function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi dasar
    if (!token) {
      setStatus('error');
      setMessage('Tautan tidak valid atau token hilang dari URL.');
      return;
    }

    if (newPassword.length < 6) {
      setStatus('error');
      setMessage('Password harus memiliki minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Konfirmasi password tidak cocok.');
      return;
    }

    setStatus('loading');
    
    try {
      // Kita akan membuat API endpoint ini di langkah selanjutnya
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Password berhasil diubah. Mengalihkan ke halaman login...');
        // Alihkan ke halaman login setelah 3 detik
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Terjadi kesalahan saat mereset password.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Tidak dapat terhubung ke server. Pastikan koneksi internet Anda stabil.');
    }
  };

  // Jika tidak ada token di URL, tampilkan pesan error langsung
  if (!token) {
    return (
      <div className="text-center p-6 bg-red-50 border border-red-200 rounded-xl">
        <AlertCircle className="text-red-600 mx-auto mb-3" size={32} />
        <h3 className="text-lg font-bold text-red-800 mb-2">Tautan Tidak Valid</h3>
        <p className="text-sm text-red-600">
          Token keamanan tidak ditemukan pada tautan ini. Silakan ulangi proses lupa password.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-[#E5E7EB]">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Buat Password Baru</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Silakan masukkan password baru untuk akun perusahaan Anda.
        </p>
      </div>

      {status === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-green-800">{message}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-red-800">{message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Password Baru</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full pl-10 pr-4 py-3 bg-[#FDFBF7] border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#800000] outline-none transition"
              required
              disabled={status === 'loading' || status === 'success'}
              minLength={6}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Konfirmasi Password Baru</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className="w-full pl-10 pr-4 py-3 bg-[#FDFBF7] border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#800000] outline-none transition"
              required
              disabled={status === 'loading' || status === 'success'}
              minLength={6}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={status === 'loading' || status === 'success'}
          className="w-full bg-[#800000] hover:bg-red-900 text-white py-3 px-6 rounded-lg font-bold transition shadow-sm disabled:opacity-50 flex justify-center items-center mt-4"
        >
          {status === 'loading' ? 'Menyimpan...' : 'Simpan Password Baru'}
        </button>
      </form>
    </div>
  );
}

// Komponen utama yang dibungkus Suspense
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] font-sans text-[#1A1A1A] p-6">
      {/* Header/Logo section */}
      <div className="mb-8 text-center flex flex-col items-center">
        <Image src="/images/logo-puskod.png" alt="Logo Puskod" width={70} height={70} className="mb-4" />
        <h1 className="text-2xl font-bold text-[#800000] uppercase tracking-tight">Pelayanan NSN</h1>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Pusat Kodifikasi</p>
      </div>

      <Suspense fallback={<div className="text-[#800000] font-bold">Memuat halaman...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}