import { HomeView } from '../../components/HomeView';
import { loadHomepage, loadPostSummaries } from '../../lib/load-site';

export default async function PreviewPage() {
  const [homepage, posts] = await Promise.all([
    loadHomepage(),
    loadPostSummaries(),
  ]);
  return <HomeView homepage={homepage} posts={posts} />;
}
