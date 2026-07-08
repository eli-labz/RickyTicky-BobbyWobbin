const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..', '..', '..');

const allowedExtensions = new Set([
  '.js',
  '.cjs',
  '.mjs',
  '.ts',
  '.tsx',
  '.json',
  '.md',
  '.yml',
  '.yaml',
  '.html',
  '.css',
  '.txt',
  '.ps1',
  '.sh',
]);

const ignoredDirs = new Set([
  '.git',
  'node_modules',
  'dist',
  'out',
  'coverage',
  'build',
  '.next',
  'tmp',
  'temp',
]);

const ignoredRelativePrefixes = [
  'packages/shared-scripts/src/check-branding.js',
  'resources/bundled-aioncore/',
  'packages/shared-scripts/node_modules/',
];

const disallowedPatterns = [
  { label: 'legacy brand name', pattern: /(?<![A-Za-z0-9_])(AionUi|AionUI)(?![A-Za-z0-9_])/g },
  { label: 'legacy GitHub repo slug', pattern: /iOfficeAI\/AionUi/g },
  { label: 'legacy GitHub repo URL', pattern: /github\.com\/iOfficeAI\/AionUi/g },
  { label: 'legacy CDN host', pattern: /static\.aionui\.com/g },
  { label: 'invalid spaced repo slug', pattern: /iOfficeAI\/RickyTicky BobbyWobbin/g },
];

function shouldIgnoreRelativePath(relativePath) {
  return ignoredRelativePrefixes.some((prefix) => relativePath.startsWith(prefix));
}

function walk(dirPath, results) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) {
      continue;
    }

    const absolutePath = path.join(dirPath, entry.name);
    const relativePath = path.relative(repoRoot, absolutePath).split(path.sep).join('/');

    if (shouldIgnoreRelativePath(relativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      walk(absolutePath, results);
      continue;
    }

    if (!allowedExtensions.has(path.extname(entry.name))) {
      continue;
    }

    results.push({ absolutePath, relativePath });
  }
}

function collectViolations(text, relativePath) {
  const violations = [];
  const lines = text.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    for (const rule of disallowedPatterns) {
      if (!rule.pattern.test(line)) {
        continue;
      }
      rule.pattern.lastIndex = 0;
      violations.push(`${relativePath}:${index + 1}: ${rule.label}: ${line.trim()}`);
    }
  }

  return violations;
}

const files = [];
walk(repoRoot, files);

const violations = [];
for (const file of files) {
  const text = fs.readFileSync(file.absolutePath, 'utf8');
  violations.push(...collectViolations(text, file.relativePath));
}

if (violations.length > 0) {
  console.error('Branding check failed. Found legacy or malformed branding references:');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(`Branding check passed (${files.length} files scanned).`);