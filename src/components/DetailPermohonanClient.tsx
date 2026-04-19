'use client';

import { useState, useTransition, useEffect } from 'react';
import { 
  FileText, CheckCircle, XCircle, ChevronLeft, 
  Download, PlayCircle, ClipboardCheck, Users,
  Loader2, ArrowRight, Plus, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateStatusAction, terbitkanSprinAction } from '@/app/auth-actions';

export default function DetailPermohonanClient({ data, katalogers }: any) {
  const [activeTab, setActiveTab] = useState('surat');
  const [isPending, startTransition] = useTransition();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSprinModal, setShowSprinModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const router = useRouter();

  const tabs = [
    { id: 'surat', label: 'Surat Permohonan', path: data.FILE_SURAT_PERMOHONAN, type: 'pdf' },
    { id: 'kontrak', label: 'Dokumen Kontrak', path: data.FILE_DOKUMEN_KONTRAK, type: 'pdf' },
    { id: 'materiil', label: 'Daftar Materiil', path: data.FILE_DOKUMEN_MATERIIL, type: 'excel' },
    { id: 'ipc', label: 'IPC / IPB', path: data.FILE_IPC_IPB, type: 'pdf' },
  ];

  const currentFile = tabs.find(t => t.id === activeTab);

  const [team, setTeam] = useState({
    ketua: '',
    sekretaris: '',
    anggota: [''] 
  });

  const handleAction = (nextStatus: string, logMessage: string) => {
    startTransition(async () => {
      const res = await updateStatusAction(data.ID_PERMOHONAN, nextStatus, logMessage);
      if (res.success) {
        setSuccessMsg(res.message);
        setShowSuccessModal(true);
      } else {
        alert("Error: " + res.message);
      }
    });
  };

  const handleTerbitkanSprin = () => {
    if (!team.ketua || !team.sekretaris) return alert("Ketua dan Sekretaris wajib dipilih!");

    const payload = [
      { idUser: parseInt(team.ketua), posisi: 'KETUA' },
      { idUser: parseInt(team.sekretaris), posisi: 'SEKRETARIS' },
      ...team.anggota.filter(id => id !== '').map(id => ({ idUser: parseInt(id), posisi: 'ANGGOTA' }))
    ];

    startTransition(async () => {
      const res = await terbitkanSprinAction(data.ID_PERMOHONAN, payload);
      if (res.success) {
        setSuccessMsg(res.message);
        setShowSprinModal(false);
        setShowSuccessModal(true);
      } else {
        alert(res.message);
      }
    });
  };

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        router.push('/admin/permohonan');
        router.refresh();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, router]);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] relative">
      {/* Header Aksi */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <Link href="/admin/permohonan" className="flex items-center gap-2 text-gray-500 hover:text-[#800000] font-bold text-sm">
          <ChevronLeft size={20} /> Kembali ke Antrean
        </Link>
        
        <div className="flex gap-3">
          {data.STATUS_SAAT_INI === 'Permohonan Baru' && (
            <button 
              disabled={isPending}
              onClick={() => handleAction('Verifikasi Berkas', 'Staf Puskod mulai melakukan pemeriksaan berkas.')}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isPending ? <Loader2 className="animate-spin" size={18} /> : <PlayCircle size={18} />}
              Mulai Verifikasi Berkas
            </button>
          )}

          {data.STATUS_SAAT_INI === 'Verifikasi Berkas' && (
            <>
              <button 
                disabled={isPending}
                onClick={() => setShowRejectModal(true)}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs font-bold border border-red-200"
              >
                <XCircle size={18} /> Berkas Tidak Sesuai
              </button>
              <button 
                disabled={isPending}
                onClick={() => handleAction('Terbitkan SPRIN', 'Berkas dinyatakan lengkap dan valid.')}
                className="flex items-center gap-2 bg-[#800000] text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-red-900 shadow-md disabled:opacity-50"
              >
                {isPending ? <Loader2 className="animate-spin" size={18} /> : <ClipboardCheck size={18} />}
                Lolos Verifikasi & Kirim ke Admin
              </button>
            </>
          )}

          {data.STATUS_SAAT_INI === 'Terbitkan SPRIN' && (
            <button 
              onClick={() => setShowSprinModal(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-purple-700 transition shadow-md"
            >
              <Users size={18} /> Tentukan Tim & Terbitkan SPRIN
            </button>
          )}
        </div>
      </div>
          
      <div className="flex flex-1 gap-6 overflow-hidden">
        <div className="w-[40%] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div>
            <div className="flex justify-between items-center border-b pb-2 mb-4">
               <h3 className="text-[#800000] font-black text-sm uppercase tracking-widest">Identitas Perusahaan</h3>
               <span className="text-[10px] bg-gray-100 px-2 py-1 rounded font-bold text-gray-500 uppercase">{data.STATUS_SAAT_INI}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DisplayField label="NCAGE" value={data.NCAGE} />
              <DisplayField label="TOEC" value={data.TOEC} />
              <div className="col-span-2"><DisplayField label="Nama Perusahaan" value={data.NAMA_PERUSAHAAN} /></div>
              <div className="col-span-2"><DisplayField label="Nama Lengkap POC" value={data.NAMA_LENGKAP} /></div>
              <div className="col-span-2"><DisplayField label="Alamat" value={data.ALAMAT} isTextarea /></div>
              <DisplayField label="Nomor Identitas" value={data.NOMOR_IDENTITAS} />
              <DisplayField label="Nomor Telepon" value={data.NOMOR_TELEPON} />
              <DisplayField label="Email Perusahaan" value={data.EMAIL_PERUSAHAAN} />
              <DisplayField label="Jabatan" value={data.JABATAN} />
            </div>
          </div>
          <div>
            <h3 className="text-[#800000] font-black text-sm uppercase tracking-widest border-b pb-2 mb-4">Detail Permohonan</h3>
            <div className="space-y-4">
              <DisplayField label="Pengadaan / Pekerjaan" value={data.PENGADAAN} />
              <DisplayField label="Nomor Surat Permohonan" value={data.NO_SURAT_PERMOHONAN} />
              <div className="grid grid-cols-2 gap-4">
                <DisplayField label="Nomor Kontrak" value={data.NO_KONTRAK} />
                <DisplayField label="Tanggal Kontrak" value={data.TGL_KONTRAK} />
              </div>
            </div>
          </div>
        </div>

        <div className="w-[60%] flex flex-col bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden shadow-inner">
          <div className="flex bg-white border-b border-gray-200">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} disabled={!tab.path}
                className={`flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-tighter transition-all border-r last:border-r-0 ${
                  activeTab === tab.id ? 'bg-gray-100 text-[#800000] border-b-2 border-b-[#800000]' : 'text-gray-400 hover:bg-gray-50'
                } ${!tab.path ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 p-4 relative">
            {!currentFile?.path ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 italic">
                <FileText size={48} className="mb-2 opacity-20" /> Dokumen tidak tersedia
              </div>
            ) : currentFile.type === 'pdf' ? (
              <iframe src={`${currentFile.path}#toolbar=0`} className="w-full h-full rounded-lg border border-gray-300 shadow-lg bg-white" />
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-white rounded-lg border border-dashed border-gray-300 p-6 text-center">
                <Download size={40} className="text-green-600 mb-4" />
                <h4 className="font-bold text-gray-800">Preview Excel Tidak Tersedia</h4>
                <a href={currentFile.path} download className="mt-4 bg-green-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition">
                  <Download size={18} /> Unduh File
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL SPRIN */}
      {showSprinModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[150] animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-black text-gray-800 mb-1 uppercase">Penetapan Tim SPRIN</h3>
            <p className="text-[10px] text-gray-400 mb-6 font-bold tracking-widest uppercase border-b pb-2">Pusat Kodifikasi Baranahan Kemhan</p>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Ketua Tim (Kataloger)</label>
                <select 
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold outline-none focus:border-purple-500"
                  value={team.ketua} onChange={(e) => setTeam({...team, ketua: e.target.value})}
                >
                  <option value="">Pilih Ketua...</option>
                  {katalogers.map((k: any) => <option key={k.ID_USER} value={k.ID_USER}>{k.NAMA_LENGKAP}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Sekretaris</label>
                <select 
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold outline-none focus:border-purple-500"
                  value={team.sekretaris} onChange={(e) => setTeam({...team, sekretaris: e.target.value})}
                >
                  <option value="">Pilih Sekretaris...</option>
                  {katalogers.map((k: any) => <option key={k.ID_USER} value={k.ID_USER}>{k.NAMA_LENGKAP}</option>)}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Anggota Tim</label>
                  <button onClick={() => setTeam({...team, anggota: [...team.anggota, '']})} className="text-[#800000] text-[10px] font-black uppercase flex items-center gap-1">
                    <Plus size={12} /> Tambah Anggota
                  </button>
                </div>
                {team.anggota.map((val, idx) => (
                  <div key={idx} className="flex gap-2 mb-3">
                    <select 
                      className="flex-1 p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold outline-none focus:border-purple-500"
                      value={val}
                      onChange={(e) => {
                        const newAnggota = [...team.anggota];
                        newAnggota[idx] = e.target.value;
                        setTeam({...team, anggota: newAnggota});
                      }}
                    >
                      <option value="">Pilih Anggota...</option>
                      {katalogers.map((k: any) => <option key={k.ID_USER} value={k.ID_USER}>{k.NAMA_LENGKAP}</option>)}
                    </select>
                    {team.anggota.length > 1 && (
                      <button 
                        onClick={() => {
                          const newAnggota = team.anggota.filter((_, i) => i !== idx);
                          setTeam({...team, anggota: newAnggota});
                        }}
                        className="p-3 text-red-400 hover:text-red-600"
                      ><Trash2 size={18} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-4 border-t">
              <button onClick={() => setShowSprinModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition">Batal</button>
              <button 
                onClick={handleTerbitkanSprin}
                disabled={isPending}
                className="flex-2 bg-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-purple-700 transition shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-400"
              >
                {isPending ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                Terbitkan SPRIN & Kirim ke Kataloger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENOLAKAN */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Catatan Perbaikan Berkas</h3>
            <textarea 
              className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-red-500 text-sm mb-4 bg-gray-50"
              rows={4} placeholder="Jelaskan bagian mana yang perlu diperbaiki..."
              value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition">Batal</button>
              <button 
                onClick={() => handleAction('Perbaikan Berkas', rejectReason)}
                className="flex-1 py-3 text-sm font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
              >
                Kirim Penolakan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUKSES */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[200] animate-in zoom-in duration-300">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full shadow-2xl text-center">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Berhasil!</h3>
            <p className="text-sm text-gray-500 mb-8 font-medium">{successMsg}</p>
            <button 
              onClick={() => {
                router.push('/admin/permohonan');
                router.refresh();
              }}
              className="w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg group"
            >
              Kembali ke Antrean
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[10px] text-gray-300 mt-4 uppercase tracking-widest font-bold">Mengalihkan otomatis dalam 2 detik...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function DisplayField({ label, value, isTextarea }: any) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</label>
      <div className={`w-full p-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold text-gray-700 ${isTextarea ? 'min-h-[60px]' : 'truncate'}`}>
        {value ? String(value) : '-'}
      </div>
    </div>
  );
}