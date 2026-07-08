/**
 * @license
 * Copyright 2025 RickyTicky BobbyWobbin (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { logger } from '@office-ai/platform';
import { initAllBridges } from '../bridge';

logger.config({ print: true });

initAllBridges();
