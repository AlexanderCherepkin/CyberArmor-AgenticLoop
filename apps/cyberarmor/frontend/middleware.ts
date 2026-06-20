import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, locales, type Locale } from './lib/i18n/config';

const PUBLIC_FILE = /\.[a-zA-Z0-9]+$/;
const HERO_VARIANT_KEY = 'hero_variant';
const HERO_VARIANT_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const ACCESS_COOKIE = 'ca_access';

const PUBLIC_ACCOUNT_ROUTES = new Set([
  '/account/login',
  '/account/register',
  '/account/reset-password',
]);

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

function isHeroRoot(pathname: string): boolean {
  return pathname === '/' || locales.some((locale) => pathname === `/${locale}`);
}

function assignHeroVariant(request: NextRequest, response: NextResponse): NextResponse {
  const existing = request.cookies.get(HERO_VARIANT_KEY);
  if (existing?.value === 'A' || existing?.value === 'B') {
    return response;
  }

  const variant = Math.random() < 0.5 ? 'A' : 'B';
  response.cookies.set({
    name: HERO_VARIANT_KEY,
    value: variant,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: HERO_VARIANT_MAX_AGE,
  });
  return response;
}

function isPublicAccountRoute(localePath: string): boolean {
  return PUBLIC_ACCOUNT_ROUTES.has(localePath);
}

function isPrivateAccountRoute(pathname: string): boolean {
  return pathname.includes('/account/') && !PUBLIC_ACCOUNT_ROUTES.has(pathname);
}

function stripLocalePrefix(pathname: string): { locale: Locale; path: string } {
  for (const locale of locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return { locale, path: pathname.replace(`/${locale}`, '') || '/' };
    }
  }
  return { locale: defaultLocale, path: pathname };
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
    const { locale, path } = stripLocalePrefix(pathname);
    const hasAccessToken = !!request.cookies.get(ACCESS_COOKIE);

    if (isPrivateAccountRoute(pathname)) {
      if (!hasAccessToken) {
        const loginUrl = new URL(`/${locale}/account/login`, request.url);
        return NextResponse.redirect(loginUrl);
      }
      return response;
    }

    if (isPublicAccountRoute(path)) {
      if (hasAccessToken) {
        const dashboardUrl = new URL(`/${locale}/account/dashboard`, request.url);
        return NextResponse.redirect(dashboardUrl);
      }
      return response;
    }

    if (isHeroRoot(pathname)) {
      return assignHeroVariant(request, response);
    }
    return response;
  }

  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  const redirect = NextResponse.redirect(request.nextUrl);
  redirect.headers.set('Content-Security-Policy', buildCSP());
  return isHeroRoot(request.nextUrl.pathname) ? assignHeroVariant(request, redirect) : redirect;
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|robots.txt|sitemap.xml|api).*)'],
};
