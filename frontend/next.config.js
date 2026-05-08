/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Vercel deployment
  output: "standalone",
  
  // Explicitly allow specific image domains if needed
  images: {
    remotePatterns: [],
  },

  // Environment variables exposed to browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },
};

module.exports = nextConfig;
