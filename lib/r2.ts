import { getCloudflareContext } from '@opennextjs/cloudflare';

const MEDIA_PREFIX = 'media/';
const MAX_KEYS = 50;

export type R2Object = {
  key: string;
  url: string;
  size: number;
  lastModified: string;
};

export type ListedObjects = {
  objects: R2Object[];
  cursor: string | null;
};

function encodeKey(key: string): string {
  return key.split('/').map(encodeURIComponent).join('/');
}

function publicBaseUrl(): string {
  const raw = process.env.R2_PUBLIC_BASE_URL?.trim();
  if (!raw) {
    throw new Error(
      'R2_PUBLIC_BASE_URL 未配置。写在 wrangler.jsonc 的 vars 里，不是 secret。'
    );
  }
  const trimmed = raw.replace(/\/$/, '');
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function publicUrlFor(key: string): string {
  return `${publicBaseUrl()}/${encodeKey(key)}`;
}

export function assertMediaKey(key: string): string {
  if (!key.startsWith(MEDIA_PREFIX)) {
    throw new Error(`非法对象键，必须在 ${MEDIA_PREFIX} 下: ${key}`);
  }
  if (!/^media\/[A-Za-z0-9._/-]+$/.test(key) || key.includes('..')) {
    throw new Error(`非法对象键: ${key}`);
  }
  return key;
}

type MediaBucket = {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
  delete(key: string): Promise<void>;
  list(options?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{
    objects: { key: string; size: number; uploaded: Date }[];
    truncated: boolean;
    cursor?: string;
  }>;
};

async function mediaBucket(): Promise<MediaBucket> {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.MEDIA) {
    throw new Error(
      '缺少 R2 绑定 MEDIA。在 wrangler.jsonc 的 r2_buckets 里绑上桶。'
    );
  }
  return env.MEDIA;
}

export async function putObject(input: {
  key: string;
  body: ArrayBuffer | Uint8Array;
  contentType: string;
}): Promise<R2Object> {
  const key = assertMediaKey(input.key);
  const body = input.body instanceof Uint8Array ? input.body : new Uint8Array(input.body);
  const bucket = await mediaBucket();
  await bucket.put(key, body, {
    httpMetadata: { contentType: input.contentType },
  });
  return {
    key,
    url: publicUrlFor(key),
    size: body.byteLength,
    lastModified: new Date().toISOString(),
  };
}

export async function listObjects(input: {
  cursor?: string | null;
  limit?: number;
}): Promise<ListedObjects> {
  const bucket = await mediaBucket();
  const listed = await bucket.list({
    prefix: MEDIA_PREFIX,
    limit: Math.min(Math.max(input.limit ?? MAX_KEYS, 1), MAX_KEYS),
    cursor: input.cursor ?? undefined,
  });
  return {
    objects: listed.objects.map(object => ({
      key: object.key,
      url: publicUrlFor(object.key),
      size: object.size,
      lastModified: object.uploaded.toISOString(),
    })),
    cursor: listed.truncated ? listed.cursor ?? null : null,
  };
}

export async function deleteObject(key: string): Promise<void> {
  const bucket = await mediaBucket();
  await bucket.delete(assertMediaKey(key));
}
