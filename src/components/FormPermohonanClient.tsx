'use client';

import { useActionState, useState } from 'react';
import { FileDown, Upload, User, FileEdit, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { submitPermohonanAction } from '@/app/auth-actions';
import Link from 'next/link';

export default function FormPermohonanClient({ prefillData }: any) {
  const [state, formAction, isPending] = useActionState(submitPermohonanAction, null);
  const [showModal, setShowModal] = useState(false);

  // Jika sukses, kita tampilkan modal
  if (state?.success && !showModal) {
    setShowModal(true);
  }

  return (
    <>
      <form action={formAction} className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
        
        {/* DATA USER */}
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-[#800000] flex items-center gap-2 border-b pb-2 mb-4">
            <User size={20} /> DATA IDENTITAS POC / MITRA
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="NCAGE" name="ncage" defaultValue={prefillData?.NCAGE} />
            <InputField label="TOEC" name="toec" defaultValue={prefillData?.TOEC} />
          </div>
          <InputField label="Nama Perusahaan" name="namaPerusahaan" defaultValue={prefillData?.NAMA_PERUSAHAAN} />
          <InputField label="Nama Lengkap" name="namaLengkap" defaultValue={prefillData?.NAMA_LENGKAP} />
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Alamat</label>
            <textarea name="alamat" defaultValue={prefillData?.ALAMAT} rows={3} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#800000] text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Nomor Identitas (KTP/NIP)" name="noIdentitas" placeholder="Masukkan No. Identitas" />
            <InputField label="Nomor Telepon" name="noTelp" defaultValue={prefillData?.NOMOR_TELEPON} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Email Perusahaan" name="email" defaultValue={prefillData?.EMAIL_PERUSAHAAN} />
            <InputField label="Jabatan" name="jabatan" defaultValue={prefillData?.JABATAN} />
          </div>
        </div>

        {/* DATA PERMOHONAN */}
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-[#800000] flex items-center gap-2 border-b pb-2 mb-4">
            <FileEdit size={20} /> DETAIL PERMOHONAN & DOKUMEN
          </h3>
          <InputField label="Pengadaan / Pekerjaan" name="pengadaan" placeholder="Nama proyek pengadaan" />
          <InputField label="No. Surat Permohonan" name="noSurat" placeholder="Contoh: 001/DIR/IV/2026" />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="No. Kontrak" name="noKontrak" placeholder="Nomor Kontrak Terkait" />
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tanggal Kontrak</label>
              <input type="date" name="tglKontrak" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#800000] text-sm" required />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4">
            {state?.success === false && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center gap-2">
                <AlertCircle size={14} /> {state.message}
              </div>
            )}
            
            <UploadField label="Dokumen Kontrak (PDF)" name="fileKontrak" required />
            <UploadField label="Surat Permohonan (PDF)" name="fileSurat" required />
            <div className="space-y-2">
              <UploadField label="Dokumen Materiil (Excel)" name="fileMateriil" required isExcel />
              <a href="/templates/template_materiil.xlsx" download className="flex items-center gap-2 text-[10px] font-bold text-blue-600 hover:text-blue-800">
                <FileDown size={14} /> DOWNLOAD TEMPLATE MATERIIL AWAL
              </a>
            </div>
            <UploadField label="IPC / IPB (PDF)" name="fileIpc" optional />
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#800000] text-white py-4 rounded-xl font-bold text-lg hover:bg-red-900 shadow-xl transition mt-6 flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Mengunggah Berkas...
              </>
            ) : "Kirim Permohonan Kodifikasi"}
          </button>
        </div>
      </form>

      {/* POP-UP SUKSES */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-green-600 mb-6">
              <CheckCircle size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Berhasil Dikirim!</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Permohonan Anda telah diterima dan sedang menunggu verifikasi berkas oleh Staf Puskod.
            </p>
            <div className="space-y-3">
              <Link 
                href="/pantau-status" 
                className="block w-full bg-[#800000] text-white py-3 rounded-xl font-bold hover:bg-red-900 transition shadow-md"
              >
                Pantau Status Sekarang
              </Link>
              <button 
                onClick={() => window.location.reload()}
                className="block w-full text-gray-400 text-xs font-bold hover:text-gray-600"
              >
                Buat Permohonan Lain
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function InputField({ label, name, defaultValue, placeholder, type = "text" }: any) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</label>
      <input 
        name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} required
        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#800000] text-sm font-medium"
      />
    </div>
  );
}

function UploadField({ label, name, required, optional, isExcel }: any) {
  return (
    <div className="relative group">
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
        {label} {optional && <span className="text-gray-300 font-normal lowercase">(opsional)</span>}
      </label>
      <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg group-hover:border-[#800000] transition bg-white">
        <Upload size={16} className="text-gray-400" />
        <input 
          type="file" name={name} accept={isExcel ? ".xlsx, .xls" : ".pdf"} required={required}
          className="text-xs file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-red-50 file:text-[#800000]" 
        />
      </div>
    </div>
  );
}