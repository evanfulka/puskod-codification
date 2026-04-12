import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session_token');
  const { pathname } = request.nextUrl;

  const publicPaths = [
    '/',         
    '/login',    
    '/register', 
  ];

  if (
    publicPaths.includes(pathname) || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/images') || 
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  if (!token) {
    // Arahkan ke login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}