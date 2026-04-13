'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { submitStep2 } from '../actions';

export default function Step2Form({ initialData }: { initialData: any }) {
  const [state, formAction, isPending] = useActionState(submitStep2, null);

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/dashboard/pemohon" className="flex items-center gap-2 text-gray-500 hover:text-[#800000] mb-6 transition w-fit">
        <ArrowLeftIcon className="w-5 h-5" />
        <span className="text-sm font-bold">Kembali ke Dashboard</span>
      </Link>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border p-8">
        {/* Stepper Header Updated (4 Steps) */}
        <div className="flex items-center justify-between mb-10">
          <StepCircle num={1} label="ADMINISTRASI" status="done" />
          <Line status="done" />
          <StepCircle num={2} label="IDENTIFIKASI" status="active" />
          <Line status="todo" />
          <StepCircle num={3} label="TEKNIS" status="todo" />
          <Line status="todo" />
          <StepCircle num={4} label="PERUSAHAAN" status="todo" />
        </div>

        <h2 className="text-xl font-bold mb-2 border-b pb-4 text-gray-800">Tahap 2: Identifikasi Data Materiil</h2>
        
        <form action={formAction} className="space-y-6">
          {/* Item Name Data */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Nama Barang (Item Name)</label>
              <input name="namaBarang" type="text" required placeholder="Contoh: RESISTOR, FIXED, FILM" className="w-full p-2 border rounded-md text-sm outline-[#800000]" 
              defaultValue={initialData?.namaBarang || ""}/>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Definisi Nama Barang</label>
              <textarea name="definisiBarang" rows={3} placeholder="Penjelasan kegunaan secara khas (Indo & Inggris)" className="w-full p-2 border rounded-md text-sm outline-[#800000]"
              defaultValue={initialData?.definisiBarang || ""}></textarea>
            </div>
          </div>

          {/* FSG Data */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-sm font-bold text-[#800000] mb-4 uppercase">Federal Supply Group (FSG)</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold mb-1">FSG Title</label>
                <input name="fsgTitle" type="text" placeholder="Kelompok Barang" className="w-full p-2 border rounded-md text-sm outline-[#800000]" 
                defaultValue={initialData?.fsgTitle || ""}/>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">FSG Notes</label>
                <textarea name="fsgNotes" rows={2} placeholder="Catatan singkat pengelompokkan" className="w-full p-2 border rounded-md text-sm outline-[#800000]"
                defaultValue={initialData?.fsgNotes || ""}></textarea>
              </div>
            </div>
          </div>

          {/* FSC Data */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-sm font-bold text-[#800000] mb-4 uppercase">Federal Supply Classification (FSC)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">FSC Title</label>
                <input name="fscTitle" type="text" placeholder="Klasifikasi Barang" className="w-full p-2 border rounded-md text-sm outline-[#800000]" 
                defaultValue={initialData?.fscTitle || ""}/>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold mb-1">FSC Inclusion (Termasuk dalam klasifikasi)</label>
                  <textarea name="fscInclusion" rows={2} className="w-full p-2 border rounded-md text-sm outline-[#800000]"
                  defaultValue={initialData?.fscInclusion || ""}></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">FSC Exclusion (Bukan termasuk klasifikasi)</label>
                  <textarea name="fscExclusion" rows={2} className="w-full p-2 border rounded-md text-sm outline-[#800000]"
                  defaultValue={initialData?.fscExclusion || ""}></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Link href="/dashboard/pemohon/baru" className="text-gray-500 font-bold px-6 py-2 hover:text-[#800000] transition">Kembali ke Tahap 1</Link>
            <button 
              type="submit" 
              disabled={isPending}
              className="bg-[#800000] text-white px-10 py-2 rounded-lg font-bold hover:bg-red-900 transition disabled:bg-gray-400"
            >
              {isPending ? 'Menyimpan...' : 'Lanjut ke Tahap 3'}
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