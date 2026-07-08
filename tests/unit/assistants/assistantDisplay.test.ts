/**
 * @license
 * Copyright 2025 RickyTicky BobbyWobbin (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest';
import {
  normalizeLegacyAssistantBranding,
  normalizeLegacyProductCopy,
  resolveAssistantName,
} from '@/renderer/utils/model/assistantDisplay';

describe('assistantDisplay', () => {
  it('renames the legacy built-in Aion CLI label', () => {
    expect(normalizeLegacyAssistantBranding('Aion CLI')).toBe('Rickyticky Bobbywobbin');
  });

  it('renames legacy AionUi product labels in assistant names', () => {
    expect(normalizeLegacyAssistantBranding('AionUi Butler')).toBe('Rickyticky Bobbywobbin Butler');
  });

  it('renames plain Aion labels to the new product name', () => {
    expect(normalizeLegacyAssistantBranding('Aion Butler')).toBe('Rickyticky Bobbywobbin Butler');
  });

  it('normalizes sentence-level assistant copy that mentions Aion products', () => {
    expect(normalizeLegacyProductCopy('Open AionUi from my phone using Aion CLI')).toBe(
      'Open Rickyticky Bobbywobbin from my phone using Rickyticky Bobbywobbin'
    );
  });

  it('keeps custom assistant names unchanged', () => {
    expect(normalizeLegacyAssistantBranding('Claude Code')).toBe('Claude Code');
  });

  it('falls back to the new built-in display name for unnamed aionrs assistants', () => {
    expect(
      resolveAssistantName(
        {
          id: 'builtin-aionrs',
          name: '',
          name_i18n: {},
          agent: { type: 'aionrs', source: 'internal' },
        },
        'en-US'
      )
    ).toBe('Rickyticky Bobbywobbin');
  });

  it('falls back to the provided default when assistant data is missing', () => {
    expect(resolveAssistantName(null, 'en-US', 'Assistant')).toBe('Assistant');
  });
});
