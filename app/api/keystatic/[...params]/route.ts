import { makeRouteHandler } from '@keystatic/next/route-handler';
import keystaticConfig from '../../../../keystatic.config';

export const dynamic = 'force-dynamic';

const { GET: keystaticGet, POST: keystaticPost } = makeRouteHandler({
  config: keystaticConfig,
});

/**
 * Cloudflare / 反代后面 Keystatic 会用内部 host 拼 redirect_uri。
 * 用对外域名重写请求 URL。token 交换也必须带上同一个 redirect_uri。
 */
function publicRequest(request: Request) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost ?? request.headers.get('host');
  if (!host) return request;
  const protoHeader = request.headers.get('x-forwarded-proto');
  const url = new URL(request.url);
  url.protocol = protoHeader?.includes('http')
    ? `${protoHeader.split(',')[0].trim()}:`
    : 'https:';
  url.hostname = host.split(':')[0];
  url.port = '';
  return new Request(url, request);
}

function githubTokenFetch(origin: string, originalFetch: typeof fetch): typeof fetch {
  const redirectUri = `${origin}/api/keystatic/github/oauth/callback`;
  return (input, init) => {
    const raw =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    if (raw.startsWith('https://github.com/login/oauth/access_token')) {
      const tokenUrl = new URL(raw);
      if (!tokenUrl.searchParams.has('redirect_uri')) {
        tokenUrl.searchParams.set('redirect_uri', redirectUri);
      }
      return originalFetch(tokenUrl, init);
    }
    return originalFetch(input, init);
  };
}

async function withGithubRedirectUri(
  request: Request,
  run: (req: Request) => Promise<Response>
) {
  const req = publicRequest(request);
  const origin = new URL(req.url).origin;
  const previous = globalThis.fetch;
  globalThis.fetch = githubTokenFetch(origin, previous);
  try {
    return await run(req);
  } finally {
    globalThis.fetch = previous;
  }
}

export function GET(request: Request) {
  return withGithubRedirectUri(request, req => keystaticGet(req));
}

export function POST(request: Request) {
  return withGithubRedirectUri(request, req => keystaticPost(req));
}
