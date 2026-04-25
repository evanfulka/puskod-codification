'use client';

import { useState, useTransition } from 'react';
import { UserCog, X, Save, Loader2 } from 'lucide-react';
import { updatePegawaiAction } from '@/app/auth-actions';
import { useRouter } from 'next/navigation';

export default function EditPegawaiModal({ data }: { data: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [form, setForm] = useState({
    nama: data.NAMA_LENGKAP,
    email: data.EMAIL,
    jabatan: data.JABATAN || '',
    pangkat: data.PANGKAT_GOLONGAN || '',
    role: data.ROLE,
    nip: data.NOMOR_IDENTITAS || '',
    wa: data.NO_TELP_WA || ''
  });

  const handleSave = () => {
    startTransition(async () => {
      const res = await updatePegawaiAction(data.ID_USER, form);
      if (res.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert(res.message);
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1A] text-white text-[10px] font-black uppercase rounded-xl hover:bg-black transition shadow-sm active:scale-95"
      >
        <UserCog size={14} /> Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="bg-[#800000] p-8 text-white flex justify-between items-center">
                <h3 className="text-xl font-black uppercase tracking-tighter">Edit Data Pegawai</h3>
                <button onClick={() => setIsOpen(false)}><X size={24}/></button>
            </div>
            
            <div className="p-8 grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Lengkap</label>
                    <input type="text" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-[#800000] font-bold text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">NIP / Identitas</label>
                    <input type="text" value={form.nip} onChange={e => setForm({...form, nip: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-[#800000] font-bold text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Jabatan</label>
                    <input type="text" value={form.jabatan} onChange={e => setForm({...form, jabatan: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-[#800000] font-bold text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pangkat / Gol</label>
                    <input type="text" value={form.pangkat} onChange={e => setForm({...form, pangkat: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-[#800000] font-bold text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Role Sistem</label>
                    <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-[#800000] font-bold text-sm">
                        <option value="ADMINISTRATOR">Administrator</option>
                        <option value="STAF_PUSKOD">Staf Puskod</option>
                        <option value="KATALOGER">Kataloger</option>
                        <option value="VALTAKOD">Valtakod</option>
                    </select>
                </div>
            </div>

            <div className="p-8 bg-gray-50 border-t flex gap-4">
                <button onClick={() => setIsOpen(false)} className="flex-1 py-4 text-xs font-black uppercase text-gray-400 hover:text-gray-600 transition">Batal</button>
                <button 
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex-[2] bg-[#800000] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-red-900 transition flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader2 className="animate-spin" /> : <><Save size={16}/> Simpan Perubahan</>}
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}