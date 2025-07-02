import { test } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

test('record Auth0 login state', async ({ page }, testInfo) => {
    test.skip(process.env.RECORD !== 'true', 'Set RECORD=true to regenerate storage');

    await page.goto('/');
    await page.locator('button:has-text("Log In"):visible').first().click();
    await page.fill('input[name="email"]', process.env.AUTH0_TEST_USER!);
    await page.fill('input[name="password"]', process.env.AUTH0_TEST_PW!);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/**');

    // this will write "qa-storage.json" or "prod-storage.json" based on --project
    const file = `e2e/data/${testInfo.project.name}-storage.json`;
    await page.context().storageState({ path: file });
});
