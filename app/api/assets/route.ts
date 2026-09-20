import { AssetAuthError, requireEditor } from '../../../lib/asset-auth';
import { buildObjectKey, resolveUpload } from '../../../lib/asset-file';
import { deleteObject, listObjects, putObject } from '../../../lib/r2';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireEditor(request);
    const cursor = new URL(request.url).searchParams.get('cursor');
    return Response.json(await listObjects({ cursor }));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireEditor(request);
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return new Response('multipart 字段必须叫 file', { status: 400 });
    }
    const { contentType } = resolveUpload(file);
    const object = await putObject({
      key: buildObjectKey(file.name),
      body: await file.arrayBuffer(),
      contentType,
    });
    return Response.json(object, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireEditor(request);
    const key = new URL(request.url).searchParams.get('key');
    if (!key) return new Response('缺少 key', { status: 400 });
    await deleteObject(key);
    return Response.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}

function fail(error: unknown): Response {
  if (error instanceof AssetAuthError) {
    return new Response(error.message, { status: error.status });
  }
  const message = error instanceof Error ? error.message : String(error);
  const status = /未配置|非法|不支持|没有收到|超过/.test(message) ? 400 : 500;
  return new Response(message, { status });
}
