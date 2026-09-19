export const repoOwner = 'yuyu1025';
export const repoName = 'research-keystatic';
export const siteHost = 'research.distinctive.fun';
export const siteUrl = `https://${siteHost}`;

/** 线上 Worker / `next start` 是 production；`next dev` 才开本地工作室。 */
export const isDevStudio = process.env.NODE_ENV !== 'production';
