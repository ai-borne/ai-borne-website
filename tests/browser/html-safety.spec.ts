import { expect, test } from '@playwright/test';

test('does not render query-string input as blog post HTML', async ({ page }) => {
  await page.goto('/blog/post.html?slug=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E');

  await expect(page.locator('.article-not-found')).toBeVisible();
  await expect(page.locator('img[src="x"]')).toHaveCount(0);
});
