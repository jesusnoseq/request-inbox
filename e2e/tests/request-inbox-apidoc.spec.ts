import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('https://request-inbox.com/');
});