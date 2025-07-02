import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
// these two let us reconstruct __dirname in ESM
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// the only fs function we need
import { existsSync } from 'fs';

dotenv.config();


// recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// helper: if the JSON exists, use its path; otherwise start empty
function storageStateOrEmpty(relPath: string) {
    const abs = resolve(__dirname, relPath);
    return existsSync(abs)
        ? abs
        : { cookies: [], origins: [] };
}

export default defineConfig({
    testDir: 'e2e',
    timeout: 15000,
    projects: [
        {
            name: 'local',
            use: {
                baseURL: process.env.LOCAL_URL,
                storageState: storageStateOrEmpty('e2e/data/local-storage.json'),
            },
        },
        {
            name: 'qa',
            use: {
                baseURL: process.env.QA_URL,
                storageState: storageStateOrEmpty('e2e/data/qa-storage.json'),
            },
        },
        {
            name: 'prod',
            use: {
                baseURL: process.env.PROD_URL,
                storageState: storageStateOrEmpty('e2e/data/prod-storage.json'),
            },
        },
    ],
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        video: 'retain-on-failure',
    },
    globalTeardown: './e2e/global-teardown.ts',

});
