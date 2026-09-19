import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Homepage } from '../../../lib/content-types';
import {
  commitHomepageToGitHub,
  githubTokenFromCookie,
  homepageYaml,
} from '../../../lib/homepage-store';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  let yaml: string;
  try {
    yaml = homepageYaml((await request.json()) as Homepage);
  } catch (caught) {
    return new Response(caught instanceof Error ? caught.message : String(caught), {
      status: 400,
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    await writeFile(path.join(process.cwd(), 'content/homepage.yaml'), yaml, 'utf8');
    return Response.json({ ok: true, via: 'file' });
  }

  const token = githubTokenFromCookie(request.headers.get('cookie'));
  if (!token) {
    return Response.json(
      { error: 'unauthorized', login: '/api/keystatic/github/login' },
      { status: 401 }
    );
  }

  try {
    await commitHomepageToGitHub(yaml, token);
  } catch (caught) {
    return new Response(caught instanceof Error ? caught.message : String(caught), {
      status: 502,
    });
  }

  return Response.json({ ok: true, via: 'github' });
}
