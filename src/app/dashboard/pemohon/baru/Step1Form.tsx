'use client';

import { useActionState } from 'react';
import { submitStep1 } from './actions';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Step1Form({ initialData }: { initialData: any }) {
  const [state, formAction, isPending] = useActionState(submitStep1, null);

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border p-8">
        <Link 
          href="/dashboard/pemohon" 
          className="flex items-center gap-2 text-gray-500 hover:text-[#800000] mb-6 transition w-fit"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="text-sm font-bold">Kembali ke Dashboard</span>
        </Link>
        {/* Stepper Header Updated (4 Steps) */}
        <div className="flex items-center justify-between mb-10">
          <StepCircle num={1} label="ADMINISTRASI" status="active" />
          <Line status="done" />
          <StepCircle num={2} label="IDENTIFIKASI" status="todo" />
          <Line status="todo" />
          <StepCircle num={3} label="TEKNIS" status="todo" />
          <Line status="todo" />
          <StepCircle num={4} label="PERUSAHAAN" status="todo" />
        </div>

        <h2 className="text-xl font-bold mb-6 border-b pb-4 text-gray-800">Tahap 1: Data Administrasi Pemohon</h2>
        
        <form action={formAction} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-semibold mb-2">Nomor Dokumen (Surat Keluar)</label>
                <input 
                name="noDokumen" 
                type="text" 
                required 
                defaultValue={initialData?.noDokumen || ""} 
                className="w-full p-2 border rounded-md text-sm outline-[#800000]" 
                />
            </div>
            <div>
                <label className="block text-sm font-semibold mb-2">Permintaan Dari (Perusahaan)</label>
                <input 
                name="permintaanDari" 
                type="text" 
                required 
                defaultValue={initialData?.permintaanDari || ""} 
                className="w-full p-2 border rounded-md text-sm outline-[#800000]" 
                />
            </div>
            <div>
                <label className="block text-sm font-semibold mb-2">Jabatan Penanggung Jawab</label>
                <input 
                name="jabatan" 
                type="text" 
                required 
                defaultValue={initialData?.jabatan || ""} 
                className="w-full p-2 border rounded-md text-sm outline-[#800000]" 
                />
            </div>
            <div>
                <label className="block text-sm font-semibold mb-2">Nomor Pegawai</label>
                <input 
                name="noPegawai" 
                type="text" 
                required 
                defaultValue={initialData?.noPegawai || ""} 
                className="w-full p-2 border rounded-md text-sm outline-[#800000]" 
                />
            </div>
            <label className="block text-sm font-semibold mb-2">Unggah Surat Permohonan (PDF)</label>
            {initialData?.fileSurat && (
                <p className="text-xs text-green-600 mb-2 font-bold">✓ File sudah terunggah: {initialData.fileSurat}</p>
            )}
            <input 
                name="fileSurat" 
                type="file" 
                accept=".pdf" 
                required={!initialData?.fileSurat} // Tidak wajib jika sudah ada draft
                className="w-full text-sm" 
            />
            </div>
            <div className="flex justify-end pt-6">
                <button 
                    type="submit" 
                    disabled={isPending} 
                    className="bg-[#800000] text-white px-10 py-2 rounded-lg font-bold hover:bg-red-900 transition disabled:bg-gray-400">
                    {isPending ? 'Menyimpan...' : 'Lanjut ke Tahap 2'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}

function StepCircle({ num, label, status }: { num: number, label: string, status: 'done' | 'active' | 'todo' }) {
  const bgColor = status === 'done' ? 'bg-green-600' : status === 'active' ? 'bg-[#800000]' : 'bg-gray-300';
  const textColor = status === 'todo' ? 'text-gray-400' : 'text-gray-800';
  return (
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 ${bgColor} text-white rounded-full flex items-center justify-center font-bold text-xs`}>
        {status === 'done' ? '✓' : num}
      </div>
      <span className={`text-[9px] mt-2 font-bold ${textColor} uppercase tracking-tighter`}>{label}</span>
    </div>
  );
}

function Line({ status }: { status: 'done' | 'todo' }) {
  return <div className={`flex-1 h-[2px] ${status === 'done' ? 'bg-green-600' : 'bg-gray-200'} mx-2 mt-[-18px]`}></div>;
}