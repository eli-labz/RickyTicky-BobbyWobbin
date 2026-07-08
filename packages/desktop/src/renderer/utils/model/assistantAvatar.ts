/**
 * @license
 * Copyright 2025 RickyTicky BobbyWobbin (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { resolveBackendAssetUrl } from '@/renderer/utils/platform';
const LEGACY_BRAND_IMAGE_MARKERS = [
  '/api/assistants/aionui-assistant/avatar',
  '/api/assistants/builtin-aionui-assistant/avatar',
  '/api/assets/logos/brand/aion.svg',
] as const;
const BRAND_ASSISTANT_AVATAR = '/rickyticky-bobbywobbin-logo.jpg';

export type AssistantAvatar =
  | { kind: 'image'; value: string }
  | { kind: 'emoji'; value: string }
  | { kind: 'fallback' };

export function isBackendRelativeAssetPath(value: string): boolean {
  return value.startsWith('/api/') || value.startsWith('/assets/');
}

export function isLikelyLocalFilePath(value: string): boolean {
  if (value.startsWith('file://')) return true;
  if (/^[A-Za-z]:[\\/]/.test(value)) return true;
  if (/^\/[A-Za-z]:[\\/]/.test(value)) return true;

  const unixLocalPathPrefixes = ['/Users/', '/home/', '/var/', '/tmp/', '/private/', '/Volumes/', '/mnt/'];
  return unixLocalPathPrefixes.some((prefix) => value.startsWith(prefix));
}

export function mapLegacyBrandImageUrl(value: string): string {
  return LEGACY_BRAND_IMAGE_MARKERS.some((marker) => value.includes(marker)) ? BRAND_ASSISTANT_AVATAR : value;
}

export function resolveAssistantAvatar(avatar: string | undefined): AssistantAvatar {
  const rawValue = avatar?.trim();
  const value = rawValue ? mapLegacyBrandImageUrl(rawValue) : rawValue;
  if (!value) return { kind: 'fallback' };

  if (value === BRAND_ASSISTANT_AVATAR) {
    return { kind: 'image', value: BRAND_ASSISTANT_AVATAR };
  }

  if (isLikelyLocalFilePath(value)) {
    return { kind: 'fallback' };
  }
  if (value.startsWith('/') && !isBackendRelativeAssetPath(value)) {
    return { kind: 'fallback' };
  }

  const resolved = resolveBackendAssetUrl(value) ?? value;
  const isImage = /\.(svg|png|jpe?g|webp|gif)$/i.test(resolved) || /^(https?:|data:|\/)/i.test(resolved);
  if (isImage) {
    return { kind: 'image', value: resolved };
  }

  return { kind: 'emoji', value };
}
