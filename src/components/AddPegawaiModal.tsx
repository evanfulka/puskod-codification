'use client';

import { useActionState, useState } from 'react';
import { UserPlus, X, Save, Loader2, Key } from 'lucide-react';
import { addPegawaiAction } from '@/app/auth-actions';

export default function AddPegawaiModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(addPegawaiAction, null);

  if (state?.success && isOpen) {
    setIsOpen(false);
    window.location.reload();
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-[#800000] text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-lg hover:bg-red-900 transition active:scale-95"
      >
        <UserPlus size={18} /> Tambah Pegawai Baru
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form action={formAction} className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="bg-[#1A1A1A] p-8 text-white flex justify-between items-center">
                <h3 className="text-xl font-black uppercase tracking-tighter italic">Registrasi Personil Puskod</h3>
                <button type="button" onClick={() => setIsOpen(false)}><X size={24}/></button>
            </div>
            
            <div className="p-10 grid grid-cols-2 gap-6">
                <InputField label="Nama Lengkap" name="nama" required />
                <InputField label="Email Kedinasan" name="email" type="email" required />
                <div className="space-y-1 relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                    <div className="relative">
                        <input name="password" type="password" required className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-[#800000] font-bold text-sm pr-10" />
                        <Key size={16} className="absolute right-3 top-3.5 text-gray-300" />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Role Sistem</label>
                    <select name="role" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-[#800000] font-bold text-sm">
                        <option value="STAF_PUSKOD">Staf Puskod</option>
                        <option value="KATALOGER">Kataloger</option>
                        <option value="VALTAKOD">Valtakod</option>
                        <option value="ADMINISTRATOR">Administrator</option>
                    </select>
                </div>
                <InputField label="NIP / Nomor Identitas" name="nip" required />
                <InputField label="No. WhatsApp" name="wa" required />
                <InputField label="Jabatan" name="jabatan" required />
                <InputField label="Pangkat / Golongan" name="pangkat" required />

                {state?.success === false && (
                    <div className="col-span-2 p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold uppercase">{state.message}</div>
                )}
            </div>

            <div className="p-8 bg-gray-50 border-t flex gap-4">
                <button 
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-[#800000] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg hover:bg-red-900 transition flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader2 className="animate-spin" /> : <><Save size={16}/> Simpan Data Pegawai</>}
                </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function InputField({ label, name, type = "text", required }: any) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
            <input name={name} type={type} required={required} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-[#800000] font-bold text-sm" />
        </div>
    )
}