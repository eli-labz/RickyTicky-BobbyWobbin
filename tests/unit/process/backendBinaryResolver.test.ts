/**
 * @license
 * Copyright 2025 RickyTicky BobbyWobbin (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveBinaryPath } from '@/process/backend/binaryResolver';

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}));

vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs');
  return {
    ...actual,
    existsSync: vi.fn(),
  };
});

const originalEnv = {
  AIONCORE_BINARY: process.env.AIONCORE_BINARY,
  AIONUI_BACKEND_BUNDLED_DIR: process.env.AIONUI_BACKEND_BUNDLED_DIR,
  CARGO_HOME: process.env.CARGO_HOME,
  USERPROFILE: process.env.USERPROFILE,
  HOME: process.env.HOME,
};

describe('resolveBinaryPath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.AIONCORE_BINARY = originalEnv.AIONCORE_BINARY;
    process.env.AIONUI_BACKEND_BUNDLED_DIR = originalEnv.AIONUI_BACKEND_BUNDLED_DIR;
    process.env.CARGO_HOME = originalEnv.CARGO_HOME;
    process.env.USERPROFILE = originalEnv.USERPROFILE;
    process.env.HOME = originalEnv.HOME;
  });

  it('uses the repo bundled backend when PATH lookup fails', () => {
    const runtimeKey = `${process.platform}-${process.arch}`;
    const binaryName = process.platform === 'win32' ? 'aioncore.exe' : 'aioncore';
    const binaryPath = join(process.cwd(), 'resources', 'bundled-aioncore', runtimeKey, binaryName);

    process.env.AIONCORE_BINARY = '';
    process.env.AIONUI_BACKEND_BUNDLED_DIR = '';
    process.env.CARGO_HOME = '';
    process.env.USERPROFILE = '';
    process.env.HOME = '';

    vi.mocked(existsSync).mockImplementation((target) => target === binaryPath);
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('not found on PATH');
    });

    expect(resolveBinaryPath()).toBe(binaryPath);
  });
});
