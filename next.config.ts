import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "**.tokkobroker.com" },
      { protocol: "https", hostname: "**.tokko.io" },
    ],
  },
};

export default nextConfig;
