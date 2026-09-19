import { HomeView } from '../components/HomeView';
import { Studio } from '../components/Studio';
import { loadHomepage, loadPostSummaries } from '../lib/load-site';
import { isStaticExport } from '../lib/site-env';

export default async function HomepageStudio() {
  const [homepage, posts] = await Promise.all([
    loadHomepage(),
    loadPostSummaries(),
  ]);
  if (isStaticExport) {
    return <HomeView homepage={homepage} posts={posts} />;
  }
  return <Studio initial={homepage} posts={posts} />;
}
