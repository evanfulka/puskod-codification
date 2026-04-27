'use client';

import { useState } from 'react';
import { 
  Search, Clock, CheckCircle2, AlertCircle, 
  ChevronRight, ArrowUpRight, X, Loader2,
  FileSpreadsheet, FileCheck, Award, Download
} from 'lucide-react';
import TrackRecord from './TrackRecord';
import { getPermohonanLogsAction } from '@/app/auth-actions';
import Link from 'next/link';

export default function PantauStatusClient({ data }: { data: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLogs, setSelectedLogs] = useState<any[] | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleShowProgres = async (id: number, status: string) => {
    setIsLoading(true);
    const res = await getPermohonanLogsAction(id);
    if (res.success) {
      setSelectedLogs(res.logs);
      setSelectedStatus(status);
    } else {
      alert("Gagal memuat progres: " + res.message);
    }
    setIsLoading(false);
  };

  const filteredData = data.filter(item => 
    item.PENGADAAN.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.NO_SURAT_PERMOHONAN.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#800000] transition" size={18} />
        <input 
          type="text" 
          placeholder="Cari berdasarkan nama pengadaan atau nomor surat..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-[#800000]/5 focus:border-[#800000] transition-all font-medium text-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid Permohonan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item) => {
          const isRevisi = item.STATUS_SAAT_INI === 'Perbaikan Berkas';
          const isSelesai = item.STATUS_SAAT_INI === 'Selesai';

          return (
            <div 
              key={item.ID_PERMOHONAN}
              className={`bg-white rounded-[2rem] p-7 border-2 transition-all group flex flex-col justify-between ${
                isRevisi ? 'border-red-500 shadow-xl shadow-red-100 animate-pulse' : 
                isSelesai ? 'border-green-500 shadow-green-50' : 'border-gray-50 hover:border-gray-200 shadow-sm'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-xl ${
                    isRevisi ? 'bg-red-600 text-white' : 
                    isSelesai ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isSelesai ? <CheckCircle2 size={20} /> : isRevisi ? <AlertCircle size={20} /> : <Clock size={20} />}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full ${
                    isRevisi ? 'bg-red-50 text-red-600' : 
                    isSelesai ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                  }`}>
                    {item.STATUS_SAAT_INI}
                  </span>
                </div>

                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.NO_SURAT_PERMOHONAN}</p>
                <h3 className="text-lg font-black text-gray-900 leading-tight uppercase mb-2 line-clamp-2">{item.PENGADAAN}</h3>
                <p className="text-[10px] font-bold text-gray-400 mb-6">Diajukan pada: {item.TGL}</p>
              </div>

              <div className="space-y-3">
                {/* Tombol Lihat Progres */}
                <button 
                  onClick={() => handleShowProgres(item.ID_PERMOHONAN, item.STATUS_SAAT_INI)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white transition group"
                >
                  Lihat Progres <ChevronRight size={14} className="group-hover:translate-x-1 transition" />
                </button>

                {/* Tombol Perbaiki (Muncul hanya saat Revisi) */}
                {isRevisi && (
                  <Link 
                    href={`/permohonan-nsn/edit/${item.ID_PERMOHONAN}`}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-200 transition"
                  >
                    Perbaiki Dokumen <ArrowUpRight size={14} />
                  </Link>
                )}
              </div>

              {isSelesai && (
              <div className="mt-6 pt-6 border-t border-green-100 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-2">Dokumen Hasil Tersedia:</p>
                
                <div className="grid grid-cols-1 gap-2">
                  {/* 1. Download Berita Acara */}
                  <a 
                    href={`${item.FILE_BA}`} 
                    download 
                    className="flex items-center justify-between p-3 bg-white border border-green-200 rounded-xl hover:bg-green-50 transition group"
                  >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition">
                            <FileCheck size={14} />
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-700">Berita Acara</span>
                    </div>
                    <Download size={14} className="text-gray-300 group-hover:text-green-600" />
                  </a>

                  {/* 2. Download Hasil Kodifikasi (Excel) */}
                  <a 
                    href={`${item.FILE_HASIL_KODIFIKASI}`} 
                    download 
                    className="flex items-center justify-between p-3 bg-white border border-green-200 rounded-xl hover:bg-green-50 transition group"
                  >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition">
                            <FileSpreadsheet size={14} />
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-700">Hasil Kodifikasi</span>
                    </div>
                    <Download size={14} className="text-gray-300 group-hover:text-green-600" />
                  </a>

                  {/* 3. Download Sertifikat Akhir */}
                  <a 
                    href={`${item.FILE_SERTIFIKAT}`} 
                    download 
                    className="flex items-center justify-between p-3 bg-white border border-green-200 rounded-xl hover:bg-green-50 transition group"
                  >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition">
                            <Award size={14} />
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-700">Sertifikat NSN</span>
                    </div>
                    <Download size={14} className="text-gray-300 group-hover:text-green-600" />
                  </a>
                </div>
              </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Track Record */}
      {selectedLogs && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col">
            <button 
              onClick={() => setSelectedLogs(null)}
              className="absolute top-6 right-8 p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-900 z-50"
            >
              <X size={24} />
            </button>
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <TrackRecord logs={selectedLogs} currentStatus={selectedStatus} />
            </div>
            <div className="p-6 bg-gray-50 border-t flex justify-center">
                <button 
                  onClick={() => setSelectedLogs(null)}
                  className="px-12 py-3 bg-[#1A1A1A] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#800000] transition shadow-xl"
                >
                  Tutup Pantau Status
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[1000] bg-white/50 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="animate-spin text-[#800000]" size={48} />
        </div>
      )}
    </div>
  );
}