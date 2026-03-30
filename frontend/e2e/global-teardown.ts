// tests/global‐teardown.ts
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

import * as dotenv from 'dotenv';
dotenv.config();

async function globalTeardown() {
    // 1) Figure out which env we’re running against
    const envs = ['local', 'qa', 'prod'] as const;
    const activeEnv = envs.find(e => Boolean(process.env[`${e.toUpperCase()}_URL`]));
    if (!activeEnv) throw new Error('No LOCAL_URL, QA_URL or PROD_URL defined');

    const baseURL     = process.env[`${activeEnv.toUpperCase()}_URL`]!;
    const storageFile = fileURLToPath(new URL(`../e2e/data/${activeEnv}-storage.json`, import.meta.url));

    // 2) Read the file of created IDs
    // 2) Read your CSV file
    const idsFile = fileURLToPath(new URL('../data/created-order-ids.txt', import.meta.url));
    let lines: string[];
    try {
        lines = readFileSync(idsFile, 'utf8').split('\n').filter(Boolean);
    } catch {
        console.log('No created-order-ids.txt found; nothing to cancel.');
        return;
    }

    if (lines.length === 0) {
        console.log('No orders to cancel.');
        return;
    }

    // 3) Launch browser with your login state
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        storageState: storageFile,
        // Enable this for debugging udpates to cleanup script
        // recordVideo: {
        //     dir: path.resolve(__dirname, '../test-results/videos/teardown'),
        //     size: { width: 1280, height: 720 },
        // },
    });
    const page    = await context.newPage();

    // 4) Cancel each order by ID (skip orders that are already completed/cancelled)
    for (const line of lines) {
        const [id, uuid] = line.split(',');

        await page.goto(`${baseURL}/order/${id}`);

        // The Actions button is only rendered for orders that can still be cancelled.
        // Completed or already-cancelled orders have no such button – skip them.
        const actionsBtn = page.getByRole('button', { name: 'Actions' });
        const canCancel = await actionsBtn.isVisible({ timeout: 5000 }).catch(() => false);
        if (!canCancel) {
            console.log(`→ Order ${id} has no Actions button (likely already completed/cancelled) – skipping.`);
            continue;
        }

        await actionsBtn.click();
        const [cancelResp] = await Promise.all([
            page.waitForResponse(resp =>
                resp.request().method() === 'PUT' &&
                resp.url().endsWith(`/api/order/${uuid}/state/CANCELLED`) &&
                resp.status() === 200
            ),
            page.getByRole('menuitem', { name: /^Cancel$/i }).click(),
        ]);

        console.log(`→ API responded ${cancelResp.status()}`);
    }

    await browser.close();

    // 5) (Optional) clear the file so we don't cancel again next time
    writeFileSync(idsFile, '');
}

export default globalTeardown;
