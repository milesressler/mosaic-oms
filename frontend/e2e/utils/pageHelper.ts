import { Page, Response } from '@playwright/test';

/**
 * Navigate to a path and wait for the network to settle.
 * networkidle can be unreliable on WebSocket-heavy pages, so the rejection is swallowed.
 */
export async function gotoAndSettle(page: Page, path: string): Promise<void> {
    await page.goto(path);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
}

/**
 * Wait for a PUT to /api/order/<uuid>/state/<status> and return the parsed body.
 */
export async function waitForStateChange(
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