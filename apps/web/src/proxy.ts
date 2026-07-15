import { type NextRequest, NextResponse } from 'next/server';

/** The canonical host everything else redirects to. */
const CANONICAL_HOST = 'belovedpacifist.com';

/**
 * Hosts permanently redirected to the canonical domain, preserving path + query.
 */
const REDIRECT_HOSTS = new Set([
  'scythestats.com',
  'www.scythestats.com',
  'www.belovedpacifist.com',
]);

export function proxy(req: NextRequest) {
  const host = (req.headers.get('host') ?? '').split(':')[0]?.toLowerCase() ?? '';
  if (!REDIRECT_HOSTS.has(host)) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.protocol = 'https:';
  url.hostname = CANONICAL_HOST;
  url.port = '';
  return NextResponse.redirect(url, 301);
}

export const config = {
  // Run on everything except Next internals + common static files.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
