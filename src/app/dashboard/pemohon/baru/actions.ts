'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { writeFile, mkdir, rename } from 'fs/promises';
import path from 'path';
import { getConnection } from '@/lib/db';
import { jwtVerify } from 'jose';
import oracledb from 'oracledb';

const SECRET_KEY = new TextEncoder().encode('rahasia_puskod_kemhan_2026');

async function getDraft() {
  const cookieStore = await cookies();
  const draft = cookieStore.get('form_draft')?.value;
  return draft ? JSON.parse(draft) : {};
}

// STEP 1: Simpan Administrasi ke Cookie
export async function submitStep1(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const currentDraft = await getDraft();
  
  const fileSurat = formData.get('fileSurat') as File;
  const permintaanDari = formData.get('permintaanDari') as string;

  let fileName = currentDraft.fileSurat || ""; // Gunakan file lama jika ada

  // Hanya upload jika ada file baru yang dipilih user
  if (fileSurat && fileSurat.size > 0) {
    const buffer = Buffer.from(await fileSurat.arrayBuffer());
    // Gunakan nama tetap selama masa draft agar tidak duplikat
    fileName = `draft_${permintaanDari.replace(/\s+/g, '-')}.pdf`;
    const uploadDir = path.join(process.cwd(), 'public/uploads/dokumen_permohonan');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);
  }

  const dataStep1 = {
    ...currentDraft,
    noDokumen: formData.get('noDokumen'),
    permintaanDari: permintaanDari,
    jabatan: formData.get('jabatan'),
    noPegawai: formData.get('noPegawai'),
    fileSurat: fileName,
    currentStep: 2
  };

  // PENTING: Set path ke '/' agar cookie bisa dibaca di semua halaman
  (await cookieStore).set('form_draft', JSON.stringify(dataStep1), { 
    path: '/', 
    maxAge: 60
  });
  
  redirect('/dashboard/pemohon/baru/step-2');
}

// STEP 2: Identifikasi
export async function submitStep2(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const currentDraft = await getDraft(); // Helper yang sudah kita buat

  const dataUpdate = {
    ...currentDraft, // Jaga data Step 1
    namaBarang: formData.get('namaBarang'),
    definisiBarang: formData.get('definisiBarang'),
    fsgTitle: formData.get('fsgTitle'),
    fsgNotes: formData.get('fsgNotes'),
    fscTitle: formData.get('fscTitle'),
    fscInclusion: formData.get('fscInclusion'),
    fscExclusion: formData.get('fscExclusion'),
    currentStep: 3 // Target selanjutnya
  };

  (await cookieStore).set('form_draft', JSON.stringify(dataUpdate), { path: '/' });
  redirect('/dashboard/pemohon/baru/step-3');
}

// STEP 3: Teknis
export async function submitStep3(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const currentDraft = await getDraft();
  
  const repFile = formData.get('repDrawing') as File;
  const techFile = formData.get('techDrawing') as File;
  const permintaanDari = currentDraft.permintaanDari || "Perusahaan";

  const uploadDir = path.join(process.cwd(), 'public/uploads/dokumen_permohonan');
  await mkdir(uploadDir, { recursive: true });

  let repFileName = currentDraft.repDrawing || "";
  let techFileName = currentDraft.techDrawing || "";

  // Logika Upload Representative Drawing
  if (repFile && repFile.size > 0) {
    const buffer = Buffer.from(await repFile.arrayBuffer());
    repFileName = `DRAFT_${permintaanDari.replace(/\s+/g, '-')}_Representative-Drawing.pdf`;
    await writeFile(path.join(uploadDir, repFileName), buffer);
  }

  // Logika Upload Technical Drawing
  if (techFile && techFile.size > 0) {
    const buffer = Buffer.from(await techFile.arrayBuffer());
    techFileName = `DRAFT_${permintaanDari.replace(/\s+/g, '-')}_Technical-Drawing.pdf`;
    await writeFile(path.join(uploadDir, techFileName), buffer);
  }

  const dataUpdate = {
    ...currentDraft,
    // Nomor Referensi
    cage: formData.get('cage'),
    partNumber: formData.get('partNumber'),
    rnvc: formData.get('rnvc'),
    rncc: formData.get('rncc'),
    dac: formData.get('dac'),
    rnaac: formData.get('rnaac'),
    rnsc: formData.get('rnsc'),
    moeCode: formData.get('moeCode'),
    // Data Manajemen
    pmic: formData.get('pmic'),
    qup: formData.get('qup'),
    repairable: formData.get('repairable'),
    unitOfIssue: formData.get('unitOfIssue'),
    shelfLife: formData.get('shelfLife'),
    hmic: formData.get('hmic'),
    ciic: formData.get('ciic'),
    unitPrice: formData.get('unitPrice'),
    dataKarakteristik: formData.get('dataKarakteristik'),
    // Data Karakteristik (Path Berkas)
    repDrawing: repFileName,
    techDrawing: techFileName,
    currentStep: 4
  };

  (await cookieStore).set('form_draft', JSON.stringify(dataUpdate), { path: '/' });
  redirect('/dashboard/pemohon/baru/step-4');
}

// STEP 4: Perusahaan
export async function submitStep4(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const currentDraft = await getDraft();

  const dataUpdate = {
    ...currentDraft,
    // Data Perusahaan 
    supStatus: formData.get('supStatus'),
    supType: formData.get('supType'),
    supName: formData.get('supName'),
    supAddress: formData.get('supAddress'),
    supPhone: formData.get('supPhone'),
    supFax: formData.get('supFax'),
    supWebsite: formData.get('supWebsite'),
    supEmail: formData.get('supEmail'),
    currentStep: 5 // Menuju Preview
  };

  (await cookieStore).set('form_draft', JSON.stringify(dataUpdate), { path: '/' });
  redirect('/dashboard/pemohon/baru/preview');
}

export async function finalSubmitAction() {
  const cookieStore = await cookies();
  const draftRaw = cookieStore.get('form_draft')?.value;
  const sessionToken = cookieStore.get('session_token')?.value;

  if (!draftRaw || !sessionToken) {
    return { success: false, message: "Draft pendaftaran atau sesi login tidak ditemukan." };
  }

  const draft = JSON.parse(draftRaw);
  
  // Ambil ID User dari JWT
  let idUser: number;
  try {
    const { payload } = await jwtVerify(sessionToken, SECRET_KEY);
    idUser = Number(payload.userId);
  } catch (e) {
    return { success: false, message: "Sesi tidak valid." };
  }

  const conn = await getConnection();

  try {
    // INSERT SEMUA FIELD
    const sql = `
      INSERT INTO PERMOHONAN_NSN (
        ID_USER, NO_DOKUMEN, PERMINTAAN_DARI, JABATAN_PEMOHON, NO_PEGAWAI,
        NAMA_BARANG, DEFINISI_BARANG, FSG_TITLE, FSG_NOTES, FSC_TITLE, FSC_INCLUSION, FSC_EXCLUSION,
        CAGE_CODE, PART_NUMBER, RNVC, RNCC, DAC, RNAAC, RNSC, MOE_CODE,
        PMIC, QUP, REPAIRABLE, UNIT_OF_ISSUE, SHELF_LIFE, HMIC, CIIC, UNIT_PRICE, DATA_KARAKTERISTIK,
        SUP_NAME, SUP_ADDRESS, SUP_PHONE, SUP_FAX, SUP_WEBSITE, SUP_EMAIL, SUP_STATUS, SUP_TYPE,
        STATUS_PENGAJUAN
      ) VALUES (
        :idUser, :noDok, :dari, :jab, :noPeg,
        :namaBrg, :defBrg, :fsgT, :fsgN, :fscT, :fscI, :fscE,
        :cage, :part, :rnvc, :rncc, :dac, :rnaac, :rnsc, :moe,
        :pmic, :qup, :rep, :uoi, :shelf, :hmic, :ciic, :price, :dataKarakter,
        :sName, :sAddr, :sPhone, :sFax, :sWeb, :sEmail, :sStat, :sType,
        'Menunggu Verifikasi'
      ) RETURNING ID_PERMOHONAN INTO :rid`;

    const result: any = await conn.execute(sql, {
      idUser,
      noDok: draft.noDokumen || "",
      dari: draft.permintaanDari || "",
      jab: draft.jabatan || "",
      noPeg: draft.noPegawai || "",
      namaBrg: draft.namaBarang || "",
      defBrg: draft.definisiBarang || "",
      fsgT: draft.fsgTitle || "",
      fsgN: draft.fsgNotes || "",
      fscT: draft.fscTitle || "",
      fscI: draft.fscInclusion || "",
      fscE: draft.fscExclusion || "",
      cage: draft.cage || "",
      part: draft.partNumber || "",
      rnvc: draft.rnvc || "",
      rncc: draft.rncc || "",
      dac: draft.dac || "",
      rnaac: draft.rnaac || "",
      rnsc: draft.rnsc || "",
      moe: draft.moeCode || "",
      pmic: draft.pmic || "",
      qup: Number(draft.qup) || 0,
      rep: draft.repairable || "",
      uoi: draft.unitOfIssue || "",
      shelf: draft.shelfLife || "",
      hmic: draft.hmic || "",
      ciic: draft.ciic || "",
      price: draft.unitPrice || "",
      dataKarakter: draft.dataKarakteristik || "",
      sName: draft.supName || "",
      sAddr: draft.supAddress || "",
      sPhone: draft.supPhone || "",
      sFax: draft.supFax || "",
      sWeb: draft.supWebsite || "",
      sEmail: draft.supEmail || "",
      sStat: draft.supStatus || "",
      sType: draft.supType || "",
      rid: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
    });

    const idBaru = result.outBinds.rid[0];
    const uploadDir = path.join(process.cwd(), 'public/uploads/dokumen_permohonan');

    // LOGIKA RENAME FILES: Dari status DRAFT menjadi Nama Permanen
    const filesToRename = [
      { key: 'fileSurat', suffix: 'Surat-Permohonan', col: 'FILE_SURAT_PERMOHONAN' },
      { key: 'repDrawing', suffix: 'Representative-Drawing', col: 'FILE_REPRESENTATIVE_DRAWING' },
      { key: 'techDrawing', suffix: 'Technical-Drawing', col: 'FILE_TECHNICAL_DRAWING' }
    ];

    for (const f of filesToRename) {
      if (draft[f.key]) {
        const oldName = draft[f.key];
        const newName = `${idBaru}_${draft.permintaanDari.replace(/\s+/g, '-')}_${f.suffix}.pdf`;
        
        try {
          await rename(path.join(uploadDir, oldName), path.join(uploadDir, newName));
          // Update path file permanen di database
          await conn.execute(
            `UPDATE PERMOHONAN_NSN SET ${f.col} = :1 WHERE ID_PERMOHONAN = :2`,
            [newName, idBaru]
          );
        } catch (err) {
          console.error(`Gagal rename ${f.key}:`, err);
        }
      }
    }

    await conn.commit();
    cookieStore.delete('form_draft'); // Hapus draft jika sukses
    return { success: true };

  } catch (err: any) {
    console.error("ERROR FINAL SUBMIT:", err);
    return { success: false, message: `Database Error: ${err.message}` };
  } finally {
    await conn.close();
  }
}