import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import svgCaptcha from 'svg-captcha';

export async function GET() {
  // Generate teks acak (5 karakter) dan gambar SVG-nya
  const captcha = svgCaptcha.create({
    size: 5,
    noise: 3, // Tambahkan garis acak agar sulit dibaca bot
    color: true,
    background: '#f8f9fa',
  });

  // Siapkan response berupa gambar SVG
  const response = new NextResponse(captcha.data, {
    headers: { 'Content-Type': 'image/svg+xml' },
  });

  // Simpan teks jawaban di HttpOnly cookie (hanya bisa dibaca oleh server)
  const cookieStore = await cookies();
  cookieStore.set('captcha_token', captcha.text, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 300, // Berlaku 5 menit
  });

  return response;
}