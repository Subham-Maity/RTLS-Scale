import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Wildcard to allow all domains
      },
    ],
  },
};

export default nextConfig;
