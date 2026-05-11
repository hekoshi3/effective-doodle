import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5001',
        pathname: '/media/**',
      },
    ],
    dangerouslyAllowLocalIP: true, // !!!
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_API}/:path*`
      },
      {
        source: '/media/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_MEDIA}/:path*`
      }
    ]
  }
};

export default nextConfig;
