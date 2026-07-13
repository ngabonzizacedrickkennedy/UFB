import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:8081/api/auth/:path*",
      },
      {
        source: "/api/profile/:path*",
        destination: "http://localhost:8081/api/profile/:path*",
      },
      {
        source: "/api/notifications/:path*",
        destination: "http://localhost:8083/api/notifications/:path*",
      },
      {
        source: "/api/notifications",
        destination: "http://localhost:8083/api/notifications",
      },
      {
        source: "/api/home/:path*",
        destination: "http://localhost:8084/api/home/:path*",
      },
      {
        source: "/api/home",
        destination: "http://localhost:8084/api/home",
      },
      {
        source: "/api/admin/consultation/:path*",
        destination: "http://localhost:8082/api/admin/consultation/:path*",
      },
      {
        source: "/api/consultation/:path*",
        destination: "http://localhost:8082/api/consultation/:path*",
      },
      {
        source: "/api/admin/:path*",
        destination: "http://localhost:8081/api/admin/:path*",
      },
    ];
  },
};

export default nextConfig;
