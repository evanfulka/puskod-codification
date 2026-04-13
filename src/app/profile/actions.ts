'use server';

import { cookies } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getConnection } from '@/lib/db';
import { jwtVerify } from 'jose';
import { revalidatePath } from 'next/cache';

const SECRET_KEY = new TextEncoder().encode('rahasia_puskod_kemhan_2026');

export async function updateProfileAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const sessionToken = (await cookieStore).get('session_token')?.value;
  
  if (!sessionToken) return { success: false, message: "Sesi tidak ditemukan." };

  try {
    const { payload } = await jwtVerify(sessionToken, SECRET_KEY);
    const idUser = Number(payload.userId);

    const namaPoc = formData.get('namaPoc') as string;
    const namaPerusahaan = formData.get('namaPerusahaan') as string;
    const noTelp = formData.get('noTelp') as string;
    const file = formData.get('foto') as File;

    const conn = await getConnection();
    let fileName = "";

    // Logika Simpan Foto
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || '.png';
      fileName = `profile_${idUser}${ext}`;
      
      const uploadDir = path.join(process.cwd(), 'public/uploads/profiles');
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, fileName), buffer);
    }

    // Update Database sesuai struktur tabel USERS
    const sql = `
      UPDATE USERS 
      SET NAMA_LENGKAP_POC = :1, 
          NAMA_PERUSAHAAN = :2, 
          NO_TELP_WA = :3, 
          FOTO_PROFIL = COALESCE(:4, FOTO_PROFIL),
          UPDATED_AT = CURRENT_TIMESTAMP
      WHERE ID_USER = :5`;

    await conn.execute(sql, [namaPoc, namaPerusahaan, noTelp, fileName || null, idUser]);
    await conn.commit();
    await conn.close();

    revalidatePath('/profile');
    return { success: true, message: "Profil berhasil diperbarui!" };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err.message };
  }
}