/**
 * @license
 * Copyright 2025 RickyTicky BobbyWobbin (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { CdnGenericProvider } from './cdnGenericProvider';
import type { CdnGenericProviderConfiguration } from './cdnGenericProvider';

export const CDN_UPDATE_BASE_URL = 'https://static.rickyticky-bobbywobbin.com/releases';

export type CdnFeedOptions = CdnGenericProviderConfiguration & {
  updateProvider: typeof CdnGenericProvider;
};

export function buildCdnFeedOptions(): CdnFeedOptions {
  return {
    provider: 'custom',
    url: CDN_UPDATE_BASE_URL,
    updateProvider: CdnGenericProvider,
  };
}
