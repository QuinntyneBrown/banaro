// Acceptance Test
// Traces to: L2-052
// Description: i18n:check fails when a key used in frontend or backend code is missing from a
// catalogue, naming the key and where it is used.

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { checkI18nKeys } from '@/src/console/commands/i18n-check';

let frontend: string;
let output: string[];

const writeFrontend = (name: string, content: string) =>
  writeFileSync(path.join(frontend, 'projects/banaro/src/app/pages/home', name), content);

const check = () => checkI18nKeys({ frontend, print: (line) => output.push(line) });

describe('i18n:check', () => {
  beforeEach(() => {
    frontend = mkdtempSync(path.join(tmpdir(), 'banaro-i18n-'));
    mkdirSync(path.join(frontend, 'projects/banaro/src/app/pages/home'), { recursive: true });
    output = [];
  });

  afterEach(() => rmSync(frontend, { recursive: true, force: true }));

  it('passes when every used key is in the catalogue', async () => {
    writeFrontend('home.html', "<h1>{{ 'common.brand' | t }}</h1>");
    writeFrontend('home.ts', "const brand = this.i18n.t('common.brand');");

    expect(await check()).toBe(0);
  });

  it('fails and names a key missing from the catalogue', async () => {
    writeFrontend(
      'home.html',
      "<h1>{{ 'common.brand' | t }}</h1>\n<p>{{ 'home.notThere' | t: { count: 3 } }}</p>",
    );

    expect(await check()).toBe(1);
    expect(output.join('\n')).toContain(
      'missing home.notThere used in projects/banaro/src/app/pages/home/home.html:2',
    );
  });

  it('finds keys called from TypeScript', async () => {
    writeFrontend('home.ts', 'toast.show(this.i18n.t("home.missingToast", { name }));');

    expect(await check()).toBe(1);
    expect(output.join('\n')).toContain('home.missingToast');
  });
});
