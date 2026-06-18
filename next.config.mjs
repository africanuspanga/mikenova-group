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

  // Ensure all page URLs use a trailing slash for consistency with canonical tags
  trailingSlash: true,

  // Redirect apex domain to www to prevent duplicate content issues
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "mikenovagroup.co.tz" }],
        destination: "https://www.mikenovagroup.co.tz/:path*",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
