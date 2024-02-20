import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://request-inbox.com/');
});


test.describe('Home page', () => {
  test('should shows inbox list items and no errors', async ({ page }) => {
    await expect(page.getByText('Request InboxInboxAPI docAbout')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Request Inbox');
    await expect(page.getByRole('heading', { name: 'Inbox List' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create New Inbox' })).toBeVisible();
    await expect(page.locator('footer').nth(0)).toContainText('© 2023 Jesusnoseq. Licensed under the Apache License, Version 2.0.');
  })
})


test.describe('Header', () => {
  test('should contains the navigation items and allows navigation', async ({ page }) => {
    const about = page.getByRole('link', { name: 'ABOUT' })
    await expect(about).toBeVisible();
    await about.click();
    await expect(page.locator('h2')).toContainText('About Request Inbox');

    const apiDoc = page.getByRole('link', { name: 'API DOC' })
    await expect(apiDoc).toBeVisible();
    await apiDoc.click();
    await expect(page.locator('h2')).toContainText('Request Inbox');

    const inbox = page.getByRole('link', { name: 'INBOX' }).nth(1);
    await expect(inbox).toBeVisible();
    await inbox.click();
    await expect(page.locator('h2')).toContainText('Inbox List');
  })

  test('theme switch should change theme to dark or light theme', async ({ page }) => {
    await page.getByRole('checkbox').nth(0).check();
    await page.getByRole('checkbox').nth(0).check();
    await page.getByRole('checkbox').nth(0).check();
  })
})



// test.describe('Header', () => {
//   test('generic', async ({ page }) => {

//     await page.locator('html').click();
//     await page.getByRole('link', { name: 'About' }).click();
//     await expect(page.getByRole('heading', { name: 'About Request Inbox' })).toBeVisible();




//     await page.getByRole('link', { name: 'Inbox', exact: true }).click();
//     await page.getByRole('button', { name: 'Create New Inbox' }).click();
//     await expect(page.getByRole('heading', { name: 'Inbox 24a448f5-2fbf-4279-ad48' })).toBeVisible();
//     await expect(page.getByText('No requests found for this')).toBeVisible();
//     await page.getByRole('link', { name: 'https://api.request-inbox.com' }).click({
//       button: 'middle'
//     });
//     await page.goto('https://request-inbox.com/inbox/24a448f5-2fbf-4279-ad48-914561feaf47');

//     await page.getByRole('link', { name: 'https://api.request-inbox.com' }).click({
//       button: 'middle'
//     });
//     await expect(page.getByText('Nº 2January 30, 2024 1:02 PMHTTP/1.1 GET /api/v1/inboxes/24a448f5-2fbf-4279-')).toBeVisible();
//     await expect(page.getByText('Nº 1January 30, 2024 1:02 PMHTTP/1.1 GET /api/v1/inboxes/24a448f5-2fbf-4279-')).toBeVisible();
//     await expect(page.getByText('Inbox 24a448f5-2fbf-4279-ad48-914561feaf47Open since January 30, 2024 1:02')).toBeVisible();
//   });



// test('has title', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle(/Playwright/);
// });

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
