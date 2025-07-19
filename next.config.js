/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['resend']
  },
  images: {
    domains: ['gamhnzdqxwebyusqoiem.supabase.co'],
  },
}

module.exports = nextConfig