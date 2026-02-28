import { defineConfig } from 'vite';

const base = (globalThis as unknown as { process?: { env?: { BASE_PATH?: string } } }).process?.env?.BASE_PATH ?? '/';

export default defineConfig({
  base,
});
