import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    unoptimized: true,
  },
};

export default nextConfig;