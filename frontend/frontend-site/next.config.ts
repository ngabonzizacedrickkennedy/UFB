import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:8080/api/auth/:path*",
      },
      {
        source: "/api/admin/:path*",
        destination: "http://localhost:8080/api/admin/:path*",
      },
    ];
  },
};

export default nextConfig;
