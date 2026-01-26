/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Public key authentication is deprecated as of January 2025
    // We now use Connect session authentication (secure by default)
    NANGO_SECRET_KEY: process.env.NANGO_SECRET_KEY,
  },
}

module.exports = nextConfig

