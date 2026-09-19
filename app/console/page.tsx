import { cookies } from 'next/headers';
import { Studio } from '../../components/Studio';
import { loadHomepage, loadPostSummaries } from '../../lib/load-site';

export const dynamic = 'force-dynamic';

export default async function ConsolePage() {
  const token = (await cookies()).get('keystatic-gh-access-token')?.value;
  const [homepage, posts] = await Promise.all([
    loadHomepage(token),
    loadPostSummaries(token),
  ]);
  return <Studio initial={homepage} posts={posts} />;
}
