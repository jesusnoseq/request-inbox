import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('https://request-inbox.com/inbox/24a448f5-2fbf-4279-ad48-914561feaf47');
});


test.describe('Inbox', () => {
    test('should shows inbox information', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Inbox 24a448f5-2fbf-4279-ad48' })).toBeVisible();
    })
    test('should shows request information', async ({ page }) => {
    })
    test('should updates request information', async ({ page }) => {
    })
    test('should allows update inbox information', async ({ page }) => {
    })
})
