'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LupaPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.message || 'Terjadi kesalahan sistem.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Tidak dapat terhubung ke server. Pastikan koneksi internet Anda stabil.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] font-sans text-[#1A1A1A] p-6">
      
      {/* Header/Logo section */}
      <div className="mb-8 text-center flex flex-col items-center">
        <Image src="/images/logo-puskod.png" alt="Logo Puskod" width={70} height={70} className="mb-4" />
        <h1 className="text-2xl font-bold text-[#800000] uppercase tracking-tight">Pelayanan NSN</h1>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Pusat Kodifikasi</p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-[#E5E7EB]">
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Lupa Password?</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Masukkan alamat email yang terdaftar pada akun perusahaan Anda. Kami akan mengirimkan tautan untuk mengatur ulang password.
          </p>
        </div>

        {/* Notifikasi */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Terdaftar</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh@perusahaan.com"
                className="w-full pl-10 pr-4 py-3 bg-[#FDFBF7] border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#800000] outline-none transition"
                required
                disabled={status === 'loading' || status === 'success'}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading' || status === 'success'}
            className="w-full bg-[#800000] hover:bg-red-900 text-white py-3 px-6 rounded-lg font-bold transition shadow-sm disabled:opacity-50 flex justify-center items-center"
          >
            {status === 'loading' ? 'Memproses...' : 'Kirim Tautan Reset'}
          </button>
        </form>

        {/* Navigasi Kembali */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#800000] transition">
            <ArrowLeft size={16} />
            Kembali ke halaman Login
          </Link>
        </div>

      </div>
    </div>
  );
}