import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/better-sqlite3/**/*"],
  },
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
