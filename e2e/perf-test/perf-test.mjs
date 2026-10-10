// Component perf test runner (AGENTS.md "Component perf tests"), modelled on Fluent UI's
// apps/perf-test. Serves the perf-test build of this branch (and optionally the base branch),
// renders each scenario many times in Chromium with the V8 CPU profiler running, and compares
// the medians.
//
//   node perf-test/perf-test.mjs [--current <dist>] [--baseline <dist>] [--scenarios A,B]
//                                [--fail-on-regression]
//
// A <dist> is the perf-test browser output, such as ../frontend/dist/perf-test/browser.

import { chromium } from '@playwright/test';
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config/config.mjs';
import { excludedScenarios } from './config/excluded-scenarios.mjs';
import { scenarioIterations } from './config/scenario-iterations.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const logDir = join(here, 'logfiles');

function parseArgs(argv) {
  const args = { current: resolve(here, '../../frontend/dist/perf-test/browser'), failOnRegression: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--current') args.current = resolve(argv[++i]);
    else if (arg === '--baseline') args.baseline = resolve(argv[++i]);
    else if (arg === '--scenarios') args.scenarios = argv[++i].split(',').map((s) => s.trim());
    else if (arg === '--fail-on-regression') args.failOnRegression = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

/** Serves a built browser directory, falling back to index.html. */
function serve(root) {
  if (!existsSync(join(root, 'index.html'))) throw new Error(`No perf-test build at ${root}`);
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = join(root, path);
    if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) file = join(root, 'index.html');
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok({ server, url: `http://127.0.0.1:${server.address().port}` })));
}

/** Scenario names, read from the perf-test app's scenarios/index.ts. */
function scenarioNames() {
  const index = readFileSync(resolve(here, '../../frontend/projects/perf-test/src/scenarios/index.ts'), 'utf8');
  const block = /scenarios[^=]*=\s*\{([\s\S]*?)\}/.exec(index)?.[1] ?? '';
  return block.split(',').map((s) => s.trim()).filter(Boolean);
}

async function measure(browser, baseUrl, scenario, renderType, iterations, profilePath) {
  const page = await browser.newPage();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.start');
  try {
    await page.goto(`${baseUrl}/?scenario=${scenario}&iterations=${iterations}&renderType=${renderType}`);
    await page.waitForSelector('body[data-perf-status]', { state: 'attached', timeout: 60_000 });
    const outcome = await page.evaluate(() => ({ result: window.__perfResult, error: window.__perfError }));
    const { profile } = await cdp.send('Profiler.stop');
    if (profilePath) writeFileSync(profilePath, JSON.stringify(profile));
    if (outcome.error || !outcome.result) throw new Error(outcome.error ?? 'No result');
    return outcome.result.durationMs;
  } finally {
    await page.close();
  }
}

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

async function runAll(browser, label, baseUrl, names) {
  const results = {};
  for (const scenario of names) {
    for (const renderType of config.renderTypes) {
      const key = `${scenario}:${renderType}`;
      const iterations = scenarioIterations[scenario] ?? config.defaultIterations;
      const runs = [];
      try {
        for (let run = 0; run < config.runs; run++) {
          const profile = run === 0 ? join(logDir, `${label}-${scenario}-${renderType}.cpuprofile`) : undefined;
          runs.push(await measure(browser, baseUrl, scenario, renderType, iterations, profile));
        }
        results[key] = { scenario, renderType, iterations, runs, median: median(runs) };
      } catch (error) {
        results[key] = { scenario, renderType, iterations, runs, error: String(error) };
      }
    }
  }
  return results;
}

function compare(current, baseline) {
  return Object.entries(current).map(([key, cur]) => {
    const base = baseline?.[key];
    const row = { key, ...cur, baseline: base };
    if (cur.error) return { ...row, status: 'Failed to render' };
    if (!base || base.error) return { ...row, status: 'No baseline' };
    const delta = cur.median - base.median;
    const overlap = Math.min(...cur.runs) <= Math.max(...base.runs);
    const regression =
      delta / base.median > config.thresholds.percent / 100 && delta >= config.thresholds.minMs && !overlap;
    return { ...row, delta, status: regression ? 'Possible regression' : 'OK' };
  });
}

function report(rows, hasBaseline) {
  const fmt = (n) => (n === undefined ? '—' : `${n.toFixed(2)} ms`);
  const lines = [
    '# Component perf test',
    '',
    hasBaseline
      ? '| Scenario | Render | Iterations | Base median | This branch median | Change | Status |'
      : '| Scenario | Render | Iterations | Median | Status |',
    hasBaseline ? '|---|---|---:|---:|---:|---:|---|' : '|---|---|---:|---:|---|',
  ];
  for (const r of rows) {
    if (hasBaseline) {
      const pct = r.delta !== undefined ? `${((r.delta / r.baseline.median) * 100).toFixed(1)}%` : '—';
      lines.push(`| ${r.scenario} | ${r.renderType} | ${r.iterations} | ${fmt(r.baseline?.median)} | ${fmt(r.median)} | ${pct} | ${r.status} |`);
    } else {
      lines.push(`| ${r.scenario} | ${r.renderType} | ${r.iterations} | ${fmt(r.median)} | ${r.status} |`);
    }
  }
  return lines.join('\n') + '\n';
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  mkdirSync(logDir, { recursive: true });
  const browser = await chromium.launch();
  const servers = [];
  try {
    const current = await serve(args.current);
    servers.push(current.server);
    let names = args.scenarios ?? scenarioNames();
    names = names.filter((n) => !excludedScenarios.includes(n));

    const currentResults = await runAll(browser, 'current', current.url, names);
    let baselineResults;
    if (args.baseline) {
      const baseline = await serve(args.baseline);
      servers.push(baseline.server);
      baselineResults = await runAll(browser, 'baseline', baseline.url, names);
    }

    const rows = compare(currentResults, baselineResults);
    const markdown = report(rows, !!args.baseline);
    writeFileSync(join(logDir, 'perf-test.md'), markdown);
    writeFileSync(join(logDir, 'results.json'), JSON.stringify({ current: currentResults, baseline: baselineResults, rows }, null, 2));
    if (process.env.GITHUB_STEP_SUMMARY) writeFileSync(process.env.GITHUB_STEP_SUMMARY, markdown, { flag: 'a' });
    console.log(markdown);

    const failed = rows.filter((r) => r.status === 'Failed to render' || r.status === 'Possible regression');
    if (failed.length) {
      console.error(`${failed.length} scenario(s) flagged: ${failed.map((r) => r.key).join(', ')}`);
      if (args.failOnRegression) process.exitCode = 1;
    }
  } finally {
    await browser.close();
    servers.forEach((s) => s.close());
  }
}

await main();
