import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { catalogue, LOCALES } from '../../services/user-experience/catalogue-service';

const KEY = String.raw`([a-z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)+)`;
const FRONTEND_PATTERNS = [
  new RegExp(String.raw`['"]${KEY}['"]\s*\|\s*t\b`, 'g'),
  new RegExp(String.raw`\bt\(\s*['"]${KEY}['"]`, 'g'),
];
const BACKEND_PATTERNS = [new RegExp(String.raw`\bt\(\s*['"]${KEY}['"]`, 'g')];
const SKIP = new Set(['node_modules', 'dist', '.angular', '.next']);

interface Options {
  frontend: string;
  print?: (line: string) => void;
}

/**
 * Fails when a translation key used in code is missing from a catalogue (L2-052 criterion 5).
 * Returns the exit code.
 */
export async function checkI18nKeys({ frontend, print = console.log }: Options): Promise<number> {
  const backend = process.cwd();
  const used = [
    ...scan(path.join(frontend, 'projects'), ['.ts', '.html'], FRONTEND_PATTERNS, frontend),
    ...['src', 'app'].flatMap((dir) =>
      scan(path.join(backend, dir), ['.ts'], BACKEND_PATTERNS, backend),
    ),
  ];

  let missing = 0;
  for (const locale of LOCALES) {
    const texts = catalogue(locale);
    for (const [key, where] of used) {
      if (!(key in texts)) {
        print(`[${locale}] missing ${key} used in ${where}`);
        missing++;
      }
    }
    const usedKeys = new Set(used.map(([key]) => key));
    for (const key of Object.keys(texts)) {
      if (!usedKeys.has(key)) print(`[${locale}] unused ${key}`);
    }
  }
  if (missing > 0) return 1;
  print('Every translation key used in code is in each catalogue.');
  return 0;
}

/** Key and file:line of each use under root. */
function scan(root: string, extensions: string[], patterns: RegExp[], relativeTo: string) {
  const uses: [string, string][] = [];
  for (const file of files(root, extensions)) {
    const where = path.relative(relativeTo, file).split(path.sep).join('/');
    readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .forEach((line, index) => {
        for (const pattern of patterns) {
          for (const match of line.matchAll(pattern))
            uses.push([match[1], `${where}:${index + 1}`]);
        }
      });
  }
  return uses;
}

function files(dir: string, extensions: string[]): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries.flatMap((name) => {
    if (SKIP.has(name)) return [];
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return files(full, extensions);
    return extensions.some((extension) => name.endsWith(extension)) ? [full] : [];
  });
}
