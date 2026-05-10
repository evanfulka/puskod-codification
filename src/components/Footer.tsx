import Image from 'next/image';
import Link from 'next/link';

interface FooterProps {
  isLoggedIn: boolean;
}

export default function Footer({ isLoggedIn }: FooterProps) {
  return (
    <footer className="bg-[#1A1A1A] text-white py-12 px-12 mt-20">
      <div className="grid md:grid-cols-3 gap-12 border-b border-gray-800 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Image src="/images/logo-puskod.png" alt="Logo Puskod" width={50} height={50} />
            <p className="font-bold text-lg">Pelayanan NSN <br /><span className="text-sm font-normal text-gray-400">Pusat Kodifikasi</span></p>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">Jl. Pd. Labu Raya, RT.6/RW.6 Pd. Labu, Cilandak, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta</p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Tautan</h4>
          <ul className="text-gray-400 text-sm space-y-2">
            <li><Link href="/" className="hover:text-white transition">Beranda</Link></li>
            <li><Link href="/permohonan-nsn" className="hover:text-white transition">Permohonan NSN</Link></li>
            <li><Link href="/pantau-status" className="hover:text-white transition">Pantau Status</Link></li>
            {/* Sembunyikan Cek NCAGE jika user sudah login */}
            {!isLoggedIn && (
              <li><Link href="/cek-ncage" className="hover:text-white transition">Cek NCAGE</Link></li>
            )}
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Kontak</h4>
          <p className="text-gray-400 text-sm">📞 Call Center Puskod: 0812-8882-4545</p>
          <p className="text-gray-400 text-sm mt-2">🕒 Jam Pelayanan: Senin - Jumat, 08:00 - 15:30 WIB</p>
        </div>
      </div>
      <p className="text-center text-gray-500 text-xs mt-8">© 2026 Pusat Kodifikasi, Baranahan, Kementerian Pertahanan Republik Indonesia.</p>
    </footer>
  );
}