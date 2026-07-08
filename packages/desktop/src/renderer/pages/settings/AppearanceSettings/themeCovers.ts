/**
 * @license
 * Copyright 2025 RickyTicky BobbyWobbin (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

// Preset theme cover images — Vite resolves these to hashed asset URLs at build time.
// Previously these were inline base64 strings (~700 KB), now they are normal static imports.
const defaultThemeCover = '/rickyticky-bobbywobbin-logo.jpg';
import misakaMikotoCover from '@renderer/assets/themes/misaka-mikoto-theme.png';
import helloKittyCover from '@renderer/assets/themes/hello-kitty.png';
import retroWindowsCover from '@renderer/assets/themes/retro-windows.png';
import retromaObsidianBookCover from '@renderer/assets/themes/obsidian-book-cover.png';

export {
  defaultThemeCover,
  misakaMikotoCover,
  helloKittyCover,
  retroWindowsCover,
  retromaObsidianBookCover,
};
