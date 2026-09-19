import type { NextConfig } from 'next';

const isPages = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';

const nextConfig: NextConfig = {
  output: isPages ? 'export' : undefined,
  images: { unoptimized: true },
  trailingSlash: isPages,
};

export default nextConfig;
