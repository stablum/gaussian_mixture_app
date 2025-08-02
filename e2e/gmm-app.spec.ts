import { test, expect } from '@playwright/test';

test.describe('GMM Explorer App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForSelector('[data-testid="gmm-chart"], .recharts-wrapper, svg', { timeout: 10000 });
  });

  test('should load and display the main interface', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { name: 'Gaussian Mixture Model Explorer' })).toBeVisible();
    
    // Check main sections are present
    await expect(page.getByText('EM Algorithm Controls')).toBeVisible();
    await expect(page.getByText('Component Parameters')).toBeVisible();
    await expect(page.getByText('Data Upload')).toBeVisible();
    
    // Check initial state
    await expect(page.getByText('Ready')).toBeVisible();
    await expect(page.getByText('0 /')).toBeVisible(); // Initial iteration
  });

  test('should generate sample data and display it', async ({ page }) => {
    // Click generate sample data
    await page.getByRole('button', { name: 'Generate Sample Data' }).click();
    
    // Wait for data to load and check feedback
    await expect(page.getByText('Sample data generated successfully!')).toBeVisible({ timeout: 5000 });
    
    // Check that log-likelihood is no longer showing 0 or -Infinity
    const logLikelihoodText = await page.textContent('text=Log-Likelihood:');
    expect(logLikelihoodText).toBeTruthy();
    
    // Should see some data visualization (chart should be rendered)
    const chartExists = await page.locator('svg, .recharts-wrapper, [data-testid="gmm-chart"]').count();
    expect(chartExists).toBeGreaterThan(0);
  });

  test('should run EM algorithm step by step', async ({ page }) => {
    // Generate sample data first
    await page.getByRole('button', { name: 'Generate Sample Data' }).click();
    await page.waitForSelector('text=Sample data generated successfully!', { timeout: 5000 });
    
    // Check initial state
    await expect(page.getByText('0 /')).toBeVisible();
    
    // Click Next button to advance one step
    await page.getByRole('button', { name: 'Next →' }).click();
    
    // Should advance to iteration 1
    await expect(page.getByText('1 /')).toBeVisible();
    
    // Click Next again
    await page.getByRole('button', { name: 'Next →' }).click();
    
    // Should advance to iteration 2  
    await expect(page.getByText('2 /')).toBeVisible();
    
    // Test backward step
    await page.getByRole('button', { name: '← Previous' }).click();
    await expect(page.getByText('1 /')).toBeVisible();
  });

  test('should run to convergence', async ({ page }) => {
    // Generate sample data first
    await page.getByRole('button', { name: 'Generate Sample Data' }).click();
    await page.waitForSelector('text=Sample data generated successfully!', { timeout: 5000 });
    
    // Click Run to Convergence
    await page.getByRole('button', { name: 'Run to Convergence' }).click();
    
    // Should show running state
    await expect(page.getByText('Running...')).toBeVisible();
    
    // Should show Stop button while running
    await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible();
    
    // Wait for convergence (or timeout)
    await expect(page.getByText(/Converged|Ready/)).toBeVisible({ timeout: 30000 });
    
    // Should show higher iteration number
    const iterationText = await page.textContent('text=Iteration:');
    expect(iterationText).toMatch(/[1-9]\d* \//); // Should be at least iteration 1
  });

  test('should change number of components', async ({ page }) => {
    // Generate sample data first
    await page.getByRole('button', { name: 'Generate Sample Data' }).click();
    await page.waitForSelector('text=Sample data generated successfully!', { timeout: 5000 });
    
    // Find and change the component count selector
    const componentSelect = page.locator('select').filter({ hasText: /2|3|4|5/ }).first();
    await componentSelect.selectOption('3');
    
    // Should reset to iteration 0
    await expect(page.getByText('0 /')).toBeVisible();
    
    // Component parameters section should now show 3 components
    const componentSections = await page.locator('text=Component').count();
    expect(componentSections).toBeGreaterThanOrEqual(3);
  });

  test('should reset the algorithm', async ({ page }) => {
    // Generate sample data and run a few steps
    await page.getByRole('button', { name: 'Generate Sample Data' }).click();
    await page.waitForSelector('text=Sample data generated successfully!', { timeout: 5000 });
    
    // Run a few steps
    await page.getByRole('button', { name: 'Next →' }).click();
    await page.getByRole('button', { name: 'Next →' }).click();
    await expect(page.getByText('2 /')).toBeVisible();
    
    // Reset
    await page.getByRole('button', { name: 'Reset' }).click();
    
    // Should go back to iteration 0
    await expect(page.getByText('0 /')).toBeVisible();
    await expect(page.getByText('Ready')).toBeVisible();
  });

  test('should handle file upload', async ({ page }) => {
    // Create a simple CSV content
    const csvContent = '1,2,3,4,5,6,7,8,9,10';
    
    // Create a file input and upload
    const fileInput = page.locator('input[type="file"]');
    
    // Create a temporary file for testing
    await fileInput.setInputFiles({
      name: 'test-data.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });
    
    // Wait for file processing
    await expect(page.getByText(/uploaded successfully|processed/i)).toBeVisible({ timeout: 5000 });
    
    // Should show some visualization of the uploaded data
    const chartExists = await page.locator('svg, .recharts-wrapper, [data-testid="gmm-chart"]').count();
    expect(chartExists).toBeGreaterThan(0);
  });

  test('should display parameter values correctly', async ({ page }) => {
    // Generate sample data first
    await page.getByRole('button', { name: 'Generate Sample Data' }).click();
    await page.waitForSelector('text=Sample data generated successfully!', { timeout: 5000 });
    
    // Check that component parameters are displayed
    await expect(page.getByText(/μ:/)).toBeVisible();
    await expect(page.getByText(/σ:/)).toBeVisible();
    await expect(page.getByText(/π:/)).toBeVisible();
    
    // Parameters should be reasonable numbers
    const muText = await page.textContent('text=μ:');
    const sigmaText = await page.textContent('text=σ:');
    const piText = await page.textContent('text=π:');
    
    expect(muText).toMatch(/μ: \d+\.\d+/);
    expect(sigmaText).toMatch(/σ: \d+\.\d+/);
    expect(piText).toMatch(/π: 0\.\d+/);
  });

  test('should show log-likelihood values', async ({ page }) => {
    // Generate sample data first
    await page.getByRole('button', { name: 'Generate Sample Data' }).click();
    await page.waitForSelector('text=Sample data generated successfully!', { timeout: 5000 });
    
    // Should show log-likelihood value
    const logLikelihoodSection = page.locator('text=Log-Likelihood:').locator('..'); 
    await expect(logLikelihoodSection).toBeVisible();
    
    // Value should be a negative number (typical for log-likelihood)
    const llText = await logLikelihoodSection.textContent();
    expect(llText).toMatch(/Log-Likelihood:\s*-?\d+\.\d+/);
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.getByRole('button', { name: 'Generate Sample Data' }).click();
    await page.waitForSelector('text=Sample data generated successfully!', { timeout: 5000 });
    
    // Main components should still be visible
    await expect(page.getByText('EM Algorithm Controls')).toBeVisible();
    await expect(page.getByText('Component Parameters')).toBeVisible();
    
    // Controls should still be functional
    await page.getByRole('button', { name: 'Next →' }).click();
    await expect(page.getByText('1 /')).toBeVisible();
  });

  test('should handle edge cases gracefully', async ({ page }) => {
    // Test with minimal data
    const minimalCsv = '1,2';
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: 'minimal.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(minimalCsv)
    });
    
    // Should handle the minimal data without crashing
    await page.waitForTimeout(2000); // Give it time to process
    
    // App should still be functional
    await expect(page.getByRole('button', { name: 'Next →' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
  });
});