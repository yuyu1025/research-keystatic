'use client';

import { useId, useRef, useState } from 'react';
import { ActionButton, ButtonGroup } from '@keystar/ui/button';
import { FieldDescription, FieldLabel, FieldMessage } from '@keystar/ui/field';
import { Box, Flex } from '@keystar/ui/layout';
import { ProgressCircle } from '@keystar/ui/progress';
import { Text } from '@keystar/ui/typography';
import { uploadAsset } from '../lib/assets-client';
import { filenameFromUrl } from '../lib/media-url';

/**
 * Admin 里的选文件控件。跟默认 image/file 同一套操作：
 * Choose file → POST /api/assets → onChange(公开 URL)。
 */
export function R2FieldInput({
  label,
  description,
  value,
  onChange,
  forceValidation,
  kind,
  required,
}: {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  autoFocus: boolean;
  forceValidation: boolean;
  kind: 'image' | 'file';
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();
  const descriptionId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showRequired = forceValidation && required && !value.trim();

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await uploadAsset(file);
      onChange(uploaded.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <Flex
      aria-labelledby={labelId}
      aria-describedby={description ? descriptionId : undefined}
      direction="column"
      gap="medium"
      role="group"
    >
      <FieldLabel id={labelId} elementType="span" isRequired={required}>
        {label}
      </FieldLabel>
      {description ? (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      ) : null}

      <ButtonGroup>
        <ActionButton
          isDisabled={uploading}
          onPress={() => inputRef.current?.click()}
        >
          {value ? 'Replace file' : 'Choose file'}
        </ActionButton>
        {value ? (
          <ActionButton
            prominence="low"
            isDisabled={uploading}
            onPress={() => {
              setError(null);
              onChange('');
            }}
          >
            Remove
          </ActionButton>
        ) : null}
        {uploading ? <ProgressCircle size="small" isIndeterminate /> : null}
      </ButtonGroup>

      <input
        ref={inputRef}
        type="file"
        accept={kind === 'image' ? 'image/*' : undefined}
        hidden
        onChange={event => void onFile(event.target.files?.[0])}
      />

      {kind === 'image' && value ? (
        <Box
          alignSelf="start"
          backgroundColor="canvas"
          borderRadius="regular"
          border="neutral"
          padding="regular"
        >
          <img
            src={value}
            alt=""
            style={{ display: 'block', maxHeight: 160, maxWidth: '100%' }}
          />
        </Box>
      ) : null}

      {kind === 'file' && value ? (
        <Text>
          <a href={value} target="_blank" rel="noreferrer">
            {filenameFromUrl(value)}
          </a>
        </Text>
      ) : null}

      {error ? <FieldMessage>{error}</FieldMessage> : null}
      {showRequired ? <FieldMessage>{label} is required</FieldMessage> : null}
    </Flex>
  );
}
