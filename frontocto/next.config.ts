import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL(process.env.NEXT_PUBLIC_BACKEND_MEDIA+"media/**")],
    dangerouslyAllowLocalIP: true, // !!!
  },
};

export default nextConfig;
