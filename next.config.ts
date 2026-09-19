import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const isPages = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';

const nextConfig: NextConfig = {
  output: isPages ? 'export' : undefined,
  // Worker 只接管 /console 和 /keystatic。JS 不能走 Pages 的 /_next。
  assetPrefix: isPages ? undefined : '/console',
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
              destination: '/keystatic',
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
