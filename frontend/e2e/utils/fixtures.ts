import { test as base, Response } from '@playwright/test';
import { gotoAndSettle } from './pageHelper';

type AppFixtures = {
    /**
     * Ensures the service window (orders) is open for the duration of the test,
     * then restores it to its original state (open or closed) when the test ends.
     */
    ordersOpen: void;
};

export const test = base.extend<AppFixtures>({
    ordersOpen: async ({ page }, use) => {
        await gotoAndSettle(page, '/dashboard/taker');

        // Wait for the features context to resolve — either the closed alert or the switch appears
        const closedAlert = page.getByText('Orders are currently closed');
        await Promise.race([
            closedAlert.waitFor({ state: 'visible', timeout: 10000 }),
            page.locator('.mantine-Switch-thumb').first().waitFor({ state: 'visible', timeout: 10000 }),
        ]);
        const wasOpen = !(await closedAlert.isVisible());

        if (!wasOpen) {
            await Promise.all([
                page.waitForResponse(
                    (r: Response) =>
                        r.request().method() === 'PUT' &&
                        r.url().includes('/api/feature/orders') &&
                        r.status() === 200,
                    { timeout: 10000 }
                ),
                page.getByRole('alert', { name: 'Orders are currently closed' }).locator('.mantine-Switch-thumb').click(),
            ]);
            console.log('Service window opened for test run.');
        }

        await use();

        if (!wasOpen) {
            await gotoAndSettle(page, '/dashboard/taker');
            // Orders are open now — switch is a standalone OrdersOpenSwitch in the form, not in the alert
            const ordersOpenSwitch = page.locator('.mantine-Switch-root', { hasText: 'Orders Open' }).locator('.mantine-Switch-thumb');
            await ordersOpenSwitch.waitFor({ state: 'visible', timeout: 10000 });
            await Promise.all([
                page.waitForResponse(
                    (r: Response) =>
                        r.request().method() === 'PUT' &&
                        r.url().includes('/api/feature/orders') &&
                        r.status() === 200,
                    { timeout: 10000 }
                ),
                ordersOpenSwitch.click(),
            ]);
            console.log('Service window restored to closed.');
        }
    },
});

export { expect } from '@playwright/test';
