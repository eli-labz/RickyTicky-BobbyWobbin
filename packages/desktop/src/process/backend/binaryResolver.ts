/**
 * Resolve the aioncore binary path.
 *
 * Search order:
 *  1. Bundled with app (production)
 *  2. System PATH
 */

import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const BINARY_NAME = 'aioncore';
const MAX_DIR_ENTRIES = 20;
const MAX_LOOKUP_TEXT_LENGTH = 1000;

type BackendBinaryResolveDiagnostics = {
  resourcesPath?: string;
  runtimeKey: string;
  binaryName: string;
  checkedBundledPath?: string;
  bundledDirExists?: boolean;
  runtimeDirExists?: boolean;
  resourcesDirEntries?: string[];
  runtimeDirEntries?: string[];
  pathLookupCommand: string;
  pathLookupResult?: string;
  pathLookupError?: string;
  checkedEnvBinaryPath?: string;
  checkedFallbackPaths?: string[];
  selectedFallbackPath?: string;
};

class BackendBinaryResolveError extends Error {
  readonly diagnostics: BackendBinaryResolveDiagnostics;

  constructor(message: string, diagnostics: BackendBinaryResolveDiagnostics) {
    super(message);
    this.name = 'BackendBinaryResolveError';
    this.diagnostics = diagnostics;
  }
}

function getBinaryName(): string {
  return process.platform === 'win32' ? `${BINARY_NAME}.exe` : BINARY_NAME;
}

function getRuntimeKey(): string {
  return `${process.platform}-${process.arch}`;
}

function listDirEntries(dirPath: string): string[] | undefined {
  try {
    return readdirSync(dirPath, { withFileTypes: true })
      .slice(0, MAX_DIR_ENTRIES)
      .map((entry) => `${entry.name}${entry.isDirectory() ? '/' : ''}`);
  } catch {
    return undefined;
  }
}

function trimLookupText(text: string): string {
  return text.trim().slice(0, MAX_LOOKUP_TEXT_LENGTH);
}

function getRepoBundledBinaryPath(runtimeKey: string, binaryName: string): string {
  return resolve(process.cwd(), 'resources', 'bundled-aioncore', runtimeKey, binaryName);
}

/**
 * Resolve the aioncore binary path.
 * Returns the absolute path to the binary, or throws if not found.
 */
export function resolveBinaryPath(): string {
  const runtimeKey = getRuntimeKey();
  const binaryName = getBinaryName();
  const diagnostics: BackendBinaryResolveDiagnostics = {
    runtimeKey,
    binaryName,
    pathLookupCommand: process.platform === 'win32' ? `where ${BINARY_NAME}` : `which ${BINARY_NAME}`,
  };

  const bundled = bundledPath(runtimeKey, binaryName, diagnostics);
  if (bundled) return bundled;

  const fromPath = resolveFromSystemPATH(diagnostics);
  if (fromPath) return fromPath;

  const fromFallback = resolveFromFallbackPaths(runtimeKey, binaryName, diagnostics);
  if (fromFallback) return fromFallback;

  throw new BackendBinaryResolveError(
    `Cannot find "${BINARY_NAME}" binary. Checked bundled location, system PATH, and local fallback paths.`,
    diagnostics
  );
}

function getFallbackBinaryPaths(runtimeKey: string, binaryName: string): string[] {
  const candidates: string[] = [];

  const envBinaryPath = process.env.AIONCORE_BINARY?.trim();
  if (envBinaryPath) {
    candidates.push(envBinaryPath);
  }

  const bundledBaseDir = process.env.AIONUI_BACKEND_BUNDLED_DIR?.trim();
  if (bundledBaseDir) {
    candidates.push(join(bundledBaseDir, runtimeKey, binaryName));
  }

  const cargoHome = process.env.CARGO_HOME?.trim();
  if (cargoHome) {
    candidates.push(join(cargoHome, 'bin', binaryName));
  }

  const homeDir = process.env.USERPROFILE || process.env.HOME;
  if (homeDir) {
    candidates.push(join(homeDir, '.cargo', 'bin', binaryName));
  }

  candidates.push(
    getRepoBundledBinaryPath(runtimeKey, binaryName),
    resolve(process.cwd(), '..', 'AionCore', 'target', 'release', binaryName),
    resolve(process.cwd(), '..', 'AionCore', 'target', 'debug', binaryName)
  );

  return [...new Set(candidates)];
}

function resolveFromFallbackPaths(
  runtimeKey: string,
  binaryName: string,
  diagnostics: BackendBinaryResolveDiagnostics
): string | null {
  const candidates = getFallbackBinaryPaths(runtimeKey, binaryName);
  diagnostics.checkedFallbackPaths = candidates;
  diagnostics.checkedEnvBinaryPath = process.env.AIONCORE_BINARY?.trim() || undefined;

  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) {
      diagnostics.selectedFallbackPath = candidate;
      return candidate;
    }
  }

  return null;
}

/**
 * Check bundled binary in resources directory.
 * Layout: bundled-aioncore/{platform}-{arch}/aioncore[.exe]
 */
function bundledPath(
  runtimeKey: string,
  binaryName: string,
  diagnostics: BackendBinaryResolveDiagnostics
): string | null {
  const resourcesPath = (process as NodeJS.Process & { resourcesPath?: string }).resourcesPath;
  if (!resourcesPath) return null;
  diagnostics.resourcesPath = resourcesPath;

  const bundledDir = join(resourcesPath, 'bundled-aioncore');
  const runtimeDir = join(bundledDir, runtimeKey);
  const candidate = join(runtimeDir, binaryName);
  diagnostics.checkedBundledPath = candidate;
  diagnostics.bundledDirExists = existsSync(bundledDir);
  diagnostics.runtimeDirExists = existsSync(runtimeDir);
  diagnostics.resourcesDirEntries = listDirEntries(resourcesPath);
  diagnostics.runtimeDirEntries = listDirEntries(runtimeDir);

  if (existsSync(candidate)) return candidate;
  return null;
}

/**
 * Try to find the binary on the system PATH.
 */
function resolveFromSystemPATH(diagnostics: BackendBinaryResolveDiagnostics): string | null {
  try {
    const result = execSync(diagnostics.pathLookupCommand, { encoding: 'utf-8', timeout: 5000 }).trim();
    diagnostics.pathLookupResult = trimLookupText(result);
    const firstMatch = result.split(/\r?\n/).find((line) => line.trim());
    if (firstMatch && existsSync(firstMatch.trim())) return firstMatch.trim();
  } catch (error) {
    diagnostics.pathLookupError = error instanceof Error ? trimLookupText(error.message) : String(error);
    return null;
  }
  return null;
}

export type { BackendBinaryResolveDiagnostics };
