'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { submitStep4 } from '../actions';

export default function Step4Form({ initialData }: { initialData: any }) {
  const [state, formAction, isPending] = useActionState(submitStep4, null);

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/dashboard/pemohon" className="flex items-center gap-2 text-gray-500 hover:text-[#800000] mb-6 transition w-fit">
        <ArrowLeftIcon className="w-5 h-5" />
        <span className="text-sm font-bold">Kembali ke Dashboard</span>
      </Link>

      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="flex items-center justify-between mb-10">
          <StepCircle num={1} label="ADMINISTRASI" status="done" />
          <Line status="done" />
          <StepCircle num={2} label="IDENTIFIKASI" status="done" />
          <Line status="done" />
          <StepCircle num={3} label="TEKNIS" status="done" />
          <Line status="done" />
          <StepCircle num={4} label="PERUSAHAAN" status="active" />
        </div>

        <h2 className="text-xl font-bold mb-6 border-b pb-4 text-gray-800">Tahap 4: Data Perusahaan (Supplier)</h2>

        <form action={formAction} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Nama Perusahaan</label>
              <input name="supName" type="text" defaultValue={initialData?.supName || ""} required className="w-full p-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Status & Type</label>
              <div className="flex gap-4">
                <input name="supStatus" type="text" placeholder="Status" defaultValue={initialData?.supStatus || ""} className="w-1/2 p-2 border rounded-md text-sm" />
                <input name="supType" type="text" placeholder="Type" defaultValue={initialData?.supType || ""} className="w-1/2 p-2 border rounded-md text-sm" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Alamat Perusahaan</label>
            <textarea name="supAddress" rows={3} defaultValue={initialData?.supAddress || ""} required className="w-full p-2 border rounded-md text-sm"></textarea>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Phone & Fax</label>
              <div className="flex gap-4">
                <input name="supPhone" type="tel" placeholder="Phone" defaultValue={initialData?.supPhone || ""} className="w-1/2 p-2 border rounded-md text-sm" />
                <input name="supFax" type="text" placeholder="Fax" defaultValue={initialData?.supFax || ""} className="w-1/2 p-2 border rounded-md text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Website & E-mail</label>
              <div className="flex gap-4">
                <input name="supWebsite" type="url" placeholder="Website" defaultValue={initialData?.supWebsite || ""} className="w-1/2 p-2 border rounded-md text-sm" />
                <input name="supEmail" type="email" placeholder="Email" defaultValue={initialData?.supEmail || ""} className="w-1/2 p-2 border rounded-md text-sm" />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Link href="/dashboard/pemohon/baru/step-3" className="text-gray-500 font-bold px-6 py-2 hover:text-[#800000] transition text-sm">Kembali ke Tahap 3</Link>
            <button type="submit" disabled={isPending} className="bg-[#800000] text-white px-10 py-2 rounded-lg font-bold hover:bg-red-900 transition disabled:bg-gray-400 text-sm">
              {isPending ? 'Menyimpan...' : 'Lihat Preview'}
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