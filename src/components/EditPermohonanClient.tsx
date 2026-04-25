'use client';

import { useActionState, useState } from 'react';
import { Upload, User, FileEdit, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { updatePermohonanAction } from '@/app/auth-actions';
import Link from 'next/link';

export default function EditPermohonanClient({ id, initialData }: any) {
  const [state, formAction, isPending] = useActionState(updatePermohonanAction, null);
  const [showModal, setShowModal] = useState(false);

  if (state?.success && !showModal) {
    setShowModal(true);
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <Link href="/pantau-status" className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-[#800000] transition w-fit">
        <ArrowLeft size={20} /> Kembali ke Pantau Status
      </Link>

      <div className="bg-[#800000] p-10 rounded-t-3xl text-white">
          <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <FileEdit size={32} /> Perbaikan Permohonan
          </h1>
          <p className="text-red-100 text-sm mt-2 font-medium">Ubah data atau dokumen yang diminta untuk diperbaiki oleh petugas.</p>
      </div>

      <form action={formAction} className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-10 rounded-b-3xl shadow-sm border border-gray-100 border-t-0">
        {/* Hidden ID */}
        <input type="hidden" name="idPermohonan" value={id} />

        {/* DATA USER (Pre-filled) */}
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-[#800000] flex items-center gap-2 border-b pb-2 mb-4">
            <User size={20} /> DATA IDENTITAS POC / MITRA
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="NCAGE" name="ncage" defaultValue={initialData?.NCAGE} />
            <InputField label="TOEC" name="toec" defaultValue={initialData?.TOEC} />
          </div>
          <InputField label="Nama Perusahaan" name="namaPerusahaan" defaultValue={initialData?.NAMA_PERUSAHAAN} />
          <InputField label="Nama Lengkap" name="namaLengkap" defaultValue={initialData?.NAMA_LENGKAP} />
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Alamat</label>
            <textarea name="alamat" defaultValue={initialData?.ALAMAT} rows={3} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#800000] text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Nomor Identitas (KTP/NIP)" name="noIdentitas" defaultValue={initialData?.NOMOR_IDENTITAS} />
            <InputField label="Nomor Telepon" name="noTelp" defaultValue={initialData?.NOMOR_TELEPON} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Email Perusahaan" name="email" defaultValue={initialData?.EMAIL_PERUSAHAAN} />
            <InputField label="Jabatan" name="jabatan" defaultValue={initialData?.JABATAN} />
          </div>
        </div>

        {/* DATA PERMOHONAN (Pre-filled) */}
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-[#800000] flex items-center gap-2 border-b pb-2 mb-4">
            <FileEdit size={20} /> DETAIL PERMOHONAN & DOKUMEN
          </h3>
          <InputField label="Pengadaan / Pekerjaan" name="pengadaan" defaultValue={initialData?.PENGADAAN} />
          <InputField label="No. Surat Permohonan" name="noSurat" defaultValue={initialData?.NO_SURAT_PERMOHONAN} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="No. Kontrak" name="noKontrak" defaultValue={initialData?.NO_KONTRAK} />
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tanggal Kontrak</label>
              {/* Note: Tanggal butuh format YYYY-MM-DD agar muncul di input type date */}
              <input type="date" name="tglKontrak" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#800000] text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4">
            {state?.success === false && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center gap-2">
                <AlertCircle size={14} /> {state.message}
              </div>
            )}
            
            <p className="text-[10px] font-bold text-orange-500 italic">* Upload ulang file hanya jika ada revisi pada file tersebut.</p>
            
            <UploadField label="Dokumen Kontrak (PDF)" name="fileKontrak" />
            <UploadField label="Surat Permohonan (PDF)" name="fileSurat" />
            <div className="space-y-2">
              <UploadField label="Dokumen Materiil (Excel)" name="fileMateriil" isExcel />
            </div>
            <UploadField label="IPC / IPB (PDF)" name="fileIpc" optional />
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#800000] text-white py-5 rounded-2xl font-bold text-lg hover:bg-red-900 shadow-xl transition mt-6 flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            {isPending ? <Loader2 className="animate-spin" size={20} /> : "Kirim Perbaikan Dokumen"}
          </button>
        </div>
      </form>

      {/* POP-UP SUKSES */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center border-t-8 border-green-500">
            <CheckCircle size={60} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Berhasil Diperbaiki!</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Data perbaikan telah dikirim. Status permohonan Anda kembali menjadi <b>Verifikasi Berkas</b>.
            </p>
            <Link 
              href="/pantau-status" 
              className="block w-full bg-[#800000] text-white py-3 rounded-xl font-bold hover:bg-red-900 transition"
            >
              OK, Mengerti
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Gunakan helper yang sama dengan Form pendaftaran kamu
function InputField({ label, name, defaultValue, placeholder, type = "text" }: any) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</label>
      <input 
        name={name} type={type} defaultValue={defaultValue} placeholder={placeholder}
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