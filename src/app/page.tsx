import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function HomePage() {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get('session_token');
  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1A1A1A]">
      {/* Navbar */}
      <Navbar isLoggedIn={isLoggedIn} />

      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center pt-20 pb-12 px-6 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight mb-4">
          Portal Resmi <br /> Pelayanan NSN Indonesia
        </h2>
        <p className="text-gray-600 max-w-2xl mb-8 leading-relaxed">
          Daftarkan materiil pertahanan Anda untuk mendapatkan Nomor Sediaan Nasional (NSN/NATO Stock Number) secara resmi, cepat, dan transparan.
        </p>
        <Link href="/cek-ncage" className="bg-[#800000] text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-red-900 transition shadow-lg">
          Daftarkan Materiil Anda Sekarang
        </Link>
        
        {/* Visual Building - Antasari Puskod */}
        <div className="mt-12 relative w-full max-w-4xl h-[400px] rounded-t-full overflow-hidden border-8 border-white shadow-2xl">
          <Image 
            src="/images/building-puskod.jpeg" 
            alt="Gedung Antasari Puskod" 
            fill 
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
            className="object-cover"
          />
        </div>
      </header>

      {/* Footer */}
      <Footer isLoggedIn={isLoggedIn} />
    </div>
  );
}