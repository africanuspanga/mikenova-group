/** @type {import('next').NextConfig} */
const nextConfig = {
  // The site uses /api/chat for the chatbot which requires server-side functionality
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
