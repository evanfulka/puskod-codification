import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Naikkan ke 10MB atau sesuai kebutuhan
    },
  },
};

export default nextConfig;
