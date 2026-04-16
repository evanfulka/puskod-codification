'use client';

import { Search, MapPin, Clock, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function PantauStatusClient({ data }: any) {
  return (
    <div className="space-y-6">
      {/* Search Bar Sederhana */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Cari No. Surat atau Nama Pengadaan..." 
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#800000]"
        />
      </div>

      {/* Table Daftar Permohonan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
              <th className="px-6 py-4">No. Surat / Pengadaan</th>
              <th className="px-6 py-4">Tanggal Submit</th>
              <th className="px-6 py-4">Status Terakhir</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">Belum ada permohonan yang diajukan.</td>
              </tr>
            ) : (
              data.map((item: any) => (
                <tr key={item.ID_PERMOHONAN} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#1A1A1A]">{item.NO_SURAT_PERMOHONAN}</div>
                    <div className="text-xs text-gray-500">{item.PENGADAAN}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={14} /> {item.TGL}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-red-50 text-[#800000] text-[10px] font-bold rounded-full uppercase border border-red-100">
                      {item.STATUS_SAAT_INI}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#800000] hover:underline"
                      onClick={() => alert(`Buka detail ID: ${item.ID_PERMOHONAN}`)} // Nanti kita ganti jadi Modal Tracking
                    >
                      Lihat Progres <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}