import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import FormPermohonanClient from '@/components/FormPermohonanClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const SECRET_KEY = new TextEncoder().encode('rahasia_puskod_kemhan_2026');

export default async function PermohonanNSNPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token) redirect('/login');

  let prefillData = null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    
    const conn = await getConnection();

    const result: any = await conn.execute(
      `SELECT 
        u."NCAGE_KODE" as NCAGE, 
        n."TOEC" as TOEC, 
        u."NAMA_PERUSAHAAN" as NAMA_PERUSAHAAN, 
        u."NAMA_LENGKAP" as NAMA_LENGKAP, 
        n."STREET" as ALAMAT, 
        u."NO_TELP_WA" as NOMOR_TELEPON, 
        u."EMAIL" as EMAIL_PERUSAHAAN, 
        u."JABATAN" as JABATAN
       FROM "SYSTEM"."USERS" u
       LEFT JOIN "SYSTEM"."NCAGE_RECORDS" n ON u."NCAGE_KODE" = n."NCAGE_CODE"
       WHERE u."ID_USER" = :1`,
      [payload.userId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length > 0) {
      prefillData = result.rows[0];
    }

    await conn.close();
  } catch (err) {
    console.error("Auth Error:", err);
    // Jika token error atau expired, balikkan ke login
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans">
      <div className="max-w-7xl mx-auto py-12 px-6">
        <Link 
          href="/pantau-status" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#800000] font-bold mb-6 transition group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Pantau Status
        </Link>
        <div className="block mb-10">
          <div className="border-b-4 border-[#800000] pb-2 inline-block">
            <h1 className="text-3xl font-black text-[#800000] uppercase tracking-tighter">Formulir Pendaftaran Materiil</h1>
          </div>
          <p className="text-gray-500 text-sm mt-2">Pastikan data yang Anda masukkan sesuai dengan dokumen teknis materiil.</p>
        </div>
        
        <FormPermohonanClient prefillData={prefillData} />
      </div>
    </div>
  );
}