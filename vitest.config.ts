import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
    plugins: [vue()],
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: ['./tests/setup.ts'],
    },
    resolve: {
        alias: {
            '~': resolve(__dirname, './app'),
            '~~': resolve(__dirname, '.'),
            '@': resolve(__dirname, './app'),
            '~~/types': resolve(__dirname, './types'),
        },
    },
})
