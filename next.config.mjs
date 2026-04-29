/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      'framer-motion', 
      '@clerk/nextjs',
      'clsx',
      'tailwind-merge',
      'sonner'
    ],
  },
}

export default nextConfig
