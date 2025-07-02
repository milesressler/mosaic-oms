import { test, expect } from '@playwright/test';
import { createOrder, OrderConfig } from './utils/orderHelper';

test.describe('Order Creation Variants', () => {

    test('standard Savannah order', async ({ page }) => {
        await page.goto('/dashboard/taker');

        const cfg: OrderConfig = {
            customer: 'MosaicOMS TestCustomer',
            selections: [{category: 'gear', items: ['tent']}],
            instructions: '#Automated test order, do not fill#',
        };

        const { id, uuid } = await createOrder(page, cfg);
        expect(id).toBeGreaterThan(0);
        // any other assertions you like…
    });
    //
    // test('new customer workflow', async ({ page }) => {
    //     await page.goto('/dashboard/taker');
    //     // do whatever you need to *create* a new customer first:
    //     await page.click('button#create-new-customer');
    //     await page.fill('#newCustomerName', 'MosaicOMS Test Customer');
    //     await page.click('button#save-customer');
    //     // THEN reuse createOrder
    //     const cfg: OrderConfig = {
    //         customer: 'NewCo LLC',
    //         selections: [{category: 'gear', items: ['tent']}],
    //         instructions: 'First order for NewCo',
    //     };
    //     const { id } = await createOrder(page, cfg);
    //     expect(id).toBeTruthy();
    // });

    // …more variants…
});
