/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_DB_HOST: process.env.MYSQL_HOST,
    NEXT_PUBLIC_DB_NAME: process.env.MYSQL_DATABASE,
  },
  // Make sure the uploads route is properly configured
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ]
  },
}

module.exports = nextConfig
