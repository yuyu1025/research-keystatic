'use client';

import { makePage } from '@keystatic/next/ui/app';
import config from '../../keystatic.config';

// Keystatic Admin 是 client 应用。文章和完整 CMS 仍走这里；首页即时预览不 iframe 它。

export default makePage(config);
