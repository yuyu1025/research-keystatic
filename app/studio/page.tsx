import { Studio } from '../../components/Studio';
import { loadHomepage, loadPostSummaries } from '../../lib/load-site';

export const dynamic = 'force-dynamic';

export default async function StudioPage() {
  const [homepage, posts] = await Promise.all([
    loadHomepage(),
    loadPostSummaries(),
  ]);
  return <Studio initial={homepage} posts={posts} />;
}
