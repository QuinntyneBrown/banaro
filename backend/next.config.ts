import type { NextConfig } from 'next';

// API only (ADR-0007): Angular serves every page, so Next.js serves route handlers and nothing else.
const config: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  serverExternalPackages: ['pg', 'ioredis', 'pino'],
};

export default config;
