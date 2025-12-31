import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        test: {
            globals: true,
            environment: 'node',
            testTimeout: 10000,
            env: env,
        },
    };
});
