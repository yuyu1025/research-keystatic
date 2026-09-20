export type AssetObject = {
  key: string;
  url: string;
  size: number;
  lastModified: string;
};

export type AssetList = {
  objects: AssetObject[];
  cursor: string | null;
};

async function readError(response: Response): Promise<string> {
  const body = await response.text();
  return body || `请求失败 (${response.status})`;
}

export async function listAssets(cursor?: string | null): Promise<AssetList> {
  const url = cursor
    ? `/api/assets?cursor=${encodeURIComponent(cursor)}`
    : '/api/assets';
  const response = await fetch(url);
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as AssetList;
}

export async function uploadAsset(file: File): Promise<AssetObject> {
  const form = new FormData();
  form.set('file', file);
  const response = await fetch('/api/assets', { method: 'POST', body: form });
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as AssetObject;
}

export async function deleteAsset(key: string): Promise<void> {
  const response = await fetch(`/api/assets?key=${encodeURIComponent(key)}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(await readError(response));
}
