'use client';

import Link from 'next/link';
import { PlusIcon, ClipboardDocumentListIcon, ClockIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function DashboardPemohon() {
  // Data ini nantinya akan kita tarik dari Oracle
  const listPermohonan = []; // Sementara kosong

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8">
      <div className="max-w-6xl mx-auto">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-gray-500 hover:text-[#800000] mb-6 transition w-fit"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="text-sm font-bold">Kembali ke Halaman Utama</span>
        </Link>
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Pemohon</h1>
            <p className="text-gray-500">Selamat datang di Portal Layanan NSN Puskod Kemhan</p>
          </div>
          <Link 
            href="/dashboard/pemohon/baru" 
            className="flex items-center gap-2 bg-[#800000] text-white px-6 py-3 rounded-lg font-bold hover:bg-red-900 transition shadow-md"
          >
            <PlusIcon className="w-5 h-5" />
            Buat Permohonan Baru
          </Link>
        </div>

        {/* Stats Sederhana */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><ClockIcon className="w-6 h-6" /></div>
            <div><p className="text-sm text-gray-500 font-medium">Sedang Diproses</p><p className="text-xl font-bold">0</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg text-green-600"><CheckCircleIcon className="w-6 h-6" /></div>
            <div><p className="text-sm text-gray-500 font-medium">Sertifikat Terbit</p><p className="text-xl font-bold">0</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-lg text-red-600"><ClipboardDocumentListIcon className="w-6 h-6" /></div>
            <div><p className="text-sm text-gray-500 font-medium">Perlu Revisi</p><p className="text-xl font-bold">0</p></div>
          </div>
        </div>

        {/* Tabel List Permohonan */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-700">Daftar Pengajuan NSN Anda</h3>
          </div>
          <div className="p-12 text-center">
            <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
              <ClipboardDocumentListIcon className="w-12 h-12 text-gray-300" />
            </div>
            <p className="text-gray-500">Belum ada pengajuan. Klik tombol di atas untuk memulai.</p>
          </div>
        </div>
      </div>
    </div>
  );
}