import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  outputFileTracingIncludes: {
    '/*': ['./content/**/*'],
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
