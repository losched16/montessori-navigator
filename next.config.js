/** @type {import('next').NextConfig} */
const nextConfig = {
  // sanitize-html (via htmlparser2) is an ESM/Node package — keep it external
  // so webpack doesn't try to bundle it into the server routes.
  experimental: {
    serverComponentsExternalPackages: ['sanitize-html'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
}

module.exports = nextConfig
