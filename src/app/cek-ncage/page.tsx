'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, AlertCircle, X } from 'lucide-react';

export default function CekNcagePage() {
  const [ncage, setNcage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleCheckNcage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ncage) return;

    setLoading(true);
    try {
      const res = await fetch('/api/check-ncage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ncageCode: ncage.toUpperCase() }),
      });

      const data = await res.json();

      if (data.exists) {
        router.push(data.target);
      } else {
        setErrorMessage(data.message);
        setShowError(true);
      }
    } catch (err) {
      setErrorMessage("Terjadi kesalahan koneksi ke server.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1A1A1A] flex flex-col">
      {/* Navbar - Konsisten dengan HomePage */}
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
          <Link href="/dashboard/pemohon/baru" className="hover:text-[#800000]">Pendaftaran NSN</Link>
          <Link href="/dashboard/pemohon" className="hover:text-[#800000]">Dashboard Pantau Status</Link>
          <Link href="/cek-ncage" className="text-[#800000]">Cek NCAGE</Link>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-4">
            <Link href="/login" className="text-[#800000] font-bold py-2 px-4">Masuk</Link>
            <Link href="/register" className="bg-[#800000] text-white px-6 py-2 rounded-full font-bold">Daftar</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full text-center space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
            Validasi Kode NCAGE
          </h2>
          <p className="text-gray-600">
            Sistem akan memeriksa ketersediaan kode NCAGE Anda di database Pusat Kodifikasi sebelum melanjutkan proses pendaftaran.
          </p>

          <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-100 mt-8">
            <form onSubmit={handleCheckNcage} className="space-y-6">
              <div className="text-left">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Masukkan Kode NCAGE Perusahaan
                </label>
                <input
                  type="text"
                  value={ncage}
                  onChange={(e) => setNcage(e.target.value)}
                  placeholder="Contoh: 1234Z"
                  className="w-full px-6 py-4 bg-[#FDFBF7] border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#800000] outline-none text-2xl font-bold tracking-widest text-center uppercase"
                  maxLength={5}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#800000] text-white py-4 rounded-lg font-bold text-lg hover:bg-red-900 transition shadow-md disabled:opacity-50"
              >
                {loading ? "Memeriksa..." : "Periksa Database"}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Modal Error */}
      {showError && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-red-600 mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Pendaftaran Ditolak</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={() => setShowError(false)}
              className="w-full bg-[#1A1A1A] text-white py-3 rounded-lg font-bold hover:bg-black transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Footer - Konsisten dengan HomePage */}
      <footer className="bg-[#1A1A1A] text-white py-12 px-12">
        <p className="text-center text-gray-500 text-xs">
          © 2026 Pusat Kodifikasi, Baranahan, Kementerian Pertahanan Republik Indonesia.
        </p>
      </footer>
    </div>
  );
}