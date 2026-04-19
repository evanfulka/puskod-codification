'use server';

import { getConnection } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import oracledb from 'oracledb';
import * as XLSX from 'xlsx';
import fs from 'fs';

const SECRET_KEY = new TextEncoder().encode('rahasia_puskod_kemhan_2026');

export async function registerAction(prevState: any, formData: FormData) {
  const namaLengkap = formData.get('namaLengkap') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const ncageKode = formData.get('ncageKode') as string;
  const namaPerusahaan = formData.get('namaPerusahaan') as string;
  const noTelp = formData.get('noTelp') as string;

  if (password !== confirmPassword) {
    return { success: false, message: "Konfirmasi password tidak cocok." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const conn = await getConnection();

  try {
    await conn.execute(
      `INSERT INTO "SYSTEM"."USERS" 
      ("NAMA_LENGKAP", "EMAIL", "PASSWORD", "ROLE", "NCAGE_KODE", "NAMA_PERUSAHAAN", "NO_TELP_WA") 
      VALUES (:1, :2, :3, 'PEMOHON', :4, :5, :6)`,
      [namaLengkap, email, hashedPassword, ncageKode, namaPerusahaan, noTelp]
    );
    await conn.commit();
    return { success: true, message: "Registrasi berhasil!" }; // Kembalikan success, jangan redirect di sini
  } catch (err: any) {
    if (err.message.includes('ORA-00001')) return { success: false, message: "Email sudah terdaftar." };
    return { success: false, message: "Terjadi kesalahan database." };
  } finally {
    await conn.close();
  }
}

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const conn = await getConnection();
  let targetPath = '';

  try {
    const result: any = await conn.execute(
      `SELECT "ID_USER", "PASSWORD", "ROLE", "NAMA_LENGKAP" FROM "SYSTEM"."USERS" WHERE "EMAIL" = :1`,
      [email]
    );

    if (result.rows.length === 0) {
      return { success: false, message: "Akun tidak ditemukan." };
    }

    const [id, hash, role, nama] = result.rows[0];
    const isMatch = await bcrypt.compare(password, hash);

    if (isMatch) {
      const token = await new SignJWT({ userId: id, role: role, name: nama })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('2h')
        .sign(SECRET_KEY);

      const cookieStore = await cookies();
      cookieStore.set('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60,
        path: '/'
      });

      targetPath = role === 'PEMOHON' ? '/' : '/admin';
    } else {
      return { success: false, message: "Password salah." };
    }
  } catch (err) {
    return { success: false, message: "Terjadi kesalahan server." };
  } finally {
    await conn.close();
  }

  if (targetPath) redirect(targetPath);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session_token');
  redirect('/');
}

export async function submitPermohonanAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return { success: false, message: "Sesi habis, silakan login ulang." };

  const conn = await getConnection();

  try {
    const { payload }: any = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId;

    // Ambil data dari form
    const ncage = formData.get('ncage') as string;
    const toec = formData.get('toec') as string;
    const namaPerusahaan = formData.get('namaPerusahaan') as string;
    const namaLengkap = formData.get('namaLengkap') as string;
    const alamat = formData.get('alamat') as string;
    const noIdentitas = formData.get('noIdentitas') as string;
    const noTelp = formData.get('noTelp') as string;
    const email = formData.get('email') as string;
    const jabatan = formData.get('jabatan') as string;
    const pengadaan = formData.get('pengadaan') as string;
    const noSurat = formData.get('noSurat') as string;
    const noKontrak = formData.get('noKontrak') as string;
    const tglKontrak = formData.get('tglKontrak') as string;

    // Insert ke Database menggunakan Object Binding
    const result: any = await conn.execute(
      `INSERT INTO "SYSTEM"."PERMOHONAN_HEADER" (
        "ID_USER", "NCAGE", "TOEC", "NAMA_PERUSAHAAN", "NAMA_LENGKAP", "ALAMAT", 
        "NOMOR_IDENTITAS", "NOMOR_TELEPON", "EMAIL_PERUSAHAAN", "JABATAN", 
        "PENGADAAN", "NO_SURAT_PERMOHONAN", "NO_KONTRAK", "TANGGAL_KONTRAK"
      ) VALUES (
        :v_user, :v_ncage, :v_toec, :v_comp, :v_nama, :v_alamat, 
        :v_id, :v_telp, :v_email, :v_jab, :v_peng, :v_surat, :v_kon, TO_DATE(:v_tgl, 'YYYY-MM-DD')
      ) RETURNING "ID_PERMOHONAN" INTO :out_id`,
      {
        v_user: userId,
        v_ncage: ncage,
        v_toec: toec,
        v_comp: namaPerusahaan,
        v_nama: namaLengkap,
        v_alamat: alamat,
        v_id: noIdentitas,
        v_telp: noTelp,
        v_email: email,
        v_jab: jabatan,
        v_peng: pengadaan,
        v_surat: noSurat,
        v_kon: noKontrak,
        v_tgl: tglKontrak,
        out_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: false } // Commit belakangan setelah file aman
    );

    // Ambil ID yang baru saja digenerate
    const idPermohonan = result.outBinds.out_id[0];
    const sanitizedCompName = namaPerusahaan.replace(/[^a-z0-9]/gi, '-').toUpperCase();

    // Proses Upload File
    const files = [
      { key: 'fileSurat', label: 'SURAT-PERMOHONAN' },
      { key: 'fileKontrak', label: 'DOKUMEN-KONTRAK' },
      { key: 'fileMateriil', label: 'DOKUMEN-MATERIIL' },
      { key: 'fileIpc', label: 'DOKUMEN-IPC-IPB' }
    ];

    const filePaths: any = {};

    for (const f of files) {
      const file = formData.get(f.key) as File;
      if (file && file.size > 0) {
        const ext = path.extname(file.name);
        const fileName = `${idPermohonan}_${sanitizedCompName}_${f.label}${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = path.join(process.cwd(), 'public/uploads/permohonan', fileName);
        
        await writeFile(filePath, buffer);
        filePaths[f.key] = `/uploads/permohonan/${fileName}`;
      }
    }

    // Update File Paths ke Database & Commit Permanen
    await conn.execute(
      `UPDATE "SYSTEM"."PERMOHONAN_HEADER" SET 
        "FILE_SURAT_PERMOHONAN" = :1, 
        "FILE_DOKUMEN_KONTRAK" = :2, 
        "FILE_DOKUMEN_MATERIIL" = :3, 
        "FILE_IPC_IPB" = :4 
      WHERE "ID_PERMOHONAN" = :5`,
      [filePaths.fileSurat || null, filePaths.fileKontrak || null, filePaths.fileMateriil || null, filePaths.fileIpc || null, idPermohonan]
    );

    await conn.commit();
    return { success: true, message: "Permohonan berhasil disimpan!" };

  } catch (err: any) {
    await conn.rollback();
    console.error(err);
    return { success: false, message: "Gagal menyimpan data: " + err.message };
  } finally {
    await conn.close();
  }
}

export async function updateStatusAction(idPermohonan: number, statusBaru: string, catatan: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return { success: false, message: "Sesi habis." };

  const conn = await getConnection();

  try {
    const { payload }: any = await jwtVerify(token, SECRET_KEY);
    const userIdPetugas = payload.userId;

    // --- LOGIKA OTOMATISASI EXCEL ---
    // Jika Staf klik "Mulai Verifikasi", baca Excel-nya
    if (statusBaru === 'Verifikasi Berkas') {
      // Hapus dulu data lama jika ada (mencegah duplikat kalau diklik ulang)
      await conn.execute(`DELETE FROM "SYSTEM"."PERMOHONAN_MATERIIL" WHERE "ID_PERMOHONAN" = :1`, [idPermohonan]);
      
      // Jalankan fungsi ekstraksi
      await extractMateriilFromExcel(idPermohonan, conn);
    }
    // --------------------------------

    // Update Status di Header
    await conn.execute(
      `UPDATE "SYSTEM"."PERMOHONAN_HEADER" SET "STATUS_SAAT_INI" = :1 WHERE "ID_PERMOHONAN" = :2`,
      [statusBaru, idPermohonan]
    );

    // Catat di Log
    await conn.execute(
      `INSERT INTO "SYSTEM"."PERMOHONAN_LOG" ("ID_PERMOHONAN", "STATUS", "KETERANGAN", "ID_USER_PETUGAS") 
       VALUES (:1, :2, :3, :4)`,
      [idPermohonan, statusBaru, catatan, userIdPetugas]
    );

    await conn.commit();
    return { success: true, message: `Status berhasil diperbarui menjadi: ${statusBaru}` };

  } catch (err: any) {
    await conn.rollback();
    return { success: false, message: err.message };
  } finally {
    await conn.close();
  }
}

export async function terbitkanSprinAction(idPermohonan: number, tim: { idUser: number, posisi: string }[]) {
  const conn = await getConnection();

  try {
    // Simpan Anggota Tim ke PERMOHONAN_TEAM
    for (const person of tim) {
      await conn.execute(
        `INSERT INTO "SYSTEM"."PERMOHONAN_TEAM" ("ID_PERMOHONAN", "ID_USER_PETUGAS", "POSISI") 
         VALUES (:1, :2, :3)`,
        [idPermohonan, person.idUser, person.posisi]
      );
    }

    // Update status ke Kataloger
    const nextStatus = 'Proses Pengerjaan Kodifikasi';
    await conn.execute(
      `UPDATE "SYSTEM"."PERMOHONAN_HEADER" SET "STATUS_SAAT_INI" = :1 WHERE "ID_PERMOHONAN" = :2`,
      [nextStatus, idPermohonan]
    );

    // Catat Log
    await conn.execute(
      `INSERT INTO "SYSTEM"."PERMOHONAN_LOG" ("ID_PERMOHONAN", "STATUS", "KETERANGAN") 
       VALUES (:1, :2, :3)`,
      [idPermohonan, nextStatus, 'Tim SPRIN telah ditetapkan. Menunggu pengerjaan kodifikasi oleh Kataloger.']
    );

    await conn.commit();
    return { success: true, message: "SPRIN Berhasil Terbit! Tugas diteruskan ke Kataloger." };
  } catch (err: any) {
    await conn.rollback();
    return { success: false, message: err.message };
  } finally {
    await conn.close();
  }
}

// Fungsi pembantu untuk membaca Excel dan simpan ke DB
async function extractMateriilFromExcel(idPermohonan: number, conn: any) {
  console.log(`--- Memulai Ekstraksi Excel untuk ID: ${idPermohonan} ---`);

  // Cari path file dari DB
  const result: any = await conn.execute(
    `SELECT "FILE_DOKUMEN_MATERIIL" FROM "SYSTEM"."PERMOHONAN_HEADER" WHERE "ID_PERMOHONAN" = :1`,
    [idPermohonan],
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  console.log("Raw Result from DB:", JSON.stringify(result.rows[0]));

  // Gunakan optional chaining dan pastikan nama kolom HURUF BESAR
  const row = result.rows[0];
  const relativePath = row?.FILE_DOKUMEN_MATERIIL; 

  if (!relativePath) {
    console.log("Error: Kolom FILE_DOKUMEN_MATERIIL kosong atau tidak ditemukan.");
    return;
  }

  // Membangun Path File yang Benar
  // Hilangkan slash di awal jika ada agar path.join tidak bingung di Windows
  const cleanRelativePath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
  const fullPath = path.join(process.cwd(), 'public', cleanRelativePath);
  
  console.log("Mencoba membaca file fisik di:", fullPath);

  if (!fs.existsSync(fullPath)) {
    console.log("Error: File fisik tidak ditemukan di path tersebut.");
    return;
  }

  // Baca file Excel
  const fileBuffer = fs.readFileSync(fullPath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Ambil data sebagai JSON
  const rows: any[] = XLSX.utils.sheet_to_json(sheet);
  
  console.log(`Berhasil membaca Excel. Jumlah baris data: ${rows.length}`);

  // Looping dan Insert
  for (const rowData of rows) {
    await conn.execute(
      `INSERT INTO "SYSTEM"."PERMOHONAN_MATERIIL" (
        "ID_PERMOHONAN", "NAMA_MATERIIL", "PART_NUMBER", "NSN_MITRA", 
        "SPEKTEK", "IPCIPB", "GAMBAR_MATERIIL", "NAMA_PENYEDIA", 
        "NCAGE_PENYEDIA", "NEGARA_PENYEDIA"
      ) VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10)`,
      [
        idPermohonan, 
        rowData.nama_materiil || null, 
        rowData.part_number || null, 
        rowData.nsn || null,
        rowData.spektek || null,
        rowData.ipcipb || null,
        rowData.gambar_materiil || null,
        rowData.nama_penyedia || null,
        rowData.ncage_penyedia || null,
        rowData.negara_penyedia || null
      ]
    );
  }
  
  console.log(`--- Ekstraksi Selesai: ${rows.length} item masuk ke DB ---`);
}

export async function saveMateriilAction(idMateriil: any, formData: any) {
  const conn = await getConnection();
  try {
    // Siapkan Object Binds (Kita mulai dengan ID_MATERIIL sebagai :id)
    const binds: any = { 
      id: Number(idMateriil) 
    };
    
    const setClauses: string[] = [];

    // Looping data untuk membangun SET clause dan mengisi Object Binds
    Object.keys(formData).forEach((key) => {
      if (key === key.toUpperCase() && key !== 'ID_MATERIIL' && key !== 'ID_PERMOHONAN' && key !== 'TGL') {
        let value = formData[key];

        if (key === 'UP_PRICE') {
          if (value === "" || value === null || value === undefined) {
            value = null;
          } else {
            const cleanedNum = String(value).replace(/[^0-9.]/g, "");
            value = (cleanedNum === "" || isNaN(Number(cleanedNum))) ? null : Number(cleanedNum);
          }
        } else {
          value = (value === "" || value === undefined || value === null) ? null : String(value);
        }

        // Simpan ke object binds dengan key yang sama
        binds[key] = value;
        // Gunakan nama key sebagai bind variable
        setClauses.push(`"${key}" = :${key}`);
      }
    });

    if (setClauses.length === 0) return { success: false, message: "Tidak ada data." };

    // Susun SQL dengan Named Binds
    const sql = `UPDATE "SYSTEM"."PERMOHONAN_MATERIIL" SET ${setClauses.join(', ')} WHERE "ID_MATERIIL" = :id`;
    
    console.log("Menjalankan UPDATE dengan Named Binds...");
    
    // Kirim 'binds' sebagai OBJECT, bukan ARRAY
    const result = await conn.execute(sql, binds);
    
    await conn.commit();
    return { success: true, message: "Data materiil berhasil disimpan." };

  } catch (err: any) {
    console.error("DATABASE ERROR DETAIL:", err);
    if (conn) await conn.rollback();
    return { success: false, message: "Gagal menyimpan: " + err.message };
  } finally {
    if (conn) await conn.close();
  }
}

// Action untuk Ketua Tim menyelesaikan seluruh proses
export async function selesaikanKodifikasiAction(idPermohonan: number) {
  const conn = await getConnection();
  try {
    const nextStatus = 'Berita Acara dan Hasil Kodifikasi';
    await conn.execute(
      `UPDATE "SYSTEM"."PERMOHONAN_HEADER" SET "STATUS_SAAT_INI" = :1 WHERE "ID_PERMOHONAN" = :2`,
      [nextStatus, idPermohonan]
    );
    await conn.execute(
      `INSERT INTO "SYSTEM"."PERMOHONAN_LOG" ("ID_PERMOHONAN", "STATUS", "KETERANGAN") 
       VALUES (:1, :2, :3)`,
      [idPermohonan, nextStatus, 'Proses kodifikasi dinyatakan selesai oleh Ketua Tim. Menunggu upload Berita Acara.']
    );
    await conn.commit();
    return { success: true, message: "Seluruh proses kodifikasi selesai!" };
  } catch (err: any) {
    await conn.rollback();
    return { success: false, message: err.message };
  } finally {
    await conn.close();
  }
}