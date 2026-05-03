import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverExternalPackages: ["@prisma/client", "pg"],
    turbo: {
      resolveAlias: {
        // Force these to resolve to a dummy/empty module on the client
        dns: "node-libs-browser/mock/empty",
        net: "node-libs-browser/mock/empty",
        tls: "node-libs-browser/mock/empty",
        fs: "node-libs-browser/mock/empty",
      },
    },
  },
};

export default nextConfig;
