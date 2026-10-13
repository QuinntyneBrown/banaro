import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Integration tests run inside the api container (ADR-0002) against the banaro_test database and
// Redis databases that development does not use. The global setup runs in this process too, so the
// test environment replaces the development one here, before anything connects.
const testEnv = {
  APP_ENV: 'testing',
  APP_KEY: 'test-app-key-not-secret',
  DATABASE_URL:
    process.env.TEST_DATABASE_URL ?? 'postgres://banaro:banaro@postgres:5432/banaro_test',
  REDIS_URL: process.env.REDIS_URL ?? 'redis://redis:6379',
  REDIS_DB: '14',
  REDIS_CACHE_DB: '15',
  LOG_LEVEL: 'silent',
  BCRYPT_ROUNDS: '4',
};
Object.assign(process.env, testEnv);

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  test: {
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/support/global-setup.ts'],
    setupFiles: ['tests/support/setup.ts'],
    fileParallelism: false,
    testTimeout: 20000,
    env: testEnv,
  },
});
