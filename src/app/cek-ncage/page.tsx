import { cookies } from 'next/headers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CekNcageClient from './CekNcageClient'; // Komponen client Anda yang lama

export default async function CekNcagePage() {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get('session_token');

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1A1A1A] flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} />
      
      {/* Isi logika client form NCAGE ada di komponen ini */}
      <CekNcageClient />

      <Footer isLoggedIn={isLoggedIn} />
    </div>
  );
}