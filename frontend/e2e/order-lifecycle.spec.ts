import { expect } from '@playwright/test';
import { test } from './utils/fixtures';
import { gotoAndSettle, waitForStateChange } from './utils/pageHelper';
import { createOrder, OrderConfig } from './utils/orderHelper';

test.describe('Order Lifecycle', () => {
    // Full lifecycle takes many round-trips; give it plenty of room.
    test.setTimeout(120_000);

    test('creates, accepts, packs, delivers and completes an order end-to-end',
        async ({ page, ordersOpen }) => {

        // ── Step 1: Create order (Order Taker) ───────────────────────────────
        const cfg: OrderConfig = {
            customer: 'MosaicOMS TestCustomer',
            selections: [{ category: 'gear', items: ['Backpack'] }],
            instructions: '#Automated lifecycle test – do not fill#',
        };

        const { id, uuid } = await createOrder(page, cfg);
        expect(id).toBeGreaterThan(0);
        console.log(`Created order id=${id} uuid=${uuid}`);

        // ── Step 2: Accept order (Order Filler) ──────────────────────────────
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

        // "Pack All" sets hasStateChanged=true → button switches to "Save Progress"
        const saveProgressBtn = page.getByRole('button', { name: 'Save Progress' });
        await saveProgressBtn.waitFor({ state: 'visible', timeout: 5000 });

        await Promise.all([
            page.waitForResponse(
                r => r.request().method() === 'PUT' &&
                     r.url().includes('/api/orderitem/quantity/bulk') &&
                     r.status() === 200,
                { timeout: 10000 }
            ),
            saveProgressBtn.click(),
        ]);

        // After save, hasStateChanged=false → "Done Packing" reappears
        const donePackingBtn = page.getByRole('button', { name: 'Done Packing' });
        await donePackingBtn.waitFor({ state: 'visible', timeout: 10000 });
        await donePackingBtn.click();

        // "Done Packing" opens the "Place in Wagon" confirmation modal
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
        await orderRow.click();

        const deliverBtn = page.getByRole('button', { name: 'Mark Selected as Delivered' });
        await deliverBtn.waitFor({ state: 'visible', timeout: 5000 });

        const [deliverResp] = await Promise.all([
            page.waitForResponse(
                r => r.request().method() === 'PUT' &&
                     r.url().includes('/api/order/bulk/state/READY_FOR_CUSTOMER_PICKUP') &&
                     r.status() === 200,
                { timeout: 10000 }
            ),
            deliverBtn.click(),
        ]);
        const deliverBody = await deliverResp.json() as Record<string, unknown>[];
        const deliveredOrder = Array.isArray(deliverBody)
            ? deliverBody.find(o => (o as { uuid: string }).uuid === uuid)
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