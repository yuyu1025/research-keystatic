import { cookies } from 'next/headers';
import { AssetLibrary } from '../../components/AssetLibrary';

export const dynamic = 'force-dynamic';

export default async function AssetsPage() {
  if (process.env.NODE_ENV === 'production') {
    const token = (await cookies()).get('keystatic-gh-access-token')?.value;
    if (!token) {
      return (
        <div className="assets-page">
          <main className="assets-gate">
            <p>资源库跟后台同一把锁：先 GitHub 登录。</p>
            <a className="btn" href="/keystatic">
              去后台登录
            </a>
          </main>
        </div>
      );
    }
  }

  return <AssetLibrary />;
}
