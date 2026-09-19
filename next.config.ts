import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const isPages = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';

const nextConfig: NextConfig = {
  output: isPages ? 'export' : undefined,
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
            {
              source: '/console/:path*',
              destination: '/keystatic/:path*',
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
