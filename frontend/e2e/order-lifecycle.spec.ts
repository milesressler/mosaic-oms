import { test, expect, Page, Response } from '@playwright/test';
import { createOrder, OrderConfig } from './utils/orderHelper';

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Wait for a PUT to /api/order/<uuid>/state/<status> and return the parsed body.
 */
async function waitForStateChange(
    page: Page,
    uuid: string,
    expectedStatus: string,
    timeout = 15000
): Promise<Record<string, unknown>> {
    const resp = await page.waitForResponse(
        (r: Response) =>
            r.request().method() === 'PUT' &&
            r.url().includes(`/api/order/${uuid}/state/${expectedStatus}`) &&
            r.status() === 200,
        { timeout }
    );
    return resp.json();
}

/**
 * Navigate to a URL and wait until the network is idle enough that the
 * page content has rendered (avoids flaky checks on empty pages).
 */
async function gotoAndSettle(page: Page, path: string) {
    await page.goto(path);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
        // networkidle can be unreliable on websocket-heavy pages; continue anyway
    });
}

// ── test ─────────────────────────────────────────────────────────────────────

test.describe('Order Lifecycle', () => {
    // Full lifecycle takes many round-trips; give it plenty of room.
    test.setTimeout(120_000);

    test('creates, accepts, packs, delivers and completes an order end-to-end', async ({ page }) => {

        // ── Step 1: Create order (Order Taker) ───────────────────────────────
        await gotoAndSettle(page, '/dashboard/taker');

        const cfg: OrderConfig = {
            customer: 'MosaicOMS TestCustomer',
            selections: [{ category: 'gear', items: ['tent'] }],
            instructions: '#Automated lifecycle test – do not fill#',
        };

        const { id, uuid } = await createOrder(page, cfg);
        expect(id).toBeGreaterThan(0);
        console.log(`Created order id=${id} uuid=${uuid}`);

        // ── Step 2: Accept order (Order Filler) ──────────────────────────────
        // Navigate directly to the filler order URL so the modal opens.
        await gotoAndSettle(page, `/dashboard/filler/order/${id}`);

        const acceptBtn = page.getByRole('button', { name: 'Accept Order' });
        await acceptBtn.waitFor({ state: 'visible', timeout: 15000 });

        const acceptRespPromise = waitForStateChange(page, uuid, 'ACCEPTED');
        await acceptBtn.click();
        const acceptBody = await acceptRespPromise;
        expect(acceptBody.orderStatus).toBe('ACCEPTED');
        console.log('Order accepted.');

        // ── Step 3: Pack (Order Filler) ──────────────────────────────────────
        const packAllBtn = page.getByRole('button', { name: 'Pack All' });
        await packAllBtn.waitFor({ state: 'visible', timeout: 15000 });
        await packAllBtn.click();

        // "Pack All" sets hasStateChanged=true → button switches to "Save Progress".
        const saveProgressBtn = page.getByRole('button', { name: 'Save Progress' });
        await saveProgressBtn.waitFor({ state: 'visible', timeout: 5000 });

        await Promise.all([
            page.waitForResponse(
                (r: Response) =>
                    r.request().method() === 'PUT' &&
                    r.url().includes('/api/orderitem/quantity/bulk') &&
                    r.status() === 200,
                { timeout: 10000 }
            ),
            saveProgressBtn.click(),
        ]);

        // After save, hasStateChanged=false → "Done Packing" reappears.
        const donePackingBtn = page.getByRole('button', { name: 'Done Packing' });
        await donePackingBtn.waitFor({ state: 'visible', timeout: 10000 });
        await donePackingBtn.click();

        // "Done Packing" always opens the "Place in Wagon" modal.
        // The PACKED API call fires after confirming the modal.
        const placeInWagonBtn = page.getByRole('button', { name: 'Place in Wagon' });
        await placeInWagonBtn.waitFor({ state: 'visible', timeout: 10000 });

        const packRespPromise = waitForStateChange(page, uuid, 'PACKED');
        await placeInWagonBtn.click();

        const packBody = await packRespPromise;
        expect(packBody.orderStatus).toBe('PACKED');
        console.log('Order packed.');

        // ── Step 4: Mark as delivered (Runner) ───────────────────────────────
        await gotoAndSettle(page, '/dashboard/runner');

        const orderRow = page.locator(`tr[data-order-id="${id}"]`);
        await orderRow.waitFor({ state: 'visible', timeout: 15000 });
        await orderRow.click(); // toggles selection

        const deliverBtn = page.getByRole('button', { name: 'Mark Selected as Delivered' });
        await deliverBtn.waitFor({ state: 'visible', timeout: 5000 });

        const [deliverResp] = await Promise.all([
            page.waitForResponse(
                (r: Response) =>
                    r.request().method() === 'PUT' &&
                    r.url().includes('/api/order/bulk/state/READY_FOR_CUSTOMER_PICKUP') &&
                    r.status() === 200,
                { timeout: 10000 }
            ),
            deliverBtn.click(),
        ]);
        const deliverBody = await deliverResp.json() as Record<string, unknown>[];
        // Bulk endpoint returns an array; verify our order is in it.
        const deliveredOrder = Array.isArray(deliverBody)
            ? deliverBody.find((o) => (o as { uuid: string }).uuid === uuid)
            : deliverBody;
        expect(deliveredOrder).toBeTruthy();
        console.log('Order marked as delivered.');

        // ── Step 5: Complete order (Distributor) ─────────────────────────────
        await gotoAndSettle(page, `/dashboard/distributor/order/${id}`);

        const completeBtn = page.getByRole('button', { name: 'Complete Order' });
        await completeBtn.waitFor({ state: 'visible', timeout: 15000 });

        const completeRespPromise = waitForStateChange(page, uuid, 'COMPLETED');
        await completeBtn.click();
        const completeBody = await completeRespPromise;
        expect(completeBody.orderStatus).toBe('COMPLETED');
        console.log('Order completed. Lifecycle test passed ✓');
    });
});
