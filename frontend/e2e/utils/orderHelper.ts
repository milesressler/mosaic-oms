import { Page } from '@playwright/test';
import { appendFileSync } from 'fs';
import {fileURLToPath} from "url";

export type Selection = {
    category: string;
    items: string[];
};

export type OrderConfig = {
    customer: string;
    selections: Selection[];
    instructions: string;
};

/**
 * Creates an order by selecting a customer, choosing categories and items,
 * filling special instructions, and submitting. Returns the new order's id and uuid.
 */
export async function createOrder(
    page: Page,
    { customer, selections, instructions }: OrderConfig
): Promise<{ id: number; uuid: string }> {
    // 1) Search customer & pick the second result card
    await page.fill('#customerSearchInput', customer);
    await page.locator('.customerResultCard').nth(1).click();

    // 2) For each category -> items selection
    for (const { category, items } of selections) {
        // click the category button/link
        await page.getByText(new RegExp(category, 'i')).click();
        // click each item under that category
        for (const item of items) {
            await page.getByText(new RegExp(item, 'i')).click();
        }
    }

    // 3) Advance to the next step
    await page.getByText(/next/i).click();

    // 4) Fill special instructions and continue
    await page.fill('#specialInstructions', instructions);
    await page.getByText(/next/i).click();

    // 5) Submit and capture the POST /api/order response
    const [response] = await Promise.all([
        page.waitForResponse(resp =>
            resp.request().method() === 'POST' &&
            resp.url().includes('/api/order')
        ),
        page.getByRole('button', { name: 'Submit Order' }).click(),
    ]);

    const body = (await response.json()) as { id: number; uuid: string };
    const { id, uuid } = body;

    // 6) Persist for teardown
    const filePath = fileURLToPath(new URL('../data/created-order-ids.txt', import.meta.url));
    appendFileSync(filePath, `${id},${uuid}\n`);

    return { id, uuid };
}
