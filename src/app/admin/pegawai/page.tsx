import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import Link from 'next/link';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';
import EditPegawaiModal from '@/components/EditPegawaiModal';
import AddPegawaiModal from '@/components/AddPegawaiModal';

export default async function DataPegawaiPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const limit = 10;
  const offset = (currentPage - 1) * limit;

  const conn = await getConnection();
  
  // Hitung Total Data (untuk navigasi paginasi)
  const countRes: any = await conn.execute(
    `SELECT COUNT(*) as TOTAL FROM "SYSTEM"."USERS" WHERE "ROLE" != 'PEMOHON'`,
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const totalData = countRes.rows[0].TOTAL;
  const totalPages = Math.ceil(totalData / limit);

  // Ambil Data dengan Paginasi
  const result: any = await conn.execute(
    `SELECT "ID_USER", "NAMA_LENGKAP", "EMAIL", "ROLE", "NOMOR_IDENTITAS", "PANGKAT_GOLONGAN", "JABATAN", "NO_TELP_WA"
     FROM "SYSTEM"."USERS" 
     WHERE "ROLE" != 'PEMOHON' 
     ORDER BY "ID_USER" DESC
     OFFSET :1 ROWS FETCH NEXT :2 ROWS ONLY`,
    [offset, limit], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  await conn.close();

  const pegawai = result.rows;

  return (
    <div className="p-8 space-y-8 bg-gray-50/30 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Manajemen Pegawai</h1>
          <p className="text-sm text-gray-500 font-medium">Total {totalData} personil terdaftar di sistem.</p>
        </div>
        {/* Tombol Tambah Pegawai */}
        <AddPegawaiModal />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">
              <th className="px-8 py-5">Nama / Identitas</th>
              <th className="px-6 py-5">Jabatan & Pangkat</th>
              <th className="px-6 py-5">Role</th>
              <th className="px-8 py-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pegawai.map((p: any) => (
              <tr key={p.ID_USER} className="hover:bg-gray-50/50 transition group">
                <td className="px-8 py-6">
                  <p className="font-black text-gray-900 uppercase leading-none mb-1">{p.NAMA_LENGKAP}</p>
                  <p className="text-[10px] font-bold text-gray-400">ID: {p.NOMOR_IDENTITAS || '-'}</p>
                </td>
                <td className="px-6 py-6 text-xs font-bold text-gray-600 uppercase">
                  {p.JABATAN || 'Staf'} <br />
                  <span className="text-[9px] font-medium text-gray-400 normal-case">{p.PANGKAT_GOLONGAN || '-'}</span>
                </td>
                <td className="px-6 py-6">
                    <span className="px-3 py-1 bg-white border rounded-full text-[9px] font-black uppercase tracking-widest text-gray-500">
                        {p.ROLE}
                    </span>
                </td>
                <td className="px-8 py-6 text-right space-x-3">
                  <Link href={`/admin/pegawai/kinerja/${p.ID_USER}`} className="inline-flex items-center gap-2 px-4 py-2.5 border text-[10px] font-black uppercase rounded-xl hover:bg-gray-100 transition">
                    <History size={14} /> Audit
                  </Link>
                  <EditPegawaiModal data={p} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
            <p className="text-xs font-bold text-gray-400 uppercase">Halaman {currentPage} dari {totalPages}</p>
            <div className="flex gap-2">
                <Link 
                    href={`/admin/pegawai?page=${Math.max(1, currentPage - 1)}`}
                    className={`p-2 rounded-xl border bg-white shadow-sm ${currentPage === 1 ? 'opacity-30 pointer-events-none' : 'hover:bg-gray-50'}`}
                >
                    <ChevronLeft size={20} />
                </Link>
                <Link 
                    href={`/admin/pegawai?page=${Math.min(totalPages, currentPage + 1)}`}
                    className={`p-2 rounded-xl border bg-white shadow-sm ${currentPage === totalPages ? 'opacity-30 pointer-events-none' : 'hover:bg-gray-50'}`}
                >
                    <ChevronRight size={20} />
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}