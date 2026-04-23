import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('foodbridge-session-v2');

  // Redirect authenticated users away from login
  if (pathname === '/login' && session?.value) {
    return NextResponse.redirect(new URL('/dashboard/donor', request.url));
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') && !session?.value) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
