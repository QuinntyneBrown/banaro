import { checkI18nKeys } from './console/commands/i18n-check';
import { migrate } from './console/commands/migrate';
import { seed } from './console/commands/seed';
import { deps } from './container';

/** `npm run banaro -- <command>`: one-off commands, run in the api container (ADR-0002). */
const commands: Record<string, (args: string[]) => Promise<void>> = {
  migrate: async (args) => {
    await migrate(deps().db);
    if (args.includes('--seed')) await seed(deps().db);
  },
  seed: () => seed(deps().db),
  'i18n:check': async (args) => {
    const option = args.find((arg) => arg.startsWith('--frontend='));
    process.exitCode = await checkI18nKeys({ frontend: option?.slice(11) ?? '../frontend' });
  },
};

const [name, ...args] = process.argv.slice(2);
const command = commands[name];
if (!command) {
  console.error(`Unknown command "${name ?? ''}". Commands: ${Object.keys(commands).join(', ')}`);
  process.exit(1);
}

try {
  await command(args);
  if (!process.exitCode) console.log(`${name}: done`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await deps().db.end();
  deps().redis.disconnect();
  deps().cache.disconnect();
}
