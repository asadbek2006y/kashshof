import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Same-origin /api/v1/* proxying lives in src/proxy.ts (read per request, not baked in at build).
  // Dev only: let the page hydrate when opened by LAN IP (e.g. testing on a phone). Without this,
  // Next blocks its dev scripts and the page renders but never becomes interactive.
  // *.trycloudflare.com covers `cloudflared tunnel --url` demo links.
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '*.trycloudflare.com'],
  // Home-page photography (public/media) is served as AVIF/WebP at the size each screen needs.
  images: { formats: ['image/avif', 'image/webp'], qualities: [75] },
};

export default withNextIntl(nextConfig);
