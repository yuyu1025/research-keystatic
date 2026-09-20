/** 内容里存的是 URL，不是文件。空值表示没图；非法协议直接炸。 */
export function mediaUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(`非法资源 URL: ${trimmed}`);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`资源 URL 必须是 http(s): ${trimmed}`);
  }
  return trimmed;
}

export function filenameFromUrl(url: string): string {
  try {
    return decodeURIComponent(new URL(url).pathname.split('/').pop() || url);
  } catch {
    return url;
  }
}
