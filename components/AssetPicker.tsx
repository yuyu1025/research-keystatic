'use client';

import { useRef, useState } from 'react';
import { uploadAsset } from '../lib/assets-client';

/** 工作室左侧：选文件立刻上 R2，草稿只记下 URL。 */
export function AssetPicker({
  label,
  value,
  onChange,
  accept = 'image/*',
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await uploadAsset(file);
      onChange(uploaded.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="editor-field">
      <span>{label}</span>
      {value ? (
        <img className="asset-thumb" src={value} alt="" />
      ) : (
        <p className="asset-empty">还没有文件</p>
      )}
      <div className="asset-picker-actions">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? '上传中…' : value ? '更换' : '选择文件'}
        </button>
        {value ? (
          <button type="button" disabled={uploading} onClick={() => onChange('')}>
            移除
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={event => void onFile(event.target.files?.[0])}
      />
      {error ? <p className="asset-error">{error}</p> : null}
    </div>
  );
}
