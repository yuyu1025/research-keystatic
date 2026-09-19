import { HomeView } from '../components/HomeView';
import { Studio } from '../components/Studio';
import { loadHomepage, loadPostSummaries } from '../lib/load-site';
import { isDevStudio } from '../lib/site-env';

export default async function HomepageStudio() {
  const [homepage, posts] = await Promise.all([
    loadHomepage(),
    loadPostSummaries(),
  ]);
  if (isDevStudio) {
    return <Studio initial={homepage} posts={posts} />;
  }
  return <HomeView homepage={homepage} posts={posts} />;
}
