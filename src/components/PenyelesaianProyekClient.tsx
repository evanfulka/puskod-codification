'use client';

import { useState, useTransition } from 'react';
import { 
  Download, Upload, MessageCircle, CheckCircle2,
  Loader2, ArrowRight, XCircle, CheckCircle, Info 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { uploadOutputAction, updateStatusAction, exportDetailAction } from '@/app/auth-actions';

export default function PenyelesaianProyekClient({ data }: any) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // State untuk Modal
  const [modal, setModal] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
    redirect?: boolean;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: '',
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'BA' | 'HASIL' | 'SERTIFIKAT') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    startTransition(async () => {
      const res = await uploadOutputAction(data.ID_PERMOHONAN, formData, type);
      if (res.success) {
        setModal({
          show: true,
          type: 'success',
          title: 'Upload Berhasil',
          message: res.message,
        });
      } else {
        setModal({
          show: true,
          type: 'error',
          title: 'Upload Gagal',
          message: res.message,
        });
      }
    });
  };

  const handleUpdateStatus = (status: string, keterangan: string) => {
    startTransition(async () => {
      const res = await updateStatusAction(data.ID_PERMOHONAN, status, keterangan);
      if (res.success) {
        setModal({
          show: true,
          type: 'success',
          title: 'Status Diperbarui',
          message: `Permohonan telah dipindahkan ke tahap: ${status}. Menutup halaman...`,
          redirect: true
        });
      } else {
        setModal({
          show: true,
          type: 'error',
          title: 'Gagal Update',
          message: res.message,
        });
      }
    });
  };

  const generateDetail = async () => {
    const res = await exportDetailAction(data.ID_PERMOHONAN);
    if (res.success && res.downloadUrl) {
        const link = document.createElement('a');
        link.href = res.downloadUrl;
        const fileName = res.downloadUrl.split('/').pop()?.split('?')[0] || 'detail.xlsx';
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        setModal({
            show: true,
            type: 'error',
            title: 'Export Gagal',
            message: res.message || 'Gagal generate file detail.',
        });
    }
  };

  const closeModal = () => {
    setModal({ ...modal, show: false });
    if (modal.redirect) {
      router.push('/admin/validasi');
      router.refresh();
    } else {
        window.location.reload();
    }
  };

  const sendWA = () => {
    const phone = data.NO_TELP_WA;
    let text = `Halo ${data.NAMA_LENGKAP},\n\nBerikut kami informasikan bahwa proses kodifikasi untuk pengadaan ${data.PENGADAAN} telah selesai.`;
    
    if (data.FILE_SERTIFIKAT) {
        text += `\n\nSertifikat Kodifikasi dapat diunduh di sini: ${window.location.origin}${data.FILE_SERTIFIKAT}`;
    }
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-white rounded-3xl border border-gray-100 relative">
      
      {/* SECTION 1: MANAJEMEN FILE */}
      <div className="space-y-6">
        <h3 className="text-lg font-black uppercase tracking-tight border-b pb-2 text-[#800000]">Dokumen Output</h3>
        
        <FileRow label="Berita Acara (BA)" path={data.FILE_BA} onUpload={(e) => handleUpload(e, 'BA')} />
        <FileRow label="Hasil Kodifikasi (Summary)" path={data.FILE_HASIL_KODIFIKASI} onUpload={(e) => handleUpload(e, 'HASIL')} />
        
        <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center shadow-sm">
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Master Detail (70+ Field)</p>
                <p className="text-[10px] text-gray-500">Dihasilkan otomatis oleh sistem</p>
            </div>
            <button onClick={generateDetail} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition shadow-md">
                <Download size={18} />
            </button>
        </div>

        {(data.STATUS_SAAT_INI === 'Sertifikat Kodifikasi' || data.FILE_SERTIFIKAT) && (
            <FileRow label="Sertifikat Kodifikasi" path={data.FILE_SERTIFIKAT} onUpload={(e) => handleUpload(e, 'SERTIFIKAT')} />
        )}
      </div>

      {/* SECTION 2: KOORDINASI & STATUS */}
      <div className="space-y-6 bg-gray-50 p-6 rounded-3xl">
        <h3 className="text-lg font-black uppercase tracking-tight border-b pb-2 text-gray-800">Aksi Lanjutan</h3>
        
        <button onClick={sendWA} className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-green-700 transition shadow-lg group">
            <MessageCircle size={24} className="group-hover:scale-110 transition" /> Kirim Dokumen via WhatsApp
        </button>

        <div className="pt-6 border-t border-gray-200">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Update Status Pengerjaan:</p>
            
            {/* TAHAP 1: BERITA ACARA -> PINDAH KE VERIFIKASI MITRA */}
            {data.STATUS_SAAT_INI === 'Berita Acara dan Hasil Kodifikasi' && (
                <button 
                    onClick={() => handleUpdateStatus('Verifikasi Data Materiil dengan Mitra', 'Dokumen BA dan Hasil telah dikirim. Menunggu proses verifikasi dengan mitra.')} 
                    disabled={isPending}
                    className="w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold hover:bg-black transition flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                >
                    {isPending ? <Loader2 className="animate-spin" /> : <>Kirim & Lanjut Verifikasi <ArrowRight size={18} /></>}
                </button>
            )}

            {/* TAHAP 2: VERIFIKASI MITRA -> PINDAH KE VALIDASI DATA KODIFIKASI (VDK) */}
            {data.STATUS_SAAT_INI === 'Verifikasi Data Materiil dengan Mitra' && (
                <div className="space-y-4">
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                        <p className="text-[10px] font-bold text-orange-700 uppercase mb-1">Status Saat Ini:</p>
                        <p className="text-xs text-orange-600 font-medium leading-relaxed">
                            Sedang dalam proses verifikasi data dengan pihak mitra. Pastikan semua data materiil di Lembar Kerja sudah sesuai dengan hasil kesepakatan.
                        </p>
                    </div>
                    <button 
                        onClick={() => handleUpdateStatus('Validasi Data Kodifikasi', 'Kegiatan verifikasi mitra selesai. Menunggu validasi akhir oleh Valtakod.')} 
                        disabled={isPending}
                        className="w-full bg-[#800000] text-white py-4 rounded-2xl font-bold hover:bg-red-900 transition flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                    >
                        {isPending ? <Loader2 className="animate-spin" /> : <>Selesaikan Verifikasi Mitra <CheckCircle2 size={18} /></>}
                    </button>
                </div>
            )}

            {/* TAHAP 3: VALIDASI DATA KODIFIKASI -> PINDAH KE SERTIFIKAT KODIFIKASI */}
            {data.STATUS_SAAT_INI === 'Validasi Data Kodifikasi' && (
                <button 
                    onClick={() => handleUpdateStatus('Sertifikat Kodifikasi', 'Data telah divalidasi dan diinput ke NCORE. Menunggu upload sertifikat.')} 
                    disabled={isPending}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                >
                    {isPending ? <Loader2 className="animate-spin" /> : <>Validasi NCORE Selesai <CheckCircle2 size={18} /></>}
                </button>
            )}

            {/* TAHAP 4: SERTIFIKAT KODIFIKASI -> SELESAI */}
            {data.STATUS_SAAT_INI === 'Sertifikat Kodifikasi' && (
                <div className="space-y-4">
                    {!data.FILE_SERTIFIKAT ? (
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                            <Info size={18} className="text-blue-600 mt-0.5" />
                            <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                Silakan **unggah file Sertifikat** pada panel sebelah kiri terlebih dahulu sebelum menuntaskan permohonan ini.
                            </p>
                        </div>
                    ) : (
                        <button 
                            onClick={() => handleUpdateStatus('Selesai', 'Seluruh proses kodifikasi telah tuntas dan sertifikat telah diserahkan.')} 
                            disabled={isPending}
                            className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold hover:bg-green-800 transition flex items-center justify-center gap-2 shadow-xl"
                        >
                            {isPending ? <Loader2 className="animate-spin" /> : <>Tuntaskan Permohonan <CheckCircle size={18} /></>}
                        </button>
                    )}
                </div>
            )}

            {/* STATUS FINAL: SELESAI */}
            {data.STATUS_SAAT_INI === 'Selesai' && (
                <div className="p-6 bg-green-50 border border-green-200 rounded-3xl text-center">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <CheckCircle size={24} />
                    </div>
                    <h4 className="text-sm font-black text-green-900 uppercase">Proses Tuntas</h4>
                    <p className="text-[10px] text-green-700 font-bold mt-1 uppercase tracking-tight">
                        Permohonan ini telah selesai dan diarsipkan.
                    </p>
                    <button 
                        onClick={sendWA}
                        className="mt-4 text-xs font-bold text-green-700 hover:underline flex items-center justify-center gap-1 mx-auto"
                    >
                        <MessageCircle size={14} /> Beritahu Mitra via WhatsApp
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* MODAL POPUP */}
      {modal.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in duration-200">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              modal.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {modal.type === 'success' ? <CheckCircle size={40} /> : <XCircle size={40} />}
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase">{modal.title}</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">{modal.message}</p>
            <button 
              onClick={closeModal}
              className={`w-full py-4 rounded-2xl text-sm font-bold text-white transition ${
                modal.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              OK, Lanjut
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FileRow({ label, path, onUpload }: { label: string, path: string | null, onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <div className="flex items-center justify-between p-4 border rounded-2xl bg-white shadow-sm border-gray-100">
            <div className="flex-1">
                <p className="text-xs font-black text-gray-700 uppercase tracking-tight">{label}</p>
                {path ? (
                    <a href={path} target="_blank" className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-1 hover:underline">
                        <Download size={10} /> Download Dokumen
                    </a>
                ) : (
                    <p className="text-[10px] text-red-400 font-bold mt-1 uppercase italic">Belum Ada File</p>
                )}
            </div>
            <label className="cursor-pointer bg-gray-50 p-3 rounded-xl hover:bg-gray-100 transition border border-gray-100 text-gray-600 shadow-sm active:scale-95">
                <Upload size={18} />
                <input type="file" className="hidden" onChange={onUpload} />
            </label>
        </div>
    );
}