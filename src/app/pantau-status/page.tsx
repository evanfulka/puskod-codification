import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import PantauStatusClient from '@/components/PantauStatusClient';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SECRET_KEY = new TextEncoder().encode('rahasia_puskod_kemhan_2026');

export default async function PantauStatusPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session_token');
  const token = cookieStore.get('session_token')?.value;
  if (!token) redirect('/login');

  const isLoggedIn = !!token;
  let listPermohonan = [];

  try {
    const { payload }: any = await jwtVerify(token, SECRET_KEY);
    const conn = await getConnection();

    // Ambil semua permohonan milik user ini
    const result: any = await conn.execute(
      `SELECT 
        "ID_PERMOHONAN", 
        "NO_SURAT_PERMOHONAN", 
        "PENGADAAN", 
        "STATUS_SAAT_INI", 
        "CATATAN_PERBAIKAN",
        "FILE_BA", "FILE_HASIL_KODIFIKASI", "FILE_SERTIFIKAT",
        TO_CHAR("TANGGAL_SUBMIT", 'DD Mon YYYY') as TGL
       FROM "SYSTEM"."PERMOHONAN_HEADER"
       WHERE "ID_USER" = :1
       ORDER BY "TANGGAL_SUBMIT" DESC`,
      [payload.userId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    listPermohonan = result.rows;
    await conn.close();
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Navbar */}
      <Navbar isLoggedIn={isLoggedIn} />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="flex justify-between items-end mb-8 border-b-2 border-[#800000] pb-4">
          <div>
            <h1 className="text-3xl font-black text-[#800000] uppercase tracking-tighter">Pantau Status Permohonan</h1>
            <p className="text-gray-500 text-sm">Lacak progres kodifikasi materiil pertahanan Anda secara real-time.</p>
          </div>
          <Link 
            href="/permohonan-nsn" 
            className="flex items-center gap-2 bg-[#800000] text-white px-6 py-3 rounded-lg font-bold hover:bg-red-900 transition shadow-lg mb-1"
          >
            <Plus size={20} strokeWidth={3} />
            Buat Permohonan Baru
          </Link>
        </div>

        {/* Kirim data ke Client Component untuk interaksi (seperti buka detail track) */}
        <PantauStatusClient data={listPermohonan} />
      </div>

      {/* Footer */}
      <Footer isLoggedIn={isLoggedIn} />
    </div>
  );
}