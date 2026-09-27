import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Forms can carry a CV (5MB) plus an image (4MB) and a cover letter.
      bodySizeLimit: "16mb",
    },
    proxyClientMaxBodySize: "16mb",
  },
  poweredByHeader: false,
};

export default nextConfig;
