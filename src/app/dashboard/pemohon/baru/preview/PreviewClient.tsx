'use client';

import { useTransition } from 'react';
import { finalSubmitAction } from '../actions';
import Link from 'next/link';

export default function PreviewClient({ draft }: { draft: any }) {
  const [isPending, startTransition] = useTransition();

  const handleFinish = () => {
    if (window.confirm("Apakah Anda yakin seluruh data sudah benar? Data yang sudah dikirim ke Puskod Kemhan tidak dapat diubah kembali secara mandiri.")) {
      startTransition(async () => {
        const result = await finalSubmitAction();
        if (result?.success === false) {
          alert("Gagal mengirim data: " + result.message);
        }
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md border p-10">
      <h1 className="text-2xl font-bold text-[#800000] mb-8 border-b-4 border-[#800000] pb-2 uppercase text-center">
        Review Ringkasan Pendaftaran NSN
      </h1>

      {/* TAHAP 1: ADMINISTRASI*/}
      <section className="mb-8">
        <h3 className="bg-[#800000] text-white px-4 py-2 text-sm font-bold mb-4 rounded">I. DATA ADMINISTRASI</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm px-4">
          <DataField label="No. Dokumen" value={draft.noDokumen} />
          <DataField label="Permintaan Dari" value={draft.permintaanDari} />
          <DataField label="Jabatan" value={draft.jabatan} />
          <DataField label="No. Pegawai" value={draft.noPegawai} />
          <div className="col-span-2">
            <DataField label="Berkas Surat" value={draft.fileSurat} isFile />
          </div>
        </div>
      </section>

      {/* TAHAP 2: IDENTIFIKASI*/}
      <section className="mb-8">
        <h3 className="bg-[#800000] text-white px-4 py-2 text-sm font-bold mb-4 rounded">II. IDENTIFIKASI MATERIIL</h3>
        <div className="space-y-4 px-4 text-sm">
          <DataField label="Nama Barang (Item Name)" value={draft.namaBarang} />
          <DataField label="Definisi Barang" value={draft.definisiBarang} isLongText />
          <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border">
            <DataField label="FSG Title" value={draft.fsgTitle} />
            <DataField label="FSG Notes" value={draft.fsgNotes} isLongText />
            <DataField label="FSC Title" value={draft.fscTitle} />
            <DataField label="FSC Inclusion" value={draft.fscInclusion} isLongText />
            <DataField label="FSC Exclusion" value={draft.fscExclusion} isLongText />
          </div>
        </div>
      </section>

      {/* TAHAP 3: DATA TEKNIS, MANAJEMEN & KARAKTERISTIK */}
        <section className="mb-8">
        <h3 className="bg-[#800000] text-white px-4 py-2 text-sm font-bold mb-4 rounded uppercase">
            III. DATA TEKNIS, MANAJEMEN & KARAKTERISTIK
        </h3>
        
        {/* Nomor Referensi*/}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4 text-sm mb-6">
            <DataField label="CAGE Code" value={draft.cage} />
            <DataField label="Part Number" value={draft.partNumber} />
            <DataField label="MOE Code (Pemakai)" value={draft.moeCode} />
            <div className="flex gap-2">
            <CodeBox label="RNVC" val={draft.rnvc} />
            <CodeBox label="RNCC" val={draft.rncc} />
            <CodeBox label="DAC" val={draft.dac} />
            <CodeBox label="RNAAC" val={draft.rnaac} />
            <CodeBox label="RNSC" val={draft.rnsc} />
            </div>
        </div>
        
        {/* Data Manajemen*/}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4 text-sm bg-gray-50 p-4 rounded-lg border mb-6">
            <DataField label="PMIC (Kandungan Logam)" value={draft.pmic} />
            <DataField label="QUP (Isi Kemasan)" value={draft.qup} />
            <DataField label="Repairable Code" value={draft.repairable} />
            <DataField label="Unit of Issue (Satuan)" value={draft.unitOfIssue} />
            <DataField label="Shelf Life (Usia Pakai)" value={draft.shelfLife} />
            <DataField label="HMIC (Barang Berbahaya)" value={draft.hmic} />
            <DataField label="CIIC (Kontrol Simpan)" value={draft.ciic} />
            <DataField label="Unit Price (Harga)" value={draft.unitPrice} />
        </div>

        {/* Data Karakteristik & Berkas*/}
        <div className="px-4 space-y-4">
            <DataField label="Data Karakteristik Materiil" value={draft.dataKarakteristik} isLongText />
            <div className="grid grid-cols-2 gap-6 mt-4">
            <DataField label="Representative Drawing (Berkas)" value={draft.repDrawing} isFile />
            <DataField label="Technical Drawing (Berkas)" value={draft.techDrawing} isFile />
            </div>
        </div>
        </section>

      {/* TAHAP 4: PERUSAHAAN*/}
      <section className="mb-10">
        <h3 className="bg-[#800000] text-white px-4 py-2 text-sm font-bold mb-4 rounded">IV. DATA PERUSAHAAN (SUPPLIER)</h3>
        <div className="grid grid-cols-2 gap-6 px-4 text-sm">
          <div className="col-span-2"><DataField label="Nama Perusahaan" value={draft.supName} /></div>
          <div className="col-span-2"><DataField label="Alamat" value={draft.supAddress} isLongText /></div>
          <DataField label="Status" value={draft.supStatus} />
          <DataField label="Type" value={draft.supType} />
          <DataField label="Phone" value={draft.supPhone} />
          <DataField label="Email" value={draft.supEmail} />
          <DataField label="Fax" value={draft.supFax} />
          <DataField label="Website" value={draft.supWebsite} />
        </div>
      </section>

      {/* Footer Navigasi */}
      <div className="flex justify-between items-center border-t-2 pt-8">
        <Link href="/dashboard/pemohon/baru/step-4" className="text-gray-500 font-bold hover:text-[#800000] transition flex items-center gap-2">
          ← Kembali & Perbaiki
        </Link>
        <button 
          onClick={handleFinish}
          disabled={isPending}
          className="bg-[#800000] text-white px-12 py-3 rounded-lg font-bold text-lg hover:bg-red-900 transition shadow-xl disabled:bg-gray-400"
        >
          {isPending ? 'Mengirim ke Database...' : 'FINISH & KIRIM'}
        </button>
      </div>
    </div>
  );
}

// Komponen Helper untuk tampilan label-value
function DataField({ label, value, isLongText = false, isFile = false }: any) {
  return (
    <div className={isLongText ? "col-span-2" : ""}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-semibold text-gray-800 ${isFile ? 'text-green-700 italic' : ''}`}>
        {value || "-"}
      </p>
    </div>
  );
}

function CodeBox({ label, val }: any) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[8px] font-bold text-gray-400">{label}</span>
      <div className="w-8 h-8 border-2 border-gray-200 flex items-center justify-center font-bold text-sm rounded bg-white">
        {val || ""}
      </div>
    </div>
  );
}