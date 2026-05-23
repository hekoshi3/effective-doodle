import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: '100mb', // !!!
  },
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
        destination: `http://127.0.0.1:5001/api/:path*`
      },
      {
        source: '/media/:path*',
        destination: `http://127.0.0.1:5001/media/:path*`
      }
    ]
  }
};

export default nextConfig;
