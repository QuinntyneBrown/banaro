import bcrypt from 'bcryptjs';
import { checkI18nKeys } from './console/commands/i18n-check';
import { maintenanceOff, maintenanceOn } from './console/commands/maintenance';
import { migrate } from './console/commands/migrate';
import { seed } from './console/commands/seed';
import { deps } from './container';
import type { QueueName } from './contracts/queue';
import { work } from './queue/work';

/** `npm run banaro -- <command>`: one-off commands, run in the api container (ADR-0002). */
const commands: Record<string, (args: string[]) => Promise<void>> = {
  migrate: async (args) => {
    await migrate(deps().db);
    if (args.includes('--seed')) await seed(deps().db);
  },
  seed: () => seed(deps().db),
  'maintenance:on': async (args) => {
    const retry = Number(args.find((arg) => arg.startsWith('--retry='))?.slice(8) ?? 600);
    await maintenanceOn(deps().redis, retry);
  },
  'maintenance:off': () => maintenanceOff(deps().redis),
  'i18n:check': async (args) => {
    const option = args.find((arg) => arg.startsWith('--frontend='));
    process.exitCode = await checkI18nKeys({ frontend: option?.slice(11) ?? '../frontend' });
  },
  // Works one queue until it is empty; the e2e suite runs queued jobs this way.
  'queue:work': async (args) => {
    const queue = (args.find((arg) => arg.startsWith('--queue='))?.slice(8) ??
      'default') as QueueName;
    console.log(`queue:work: ${await work(deps(), queue)} job(s) from ${queue}`);
  },
  // Prints a bcrypt hash of the value, as reset tokens are stored; the e2e suite issues links with it.
  bcrypt: async ([value]) => {
    if (!value) throw new Error('Usage: bcrypt <value>');
    console.log(await bcrypt.hash(value, Number(process.env.BCRYPT_ROUNDS ?? 12)));
  },
};

/** Commands whose output is read by a script, so they print nothing else. */
const quiet = new Set(['bcrypt']);

const [name, ...args] = process.argv.slice(2);
const command = commands[name];
if (!command) {
  console.error(`Unknown command "${name ?? ''}". Commands: ${Object.keys(commands).join(', ')}`);
  process.exit(1);
}

try {
  await command(args);
  if (!process.exitCode && !quiet.has(name)) console.log(`${name}: done`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await deps().db.end();
  deps().redis.disconnect();
  deps().cache.disconnect();
}
