interface CloudflareEnv {
  MEDIA: {
    put(
      key: string,
      value: ArrayBuffer | ArrayBufferView,
      options?: { httpMetadata?: { contentType?: string } }
    ): Promise<unknown>;
    delete(key: string): Promise<void>;
    list(options?: {
      prefix?: string;
      limit?: number;
      cursor?: string;
    }): Promise<{
      objects: { key: string; size: number; uploaded: Date }[];
      truncated: boolean;
      cursor?: string;
    }>;
  };
  R2_PUBLIC_BASE_URL?: string;
}
