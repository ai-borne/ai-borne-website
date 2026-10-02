import { expect, test } from '@playwright/test';

test('renders the public landing page without browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');

  await expect(page).toHaveTitle(/AI-Borne/);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('h1')).toContainText('Engineering Intelligent Apps');
  expect(errors).toEqual([]);
});
