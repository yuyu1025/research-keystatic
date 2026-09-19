export const repoOwner = 'yuyu1025';
export const repoName = 'research-keystatic';
export const siteHost = 'research.distinctive.fun';
export const siteUrl = `https://${siteHost}`;

/** GitHub Pages 静态导出时由 build:pages 注入。本地 dev / SSR 不要设。 */
export const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';
