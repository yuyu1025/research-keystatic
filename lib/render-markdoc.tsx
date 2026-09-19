import Markdoc from '@markdoc/markdoc';
import type { Node } from '@markdoc/markdoc';
import React from 'react';
import { markdocConfig } from '../keystatic.config';
import { markdocComponents } from '../components/markdoc';

/**
 * 把 Keystatic 吐出的 Markdoc AST 变成 React 树。
 * 校验失败直接抛——吞掉错误等于拿空白页骗人。
 */
export function renderMarkdoc(node: Node) {
  const errors = Markdoc.validate(node, markdocConfig);
  if (errors.length) {
    throw new Error(
      `Markdoc 校验失败:\n${errors
        .map(error => `- ${error.error.message}`)
        .join('\n')}`
    );
  }

  const renderable = Markdoc.transform(node, markdocConfig);
  return Markdoc.renderers.react(renderable, React, {
    components: markdocComponents,
  });
}
