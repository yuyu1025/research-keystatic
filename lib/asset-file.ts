const MAX_BYTES = 15 * 1024 * 1024;

const EXT_TO_MIME: Record<string, string> = {
  avif: 'image/avif',
  csv: 'text/csv',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  json: 'application/json',
  md: 'text/markdown',
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  pdf: 'application/pdf',
  png: 'image/png',
  svg: 'image/svg+xml',
  txt: 'text/plain',
  wav: 'audio/wav',
  webm: 'video/webm',
  webp: 'image/webp',
  zip: 'application/zip',
};

const MIME_ALIASES: Record<string, string> = {
  'audio/wav': 'audio/wav',
  'audio/x-wav': 'audio/wav',
  'image/jpg': 'image/jpeg',
};

export function isImageKey(key: string): boolean {
  return /\/[^/]+\.(avif|gif|jpe?g|png|svg|webp)$/i.test(key);
}

export function buildObjectKey(filename: string, now = new Date()): string {
  const safe = sanitizeFilename(filename);
  const ext = extensionOf(safe);
  if (!EXT_TO_MIME[ext]) {
    throw new Error(`不支持的文件类型: .${ext || '(无扩展名)'}`);
  }
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `media/${year}/${month}/${id}-${safe}`;
}

export function resolveUpload(file: File): {
  filename: string;
  contentType: string;
  size: number;
} {
  if (!(file instanceof File) || file.size <= 0) {
    throw new Error('没有收到文件');
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`文件超过 ${MAX_BYTES / 1024 / 1024}MB 上限`);
  }
  const filename = sanitizeFilename(file.name);
  const ext = extensionOf(filename);
  const expected = EXT_TO_MIME[ext];
  if (!expected) {
    throw new Error(`不支持的文件类型: .${ext || '(无扩展名)'}`);
  }
  const reported = normalizeMime(file.type);
  if (reported && reported !== 'application/octet-stream' && reported !== expected) {
    throw new Error(`文件类型和扩展名对不上: ${reported} vs .${ext}`);
  }
  return { filename, contentType: expected, size: file.size };
}

function sanitizeFilename(name: string): string {
  const base = name.normalize('NFKC').replace(/\\/g, '/').split('/').pop() ?? '';
  const cleaned = base
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .slice(0, 80)
    .toLowerCase();
  if (!cleaned || cleaned === '.' || cleaned === '..') {
    throw new Error(`非法文件名: ${name}`);
  }
  return cleaned;
}

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.');
  if (dot <= 0 || dot === filename.length - 1) return '';
  return filename.slice(dot + 1);
}

function normalizeMime(type: string): string {
  const raw = type.trim().toLowerCase();
  if (!raw) return '';
  return MIME_ALIASES[raw] ?? raw;
}
