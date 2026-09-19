import { HomeView } from '../components/HomeView';
import { loadHomepage, loadPostSummaries } from '../lib/load-site';

export const dynamic = 'force-static';

export default async function Homepage() {
  const [homepage, posts] = await Promise.all([
    loadHomepage(),
    loadPostSummaries(),
  ]);
  return <HomeView homepage={homepage} posts={posts} />;
}
