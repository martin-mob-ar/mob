import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.tokkobroker.com" },
      { protocol: "https", hostname: "**.tokko.io" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
