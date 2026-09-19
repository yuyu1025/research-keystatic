import { makeRouteHandler } from '@keystatic/next/route-handler';
import keystaticConfig from '../../../../keystatic.config';

// Admin UI 的读写都走这条 catch-all。别在这里塞业务逻辑。

export const { POST, GET } = makeRouteHandler({
  config: keystaticConfig,
});
