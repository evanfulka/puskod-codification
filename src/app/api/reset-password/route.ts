import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import oracledb from 'oracledb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  let conn;
  try {
    const { token, newPassword } = await request.json();
    conn = await getConnection();

    // Cari user berdasarkan token dan pastikan belum kadaluarsa
    const result: any = await conn.execute(
      `SELECT "ID_USER" FROM "SYSTEM"."USERS" 
       WHERE "RESET_TOKEN" = :token 
       AND "RESET_TOKEN_EXPIRY" > CURRENT_TIMESTAMP`,
      { token: token },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Tautan tidak valid atau masa berlaku token sudah habis (lebih dari 1 jam)." }, 
        { status: 400 }
      );
    }

    const userId = result.rows[0].ID_USER;

    // Hash password baru agar sinkron dengan sistem Login/Register Anda
    // Menggunakan salt rounds 10, persis seperti di auth-actions.ts
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password (gunakan hashedPassword) dan bersihkan token
    await conn.execute(
      `UPDATE "SYSTEM"."USERS" 
       SET "PASSWORD" = :newPassword, 
           "RESET_TOKEN" = NULL, 
           "RESET_TOKEN_EXPIRY" = NULL
       WHERE "ID_USER" = :id`,
      { 
        newPassword: hashedPassword, // Disimpan sebagai hash yang aman
        id: userId 
      },
      { autoCommit: true }
    );

    return NextResponse.json({ message: "Password berhasil diubah. Anda akan dialihkan ke halaman login." });

  } catch (error) {
    console.error("Error eksekusi reset password:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server saat menyimpan password baru." }, 
      { status: 500 }
    );
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Gagal menutup koneksi:", err);
      }
    }
  }
}