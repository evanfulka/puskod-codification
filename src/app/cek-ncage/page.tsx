'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export default function CekNcagePage() {
  const [ncage, setNcage] = useState('');
  const [loading, setLoading] = useState(false);
  // Gabungkan semua state modal menjadi satu objek config
  const [modalConfig, setModalConfig] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    target?: string;
  } | null>(null);

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

      // Set data ke modal, jangan langsung redirect
      setModalConfig({
        show: true,
        type: data.type,
        title: data.title,
        message: data.message,
        target: data.target
      });

    } catch (err) {
      setModalConfig({
        show: true,
        type: 'error',
        title: 'Koneksi Gagal',
        message: 'Tidak dapat terhubung ke server. Pastikan koneksi internet Anda stabil.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalAction = () => {
    if (modalConfig?.target) {
      router.push(modalConfig.target);
    }
    setModalConfig(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1A1A1A] flex flex-col">
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
          <Link href="/pantau-status" className="hover:text-[#800000]">Pantau Status</Link>
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

      {/* Modal Dinamis */}
      {modalConfig?.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl text-center">
            {/* Icon Dinamis Berdasarkan Tipe */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              modalConfig.type === 'success' ? 'bg-green-50 text-green-600' : 
              modalConfig.type === 'info' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
            }`}>
              {modalConfig.type === 'success' && <CheckCircle2 size={32} />}
              {modalConfig.type === 'info' && <Info size={32} />}
              {modalConfig.type === 'error' && <AlertCircle size={32} />}
            </div>

            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">{modalConfig.title}</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {modalConfig.message}
            </p>

            <button
              onClick={handleModalAction}
              className={`w-full py-3 rounded-lg font-bold text-white transition ${
                modalConfig.type === 'error' ? 'bg-gray-800 hover:bg-black' : 'bg-[#800000] hover:bg-red-900'
              }`}
            >
              {modalConfig.target ? 'Lanjutkan' : 'Tutup'}
            </button>
          </div>
        </div>
      )}

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