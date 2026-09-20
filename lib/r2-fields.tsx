import { R2FieldInput } from '../components/R2FieldInput';

type R2FieldOptions = {
  label: string;
  description?: string;
  validation?: { isRequired?: boolean };
};

/** 选文件，传到 R2，YAML/Markdoc 只写 URL。 */
export function r2Image(options: R2FieldOptions) {
  return r2AssetField('image', options);
}

export function r2File(options: R2FieldOptions) {
  return r2AssetField('file', options);
}

function r2AssetField(kind: 'image' | 'file', options: R2FieldOptions) {
  const required = options.validation?.isRequired === true;
  return {
    kind: 'form' as const,
    label: options.label,
    Input(props: {
      value: string;
      onChange: (value: string) => void;
      autoFocus: boolean;
      forceValidation: boolean;
    }) {
      return (
        <R2FieldInput
          {...props}
          label={options.label}
          description={options.description}
          kind={kind}
          required={required}
        />
      );
    },
    defaultValue() {
      return '';
    },
    parse(value: unknown) {
      return parseUrl(options.label, value);
    },
    serialize(value: string) {
      const trimmed = value.trim();
      return { value: trimmed ? trimmed : undefined };
    },
    validate(value: string) {
      const trimmed = value.trim();
      if (!trimmed) {
        if (required) throw new Error(`${options.label} 必填`);
        return '';
      }
      assertHttpUrl(options.label, trimmed);
      return trimmed;
    },
    reader: {
      parse(value: unknown) {
        return parseUrl(options.label, value);
      },
    },
  };
}

function parseUrl(label: string, value: unknown): string {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string') {
    throw new Error(`${label} 必须是 URL 字符串，拿到了 ${typeof value}`);
  }
  return value;
}

function assertHttpUrl(label: string, value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} 不是合法 URL: ${value}`);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${label} 必须是 http(s) URL: ${value}`);
  }
}
