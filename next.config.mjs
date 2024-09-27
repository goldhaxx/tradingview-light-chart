/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    instrumentationHook: true,
  },
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ignored: /inspiration/
    }
    return config
  },
  // Add this to exclude the inspiration folder from being processed
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'].filter(extension => !extension.includes('inspiration')),
};

export default nextConfig;
