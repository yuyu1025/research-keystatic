import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const isPages = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';

const nextConfig: NextConfig = {
  output: isPages ? 'export' : undefined,
  // Pages 占着 /_next，Worker 的 JS 挂在 /keystatic/_next。
  assetPrefix: isPages ? undefined : '/keystatic',
  images: { unoptimized: true },
  trailingSlash: isPages,
  outputFileTracingIncludes: isPages
    ? undefined
    : {
        '/*': ['./content/**/*'],
      },
  ...(isPages
    ? {}
    : {
        async redirects() {
          return [
            {
              source: '/console',
              destination: '/keystatic/preview',
              permanent: false,
            },
            {
              source: '/studio',
              destination: '/keystatic/preview',
              permanent: false,
            },
          ];
        },
      }),
};

export default nextConfig;

if (!isPages) {
  initOpenNextCloudflareForDev();
}
