'use server';

import { getConnection } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { redirect } from 'next/navigation';

const SECRET_KEY = new TextEncoder().encode('rahasia_puskod_kemhan_2026');

export async function registerAction(prevState: any,formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const namaLengkap = formData.get('namaLengkap') as string;
  const namaPerusahaan = formData.get('namaPerusahaan') as string;
  const noTelp = formData.get('noTelp') as string;

  const hashedPassword = await bcrypt.hash(password, 10);
  const conn = await getConnection();

  try {
    await conn.execute(
      `INSERT INTO USERS (NAMA_LENGKAP_POC, EMAIL, NAMA_PERUSAHAAN, NO_TELP_WA, PASSWORD, ROLE) 
       VALUES (:1, :2, :3, :4, :5, 'PEMOHON')`,
      [namaLengkap, email, namaPerusahaan, noTelp, hashedPassword]
    );
    await conn.commit();
  } catch (err) {
    return { success: false, message: "Email sudah terdaftar atau terjadi kesalahan database." };
  } finally {
    await conn.close();
  }
  redirect('/login');
}

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const conn = await getConnection();
  let targetPath = ''; // Variabel untuk menentukan arah redirect

  try {
    const result: any = await conn.execute(
      `SELECT ID_USER, PASSWORD, ROLE, NAMA_LENGKAP_POC FROM USERS WHERE EMAIL = :1`,
      [email]
    );

    if (result.rows.length === 0) {
      await conn.close();
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
        maxAge: 60 * 60 * 2, // 2 Jam
        path: '/'
      });
      
      // Tentukan halaman tujuan berdasarkan Role
      if (role === 'PEMOHON') {
        targetPath = '/';
      } else {
        // Untuk STAF_PUSKOD, KATALOGER, PIMPINAN, ADMINISTRATOR
        targetPath = '/admin';
      }

    } else {
      await conn.close();
      return { success: false, message: "Password salah." };
    }
  } catch (err) {
    console.error("Login Error:", err);
    return { success: false, message: "Terjadi kesalahan pada server." };
  } finally {
    // Pastikan koneksi ditutup sebelum redirect
    await conn.close();
  }

  // Jalankan redirect di luar blok try-finally agar Next.js bisa memprosesnya dengan benar
  if (targetPath) {
    redirect(targetPath);
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session_token');
  redirect('/');
}