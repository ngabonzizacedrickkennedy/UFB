import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:8081/api/auth/:path*",
      },
      {
        source: "/api/admin/:path*",
        destination: "http://localhost:8081/api/admin/:path*",
      },
    ];
  },
};

export default nextConfig;
