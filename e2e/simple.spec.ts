import { test, expect } from '@playwright/test';

test('basic app loading', async ({ page }) => {
  await page.goto('/');
  
  // Wait for the page to load
  await expect(page).toHaveTitle(/Gaussian Mixture Model Explorer/);
  
  // Check that the main heading is visible
  await expect(page.getByRole('heading', { name: /Gaussian Mixture Model Explorer/i })).toBeVisible();
  
  // Check that key sections are present
  await expect(page.getByText('EM Algorithm Controls')).toBeVisible();
  await expect(page.getByText('Data Input')).toBeVisible();
});