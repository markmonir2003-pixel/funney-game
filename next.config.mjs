import million from 'million/compiler';

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ── Image optimisation ────────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // ── Aggressive static-asset caching ──────────────────────────────────────
  async headers() {
    return [
      {
        // JS / CSS chunks produced by Next.js — these have content-hashed names,
        // so we can safely cache them forever (1 year).
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Public assets (images, fonts, manifest, icons …)
        source: '/:path((?!_next).*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|avif|woff2?|ttf|otf|json|mp3|wav)$)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },

  // ── Tree-shake heavy packages ─────────────────────────────────────────────
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@clerk/nextjs',
      'clsx',
      'tailwind-merge',
      'sonner',
    ],
  },
};

const millionConfig = {
  auto: true,
};

export default million.next(nextConfig, millionConfig);
