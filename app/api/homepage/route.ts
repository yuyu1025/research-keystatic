import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { stringify } from 'yaml';
import type { Homepage } from '../../../lib/content-types';

export const dynamic = 'force-dynamic';

/**
 * 把内存草稿写成 Keystatic 能读的 YAML。
 * 这是工作室唯一写盘的入口。预览不走这里。
 */
export async function PUT(request: Request) {
  const body = (await request.json()) as Homepage;
  if (!body || typeof body.siteName !== 'string' || !Array.isArray(body.sections)) {
    return new Response('首页 payload 不完整：需要 siteName 和 sections', {
      status: 400,
    });
  }

  for (const section of body.sections) {
    if (!section || typeof section.discriminant !== 'string' || section.value == null) {
      return new Response('sections 里有条目缺 discriminant 或 value', {
        status: 400,
      });
    }
  }

  const yaml = stringify(
    { siteName: body.siteName, sections: body.sections },
    { lineWidth: 92 }
  );
  await writeFile(
    path.join(process.cwd(), 'content/homepage.yaml'),
    yaml.endsWith('\n') ? yaml : `${yaml}\n`,
    'utf8'
  );

  return Response.json({ ok: true });
}
