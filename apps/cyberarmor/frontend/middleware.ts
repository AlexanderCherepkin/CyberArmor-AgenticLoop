import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, locales, type Locale } from './lib/i18n/config';

const PUBLIC_FILE = /\.[a-zA-Z0-9]+$/;

function getLocale(request: NextRequest): Locale {
  const header = request.headers.get('accept-language') || '';
  const preferred = header.split(',')[0].split('-')[0].toLowerCase();
  if ((locales as readonly string[]).includes(preferred)) {
    return preferred as Locale;
  }
  return defaultLocale;
}

function buildCSP() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self' ${apiUrl}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ];
  return csp.join('; ');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_FILE.test(pathname) || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', buildCSP());

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return response;
  }

  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|robots.txt|sitemap.xml|api).*)'],
};
