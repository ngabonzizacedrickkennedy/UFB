import type { NextConfig } from "next";

const AUTH = process.env.AUTH_SERVICE_URL || "https://auth-user-management-5jun.onrender.com";
const CONSULTATION = process.env.CONSULTATION_SERVICE_URL || "https://consultation-service-gnsu.onrender.com";
const NOTIFICATION = process.env.NOTIFICATION_SERVICE_URL || "https://notification-service-7t58.onrender.com";
const HOME = process.env.HOME_SERVICE_URL || "https://home-controller-8t7q.onrender.com";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${AUTH}/api/auth/:path*`,
      },
      {
        source: "/api/profile/:path*",
        destination: `${AUTH}/api/profile/:path*`,
      },
      {
        source: "/api/notifications",
        destination: `${NOTIFICATION}/api/notifications`,
      },
      {
        source: "/api/notifications/:path*",
        destination: `${NOTIFICATION}/api/notifications/:path*`,
      },
      {
        source: "/api/home",
        destination: `${HOME}/api/home`,
      },
      {
        source: "/api/home/:path*",
        destination: `${HOME}/api/home/:path*`,
      },
      {
        source: "/api/admin/consultation/:path*",
        destination: `${CONSULTATION}/api/admin/consultation/:path*`,
      },
      {
        source: "/api/consultation/:path*",
        destination: `${CONSULTATION}/api/consultation/:path*`,
      },
      {
        source: "/api/admin/:path*",
        destination: `${AUTH}/api/admin/:path*`,
      },
    ];
  },
};

export default nextConfig;
