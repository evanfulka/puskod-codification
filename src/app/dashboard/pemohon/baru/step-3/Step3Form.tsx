'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { submitStep3 } from '../actions';

export default function Step3Form({ initialData }: { initialData: any }) {
  const [state, formAction, isPending] = useActionState(submitStep3, null);

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/dashboard/pemohon" className="flex items-center gap-2 text-gray-500 hover:text-[#800000] mb-6 transition w-fit">
        <ArrowLeftIcon className="w-5 h-5" />
        <span className="text-sm font-bold">Kembali ke Dashboard</span>
      </Link>

      <div className="bg-white rounded-xl shadow-sm border p-8">
        {/* Stepper Header (4 Steps) */}
        <div className="flex items-center justify-between mb-10">
          <StepCircle num={1} label="ADMINISTRASI" status="done" />
          <Line status="done" />
          <StepCircle num={2} label="IDENTIFIKASI" status="done" />
          <Line status="done" />
          <StepCircle num={3} label="TEKNIS" status="active" />
          <Line status="todo" />
          <StepCircle num={4} label="PERUSAHAAN" status="todo" />
        </div>

        <h2 className="text-xl font-bold mb-6 border-b pb-4 text-gray-800">Tahap 3: Data Teknis & Karakteristik</h2>

        <form action={formAction} className="space-y-8">
          {/* Section: Reference Number Data*/}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#800000] uppercase">1. Nomor Referensi</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1">NCAGE</label>
                <input name="cage" type="text" defaultValue={initialData?.cage || ""} className="w-full p-2 border rounded-md text-sm" placeholder="Contoh: 0001Z" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1">Part Number</label>
                <input name="partNumber" type="text" defaultValue={initialData?.partNumber || ""} className="w-full p-2 border rounded-md text-sm" />
              </div>
              {['rnvc', 'rncc', 'dac', 'rnaac', 'rnsc','moeCode'].map((code) => (
                <div key={code}>
                  <label className="block text-[10px] font-bold mb-1 uppercase text-gray-400">{code}</label>
                  <input name={code} type="text" maxLength={6} defaultValue={initialData?.[code] || ""} className="w-full p-2 border rounded-md text-sm text-center" />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Management Data*/}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-bold text-[#800000] uppercase">2. Data Manajemen</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-semibold mb-1">PMIC (Metal)</label>
                <input name="pmic" type="text" defaultValue={initialData?.pmic || ""} className="w-full p-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold mb-1">QUP (Qty Pack)</label>
                <input name="qup" type="number" defaultValue={initialData?.qup || ""} className="w-full p-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold mb-1">Repairable Code</label>
                <input name="repairable" type="text" defaultValue={initialData?.repairable || ""} className="w-full p-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold mb-1">Unit of Issue</label>
                <input name="unitOfIssue" type="text" defaultValue={initialData?.unitOfIssue || ""} className="w-full p-2 border rounded-md text-sm" placeholder="Contoh: EA" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold mb-1">Shelf Life Code</label>
                <input name="shelfLife" type="text" defaultValue={initialData?.shelfLife || ""} className="w-full p-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold mb-1">Hazardous Materiel Indicator Code</label>
                <input name="hmic" type="text" defaultValue={initialData?.hmic || ""} className="w-full p-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold mb-1">Controlled Inventory Item Code</label>
                <input name="ciic" type="text" defaultValue={initialData?.ciic || ""} className="w-full p-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold mb-1">Price per Unit</label>
                <input name="unitPrice" type="text" defaultValue={initialData?.unitPrice || ""} className="w-full p-2 border rounded-md text-sm" placeholder="IDR/USD" />
              </div>
            </div>
          </div>

          {/* Section: Characteristic Data (Drawing)  */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-bold text-[#800000] uppercase">3. Karakteristik</h3>
            <div>
                <label className="block text-sm font-semibold mb-2">Data Karakteristik</label>
                <textarea name="dataKarakteristik" rows={3} className="w-full p-2 border rounded-md text-sm outline-[#800000]"
                defaultValue={initialData?.dataKarakteristik || ""}></textarea>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold mb-2 text-gray-700">Representative Drawing (Optional)</label>
                {initialData?.repDrawing && <p className="text-[10px] text-green-600 mb-1">✓ Berkas ada: {initialData.repDrawing}</p>}
                <input 
                  name="repDrawing" 
                  type="file" 
                  accept=".pdf" 
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-[#800000]" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 text-gray-700">Technical Drawing (Optional)</label>
                {initialData?.techDrawing && <p className="text-[10px] text-green-600 mb-1">✓ Berkas ada: {initialData.techDrawing}</p>}
                <input 
                  name="techDrawing" 
                  type="file" 
                  accept=".pdf" 
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-[#800000]" 
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 italic">Bila lembar formulir kurang, harap dilampirkan gambar teknik pendukung.</p>
          </div>

          <div className="flex justify-between pt-6">
            <Link href="/dashboard/pemohon/baru/step-2" className="text-gray-500 font-bold px-6 py-2 hover:text-[#800000] transition text-sm">Kembali ke Tahap 2</Link>
            <button type="submit" disabled={isPending} className="bg-[#800000] text-white px-10 py-2 rounded-lg font-bold hover:bg-red-900 transition disabled:bg-gray-400 text-sm">
              {isPending ? 'Menyimpan...' : 'Lanjut ke Tahap 4'}
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