/**
 * @license
 * Copyright 2025 RickyTicky BobbyWobbin (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { assistantRuntimeKey, type Assistant } from '@/common/types/agent/assistantTypes';

type AssistantNameSource = Pick<Assistant, 'id' | 'name' | 'name_i18n' | 'agent'>;

export const BUILTIN_AIONRS_DISPLAY_NAME = 'Rickyticky Bobbywobbin';
const LEGACY_AION_CLI_PATTERN = /\baion\s+cli\b/gi;
const LEGACY_PRODUCT_NAME_PATTERN = /\baion(?:ui)?\b/gi;

export function normalizeLegacyProductCopy(value: string | null | undefined): string {
  const trimmed = value?.trim() || '';
  if (!trimmed) return '';

  return trimmed
    .replace(LEGACY_AION_CLI_PATTERN, BUILTIN_AIONRS_DISPLAY_NAME)
    .replace(LEGACY_PRODUCT_NAME_PATTERN, BUILTIN_AIONRS_DISPLAY_NAME);
}

export function normalizeLegacyAssistantBranding(value: string | null | undefined): string {
  return normalizeLegacyProductCopy(value);
}

export function resolveAssistantName(
  assistant: AssistantNameSource | null | undefined,
  localeKey: string,
  fallback = 'Assistant'
): string {
  if (!assistant) {
    return normalizeLegacyAssistantBranding(fallback) || fallback;
  }

  const localizedName = assistant.name_i18n?.[localeKey] || assistant.name_i18n?.['en-US'];
  const resolvedName =
    normalizeLegacyAssistantBranding(localizedName) ||
    normalizeLegacyAssistantBranding(assistant.name) ||
    (assistantRuntimeKey(assistant) === 'aionrs' ? BUILTIN_AIONRS_DISPLAY_NAME : '') ||
    assistant.id ||
    fallback;

  return normalizeLegacyAssistantBranding(resolvedName) || fallback;
}
