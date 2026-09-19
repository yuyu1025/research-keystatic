'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Homepage, PostSummary } from '../lib/content-types';
import { HomepageEditor } from './HomepageEditor';
import { HomeView } from './HomeView';

type MobilePane = 'edit' | 'preview';

/**
 * 草稿在内存，预览吃同一份 state。Save 才写 content/homepage.yaml。
 *
 * 不能把 Keystatic Admin iframe 当左栏：它的表单在自己的 React 树里，
 * Save 之前不写盘，右栏读文件永远慢一拍。要即时预览，就得共享 state。
 */
export function Studio({
  initial,
  posts,
}: {
  initial: Homepage;
  posts: PostSummary[];
}) {
  const [draft, setDraft] = useState<Homepage>(initial);
  const [saved, setSaved] = useState<Homepage>(initial);
  const [mobilePane, setMobilePane] = useState<MobilePane>('edit');
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved]
  );

  const save = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/homepage', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || `保存失败 (${response.status})`);
      }
      setSaved(draft);
      setFlash('已写入 content/homepage.yaml');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setSaving(false);
    }
  }, [draft, saving]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (dirty) void save();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dirty, save]);

  useEffect(() => {
    if (!dirty) return;
    function onUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [dirty]);

  useEffect(() => {
    if (!flash) return;
    const id = window.setTimeout(() => setFlash(null), 1800);
    return () => window.clearTimeout(id);
  }, [flash]);

  return (
    <div className="studio">
      <header className="studio-toolbar">
        <div className="studio-brand">
          <strong>教学工作室</strong>
          <span>{dirty ? '草稿 · 未写入文件' : '与文件一致'}</span>
        </div>

        <div className="studio-mobile-tabs" role="tablist" aria-label="栏">
          <button
            type="button"
            className={mobilePane === 'edit' ? 'is-active' : undefined}
            onClick={() => setMobilePane('edit')}
          >
            编辑
          </button>
          <button
            type="button"
            className={mobilePane === 'preview' ? 'is-active' : undefined}
            onClick={() => setMobilePane('preview')}
          >
            预览
          </button>
        </div>

        <div className="studio-actions">
          <button
            type="button"
            className={dirty ? 'is-active' : undefined}
            disabled={!dirty || saving}
            onClick={() => void save()}
          >
            {saving ? '写入中…' : '保存到文件'}
          </button>
          <a href="/preview" target="_blank" rel="noreferrer">
            已保存预览
          </a>
          <a href="/keystatic/singleton/homepage" target="_blank" rel="noreferrer">
            Admin
          </a>
        </div>
      </header>

      {flash ? <div className="studio-flash">{flash}</div> : null}
      {error ? <div className="studio-error">{error}</div> : null}

      <div className="studio-panes">
        <section
          className={`studio-pane${mobilePane === 'edit' ? ' is-active' : ''}`}
        >
          <p className="studio-pane-label">编辑草稿</p>
          <HomepageEditor value={draft} onChange={setDraft} />
        </section>
        <section
          className={`studio-pane studio-preview${
            mobilePane === 'preview' ? ' is-active' : ''
          }`}
        >
          <p className="studio-pane-label">
            {dirty ? '实时预览 · 未保存' : '实时预览'}
          </p>
          <div className="studio-preview-body">
            <HomeView homepage={draft} posts={posts} embed />
          </div>
        </section>
      </div>
    </div>
  );
}
