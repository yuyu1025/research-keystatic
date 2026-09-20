'use client';

import { useCallback, useEffect, useState } from 'react';
import { isImageKey } from '../lib/asset-file';
import {
  deleteAsset,
  listAssets,
  uploadAsset,
  type AssetObject,
} from '../lib/assets-client';

export function AssetLibrary() {
  const [objects, setObjects] = useState<AssetObject[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(async (next?: string | null, append = false) => {
    setError(null);
    setLoading(true);
    try {
      const listed = await listAssets(next ?? null);
      setObjects(current => (append ? [...current, ...listed.objects] : listed.objects));
      setCursor(listed.cursor);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!flash) return;
    const id = window.setTimeout(() => setFlash(null), 1800);
    return () => window.clearTimeout(id);
  }, [flash]);

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        await uploadAsset(file);
      }
      setFlash(`已上传 ${files.length} 个文件`);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(object: AssetObject) {
    if (!window.confirm(`删除 ${object.key}？内容里的 URL 不会自动清。`)) return;
    setError(null);
    try {
      await deleteAsset(object.key);
      setObjects(current => current.filter(item => item.key !== object.key));
      setFlash('已从 R2 删掉');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }

  async function onCopy(url: string) {
    await navigator.clipboard.writeText(url);
    setFlash('URL 已复制');
  }

  return (
    <div className="assets-page">
      <header className="assets-toolbar">
        <div className="studio-brand">
          <strong>资源库</strong>
          <span>文件在 R2，Git 只存 URL</span>
        </div>
        <div className="studio-actions">
          <label className="assets-upload">
            <input
              type="file"
              multiple
              disabled={uploading}
              onChange={event => {
                void onUpload(event.target.files);
                event.target.value = '';
              }}
            />
            {uploading ? '上传中…' : '上传'}
          </label>
          <a href="/keystatic/preview?edit=1">工作室</a>
          <a href="/keystatic">后台</a>
        </div>
      </header>

      {flash ? <div className="studio-flash">{flash}</div> : null}
      {error ? <div className="studio-error">{error}</div> : null}

      <main
        className="assets-body"
        onDragOver={event => event.preventDefault()}
        onDrop={event => {
          event.preventDefault();
          void onUpload(event.dataTransfer.files);
        }}
      >
        <p className="assets-help">
          首页和文章里直接选文件就会传到这里。这个页用来浏览、删除多余的对象。
        </p>

        {objects.length === 0 && !loading ? (
          <p className="empty">库是空的。上面点上传，或把文件拖进来。</p>
        ) : (
          <ul className="assets-grid">
            {objects.map(object => (
              <li key={object.key} className="assets-card">
                {isImageKey(object.key) ? (
                  <img src={object.url} alt="" />
                ) : (
                  <div className="assets-file">{extensionLabel(object.key)}</div>
                )}
                <code title={object.key}>{object.key.replace(/^media\//, '')}</code>
                <span>{formatSize(object.size)}</span>
                <div>
                  <button type="button" onClick={() => void onCopy(object.url)}>
                    复制 URL
                  </button>
                  <a href={object.url} target="_blank" rel="noreferrer">
                    打开
                  </a>
                  <button type="button" onClick={() => void onDelete(object)}>
                    删除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {cursor ? (
          <button
            type="button"
            className="assets-more"
            disabled={loading}
            onClick={() => void load(cursor, true)}
          >
            {loading ? '加载中…' : '更多'}
          </button>
        ) : null}
      </main>
    </div>
  );
}

function extensionLabel(key: string): string {
  const name = key.split('/').pop() ?? key;
  const dot = name.lastIndexOf('.');
  return (dot >= 0 ? name.slice(dot + 1) : name).toUpperCase();
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
