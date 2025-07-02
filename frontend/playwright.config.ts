import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
    testDir: 'e2e',
    timeout: 15000,
    projects: [
        {
            name: 'local',
            use: {
                baseURL: process.env.LOCAL_URL,
                storageState: 'e2e/data/local-storage.json',
            },
        },
        {
            name: 'qa',
            use: {
                baseURL: process.env.QA_URL,
                storageState: 'e2e/data/qa-storage.json',
            },
        },
        {
            name: 'prod',
            use: {
                baseURL: process.env.PROD_URL,
                storageState: 'e2e/data/prod-storage.json',
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
