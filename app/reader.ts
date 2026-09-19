import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../keystatic.config';

/**
 * Reader 只在服务端跑。浏览器里没有 Node fs，硬调会炸——这是特性，不是缺陷。
 * 页面、generateMetadata、Route Handler 都可以用；Client Component 不行。
 */
export const reader = createReader(process.cwd(), keystaticConfig);
