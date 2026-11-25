import { revalidateTag } from 'next/cache';

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get('x-revalidate-secret') !== secret) {
    return new Response('forbidden', { status: 403 });
  }
  const { tags } = await req.json();
  // Next.js 16 requires the second argument: { expire: 0 } = merchant edits show immediately
  for (const tag of tags ?? []) {
    revalidateTag(tag, { expire: 0 });
  }
  return Response.json({ ok: true, revalidated: tags });
}
