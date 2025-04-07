/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_DB_HOST: "localhost",
    // NEXT_PUBLIC_DB_HOST: process.env.MYSQL_HOST,
    NEXT_PUBLIC_DB_NAME: "pine",
    // NEXT_PUBLIC_DB_NAME: process.env.MYSQL_DATABASE,
  },
  // This is important for serving uploaded files
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

