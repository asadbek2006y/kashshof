import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intl = createMiddleware(routing);

/**
 * Next.js 16 proxy: /api/v1/* is rewritten to the API (same-origin, no CORS — the API URL is
 * read per request so it isn't frozen at build time); everything else gets locale routing.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/v1')) {
    const target = new URL(process.env.API_INTERNAL_URL ?? 'http://localhost:4100');
    target.pathname = request.nextUrl.pathname;
    target.search = request.nextUrl.search;
    return NextResponse.rewrite(target);
  }
  return intl(request);
}

export const config = {
  matcher: ['/api/v1/:path*', '/((?!_next|_vercel|.*\\..*).*)'],
};
