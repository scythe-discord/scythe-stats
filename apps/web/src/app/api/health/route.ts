// Lightweight liveness check — intentionally touches nothing (no DB),
// so the health check doesn't keep the database's compute awake 24/7.
export const dynamic = 'force-dynamic';

export function GET() {
  return new Response('ok', {
    status: 200,
    headers: { 'cache-control': 'no-store' },
  });
}
