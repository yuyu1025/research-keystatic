import type { ReactNode } from 'react';
import { siteUrl } from '../lib/site-env';
import './styles.css';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Keystatic 教学主题',
  description: '组件化首页 + 双栏预览工作室',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
