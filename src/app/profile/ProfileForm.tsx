'use client';

import { useActionState, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { updateProfileAction } from './actions';

export default function ProfileForm({ user }: { user: any }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, null);
  const [preview, setPreview] = useState(user.foto ? `/uploads/profiles/${user.foto}` : '/images/default-avatar.png');
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (user.foto) {
        setPreview(`/uploads/profiles/${user.foto}`);
    }
    }, [user.foto]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <form action={formAction}>
          <div className="flex flex-col items-center mb-10">
            <div className="relative group w-32 h-32 mb-4">
              <Image 
                src={preview} 
                alt="Profile" 
                width={128} 
                height={128} 
                className="rounded-full w-32 h-32 object-cover border-4 border-[#800000] shadow-md" 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-[10px] font-bold"
              >
                Ganti Foto
              </button>
              <input 
                type="file" 
                name="foto" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{user.perusahaan}</h2>
            <span className="bg-red-50 text-[#800000] px-3 py-1 rounded-full text-[10px] font-bold mt-2 border border-red-100">
              {user.role}
            </span>
          </div>

          {state?.message && (
            <div className={`mb-6 p-3 rounded-lg text-sm font-bold border ${state.success ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {state.message}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nama Lengkap POC</label>
              <input name="namaPoc" type="text" className="w-full p-2 border rounded-md text-sm outline-[#800000]" defaultValue={user.namaPoc} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email (ID Login)</label>
              <input type="text" disabled className="w-full p-2 border rounded-md bg-gray-50 text-sm text-gray-400 cursor-not-allowed" defaultValue={user.email} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nama Perusahaan</label>
              <input name="namaPerusahaan" type="text" className="w-full p-2 border rounded-md text-sm outline-[#800000]" defaultValue={user.perusahaan} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nomor WhatsApp</label>
              <input name="noTelp" type="text" className="w-full p-2 border rounded-md text-sm outline-[#800000]" defaultValue={user.telp} />
            </div>
          </div>
          
          <div className="mt-10 flex gap-4 border-t pt-8">
            <button 
              type="submit" 
              disabled={isPending}
              className="bg-[#800000] text-white px-8 py-2 rounded-md font-bold hover:bg-red-900 transition text-sm disabled:bg-gray-400 shadow-md"
            >
              {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <Link href="/" className="px-8 py-2 border border-gray-300 rounded-md font-bold text-sm hover:bg-gray-50 transition text-center text-gray-600">
              Kembali
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}