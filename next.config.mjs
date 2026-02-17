/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["framer-motion"]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imgproxy.filmmakers.eu"
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com"
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net"
      }
    ]
  }
};

export default nextConfig;
