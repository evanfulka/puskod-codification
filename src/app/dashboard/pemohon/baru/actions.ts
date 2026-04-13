'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getConnection } from '@/lib/db';

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
    maxAge: 60 * 60 * 24 
  });
  
  redirect('/dashboard/pemohon/baru/step-2');
}

// STEP 2: Update Cookie dengan Identifikasi
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