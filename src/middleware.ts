import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Ako je hash sa recovery tokenom, prebaci direktno na reset-password
  if (url.pathname === '/' && url.hash.includes('type=recovery')) {
    url.pathname = '/reset-password';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: '/'
};