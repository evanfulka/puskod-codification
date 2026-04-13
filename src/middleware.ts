import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode('rahasia_puskod_kemhan_2026');

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = ['/', '/login', '/register'];

  // Izinkan jalur publik dan aset statis
  if (
    publicPaths.includes(pathname) || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/images') || 
    pathname.startsWith('/public') ||
    pathname.startsWith('/uploads')
  ) {
    return NextResponse.next();
  }

  // Jika tidak ada token, arahkan ke login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Proteksi Khusus /admin (Cek Role)
  if (pathname.startsWith('/admin')) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string;
      
      const adminRoles = ['STAF_PUSKOD', 'KATALOGER', 'PIMPINAN', 'ADMINISTRATOR'];
      if (!adminRoles.includes(role)) {
        // Jika dia pemohon tapi mau masuk admin, kembalikan ke halaman utama
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (err) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/profile/:path*'],
};