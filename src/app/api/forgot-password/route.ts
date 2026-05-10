import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  let conn;
  try {
    const { email } = await request.json();
    conn = await getConnection();

    // Cek email di database
    const userResult: any = await conn.execute(
      `SELECT "ID_USER", "NAMA_PERUSAHAAN" FROM "SYSTEM"."USERS" WHERE "EMAIL" = :email`,
      { email: email }
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: "Jika email terdaftar pada sistem kami, tautan reset telah dikirim." });
    }

    const namaPerusahaan = userResult.rows[0][1] || 'Pelanggan';

    // Generate Token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiryTime = new Date(Date.now() + 3600000);

    // Simpan Token
    await conn.execute(
      `UPDATE "SYSTEM"."USERS" 
       SET "RESET_TOKEN" = :token, 
           "RESET_TOKEN_EXPIRY" = :expiry
       WHERE "EMAIL" = :email`,
      { 
        token: resetToken, 
        expiry: expiryTime,
        email: email 
      },
      { autoCommit: true }
    );

    // Eksekusi Pengiriman Email Sungguhan
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const resetLink = `${protocol}://${host}/reset-password?token=${resetToken}`;

    // Konfigurasi SMTP Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Desain Email HTML (Sesuai dengan brand guideline Puskod)
    const mailOptions = {
      from: `"Pelayanan NSN Puskod" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Permintaan Reset Password - Portal Pelayanan NSN',
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 30px; border: 1px solid #E5E7EB; border-radius: 12px; background-color: #FFFFFF;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #800000; margin: 0; text-transform: uppercase;">Portal Pelayanan NSN</h2>
            <p style="color: #6B7280; font-size: 12px; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">Pusat Kodifikasi Kemhan</p>
          </div>
          
          <p style="color: #1A1A1A;">Yth. Perwakilan POC <strong>${namaPerusahaan}</strong>,</p>
          <p style="color: #4B5563; line-height: 1.6;">Kami menerima permintaan untuk mengatur ulang password akun Anda di portal Pelayanan Nomor Sediaan Nasional (NSN). Silakan klik tombol di bawah ini untuk membuat password baru.</p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetLink}" style="background-color: #800000; color: #FFFFFF; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password Sekarang</a>
          </div>
          
          <p style="color: #4B5563; line-height: 1.6; font-size: 14px;">Tautan ini hanya berlaku selama <strong>1 jam</strong> demi keamanan akun Anda. Jika Anda tidak merasa meminta perubahan password, mohon abaikan email ini.</p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
          <p style="font-size: 12px; color: #9CA3AF; text-align: center; line-height: 1.5;">
            Email ini dikirim secara otomatis oleh sistem, mohon tidak membalas email ini.<br/>
            © 2026 Pusat Kodifikasi, Baranahan, Kementerian Pertahanan Republik Indonesia.
          </p>
        </div>
      `,
    };

    // Kirim email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Jika email terdaftar pada sistem kami, tautan reset telah dikirim." });

  } catch (error) {
    console.error("Error forgot password API:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server saat memproses permintaan." }, 
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