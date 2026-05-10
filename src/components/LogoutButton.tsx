'use client';

import { useState, useTransition } from 'react';
import { LogOut } from 'lucide-react';
import { logoutAction } from '@/app/auth-actions';

interface LogoutButtonProps {
  variant?: 'default' | 'sidebar';
}

export default function LogoutButton({ variant = 'default' }: LogoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirmLogout = () => {
    // startTransition memungkinkan pemanggilan Server Action dari Client Component
    startTransition(() => {
      logoutAction();
    });
  };

  return (
    <>
      {/* Render Tombol Berdasarkan Varian */}
      {variant === 'sidebar' ? (
        <button 
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-semibold">Keluar Panel</span>
        </button>
      ) : (
        <button 
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-[#800000] hover:bg-red-900 transition text-white px-6 py-2 rounded-full font-bold shadow-sm"
        >
          Keluar
        </button>
      )}

      {/* Pop-up Modal Konfirmasi */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl text-center border border-[#E5E7EB]">
            
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut size={28} />
            </div>

            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Konfirmasi Keluar</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Apakah Anda yakin ingin keluar dari sesi saat ini? Anda harus masuk kembali untuk mengakses portal.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="flex-1 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={isPending}
                className="flex-1 py-3 bg-[#800000] text-white rounded-lg font-bold hover:bg-red-900 transition shadow-sm disabled:opacity-50 flex items-center justify-center"
              >
                {isPending ? 'Keluar...' : 'Ya, Keluar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}