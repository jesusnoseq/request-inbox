import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://request-inbox.com/');
});


test.describe('Create Inbox', () => {
  test('should allows to create a new request inbox', async ({ page }) => {
    const createInbox = page.getByRole('button', { name: 'Create New Inbox' })
    await expect(createInbox).toBeVisible();
    await createInbox.click();
    await expect(createInbox).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Inbox ' })).toBeVisible(); //24a448f5-2fbf-4279-ad48
  })
})
