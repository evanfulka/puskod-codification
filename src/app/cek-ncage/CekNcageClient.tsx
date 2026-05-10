'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, AlertCircle, CheckCircle2, Info, X, ChevronLeft, ChevronRight, List } from 'lucide-react';

// Interface untuk data NCAGE yang diambil dari API
interface NcageData {
  ncageCode: string;
  entityName: string;
}

export default function CekNcageClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [modalConfig, setModalConfig] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    target?: string;
  } | null>(null);

  // State untuk Pop-up Daftar NCAGE
  const [showListModal, setShowListModal] = useState(false);
  const [ncageList, setNcageList] = useState<NcageData[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();

  // Fungsi untuk mengecek NCAGE (Bisa berdasarkan Kode atau Nama Perusahaan)
  const handleCheckNcage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    setLoading(true);
    try {
      const res = await fetch('/api/check-ncage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }), 
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

  // Fungsi untuk mengambil data list NCAGE dengan Paginasi
  const fetchNcageList = async (page: number) => {
    setLoadingList(true);
    try {
      const res = await fetch(`/api/ncage-list?page=${page}&limit=10`);
      const data = await res.json();
      
      if (data.success) {
        setNcageList(data.data);
        setTotalPages(data.totalPages);
        setCurrentPage(page);
      } else {
        throw new Error(data.message || 'Gagal mengambil data');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal memuat daftar NCAGE.');
    } finally {
      setLoadingList(false);
    }
  };

  const openListModal = () => {
    setShowListModal(true);
    fetchNcageList(1);
  };

  return (
    <>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full text-center space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
            Validasi Kode NCAGE
          </h2>
          <p className="text-gray-600">
            Sistem akan memeriksa ketersediaan data NCAGE Anda di database Pusat Kodifikasi berdasarkan Kode NCAGE atau Nama Perusahaan.
          </p>

          <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-100 mt-8">
            <form onSubmit={handleCheckNcage} className="space-y-6">
              <div className="text-left">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Masukkan Kode NCAGE / Nama Perusahaan
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Contoh: 1234Z atau PT MAJU JAYA"
                  className="w-full px-6 py-4 bg-[#FDFBF7] border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#800000] outline-none text-xl font-bold text-center uppercase"
                  required
                />
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#800000] text-white py-4 rounded-lg font-bold text-lg hover:bg-red-900 transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Search size={20} />
                  {loading ? "Memeriksa..." : "Periksa Database"}
                </button>
                
                <button
                  type="button"
                  onClick={openListModal}
                  className="w-full bg-white text-[#800000] border-2 border-[#800000] py-4 rounded-lg font-bold text-lg hover:bg-red-50 transition shadow-sm flex items-center justify-center gap-2"
                >
                  <List size={20} />
                  Lihat Seluruh Data NCAGE
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Modal Daftar NCAGE */}
      {showListModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#1A1A1A]">Daftar Data NCAGE</h3>
              <button onClick={() => setShowListModal(false)} className="text-gray-400 hover:text-red-500 transition">
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 border rounded-lg">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase font-bold sticky top-0">
                  <tr>
                    <th className="px-6 py-3 border-b">Kode NCAGE</th>
                    <th className="px-6 py-3 border-b">Nama Perusahaan (Entity Name)</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingList ? (
                    <tr>
                      <td colSpan={2} className="text-center py-10">Memuat data...</td>
                    </tr>
                  ) : ncageList.length > 0 ? (
                    ncageList.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-mono font-bold text-[#800000]">{item.ncageCode}</td>
                        <td className="px-6 py-4">{item.entityName}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="text-center py-10">Data tidak ditemukan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginasi Controls */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <span className="text-sm text-gray-500">
                Halaman {currentPage} dari {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchNcageList(currentPage - 1)}
                  disabled={currentPage === 1 || loadingList}
                  className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 transition"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => fetchNcageList(currentPage + 1)}
                  disabled={currentPage === totalPages || loadingList}
                  className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 transition"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Status (Pop up hasil pencarian spesifik) */}
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
    </>
  );
}