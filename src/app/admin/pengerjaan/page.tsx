import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import Link from 'next/link';
import { BriefcaseIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const SECRET_KEY = new TextEncoder().encode('rahasia_puskod_kemhan_2026');

export default async function PengerjaanKatalogerPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  const { payload }: any = await jwtVerify(token!, SECRET_KEY);
  
  const conn = await getConnection();

  // Query: Hanya permohonan berstatus 'Proses Pengerjaan Kodifikasi' 
  // DAN Kataloger yang sedang login terdaftar di tim tersebut.
  const result: any = await conn.execute(
    `SELECT 
      h."ID_PERMOHONAN", 
      h."NAMA_PERUSAHAAN", 
      h."PENGADAAN", 
      t."POSISI",
      (SELECT COUNT(*) FROM "SYSTEM"."PERMOHONAN_MATERIIL" m WHERE m."ID_PERMOHONAN" = h."ID_PERMOHONAN") as JUMLAH_ITEM
     FROM "SYSTEM"."PERMOHONAN_HEADER" h
     JOIN "SYSTEM"."PERMOHONAN_TEAM" t ON h."ID_PERMOHONAN" = t."ID_PERMOHONAN"
     WHERE t."ID_USER_PETUGAS" = :1 
     AND h."STATUS_SAAT_INI" = 'Proses Pengerjaan Kodifikasi'
     ORDER BY h."TANGGAL_SUBMIT" ASC`,
    [payload.userId],
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  const listTugas = result.rows;
  await conn.close();

  return (
    <div className="space-y-6">
      <div className="border-b-2 border-[#800000] pb-4">
        <h1 className="text-2xl font-black text-[#1A1A1A] uppercase tracking-tight flex items-center gap-3">
          <BriefcaseIcon className="w-8 h-8 text-[#800000]" />
          Meja Kerja Kataloger
        </h1>
        <p className="text-gray-500 text-sm">Daftar permohonan yang ditugaskan kepada Anda sesuai SPRIN.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listTugas.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-medium">
            Belum ada tugas pengerjaan kodifikasi untuk Anda.
          </div>
        ) : (
          listTugas.map((tugas: any) => (
            <div key={tugas.ID_PERMOHONAN} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition group">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-red-50 text-[#800000] text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                  {tugas.POSISI}
                </span>
                <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold">
                  <ClockIcon className="w-3 h-3" /> PROSES
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#800000] transition-colors line-clamp-1">{tugas.NAMA_PERUSAHAAN}</h3>
              <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed h-8">{tugas.PENGADAAN}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span className="text-[#800000]">{tugas.JUMLAH_ITEM}</span> Item Barang
                </div>
                <Link 
                  href={`/admin/pengerjaan/${tugas.ID_PERMOHONAN}`}
                  className="bg-[#1A1A1A] text-white p-2 rounded-lg hover:bg-[#800000] transition shadow-lg flex items-center gap-2 text-xs font-bold px-4"
                >
                  Buka Lembar Kerja <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}