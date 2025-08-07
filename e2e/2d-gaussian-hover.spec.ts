import { test, expect } from '@playwright/test';

test.describe('2D Gaussian Hover Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Switch to 2D Gaussian mode
    await page.getByText('2D Gaussian Fitting').click();
    
    // Wait for the app to fully load in 2D mode
    await page.waitForSelector('svg', { timeout: 10000 });
    
    // Generate sample data to have something to interact with
    await page.getByText('Generate Sample Data').click();
    await page.waitForTimeout(1000); // Give it time to generate data
  });

  test('should display hover panel immediately in 2D mode', async ({ page }) => {
    // The hover panel should be visible immediately when in 2D mode
    await expect(page.getByText('Query Point')).toBeVisible();
    
    // Should show placeholder messages
    await expect(page.getByText('Hover over chart to see')).toBeVisible();
  });

  test('should update hover coordinates when moving mouse over chart', async ({ page }) => {
    // Find the SVG chart element
    const chart = page.locator('svg').first();
    await expect(chart).toBeVisible();
    
    // Get the chart's bounding box for precise positioning
    const chartBox = await chart.boundingBox();
    if (!chartBox) throw new Error('Chart not found');
    
    // Move mouse to center of chart
    const centerX = chartBox.x + chartBox.width / 2;
    const centerY = chartBox.y + chartBox.height / 2;
    
    await page.mouse.move(centerX, centerY);
    await page.waitForTimeout(500);
    
    // Check that coordinates are displayed (not the placeholder)
    const queryText = await page.textContent('text=Query at');
    expect(queryText).not.toContain('hover over chart');
    expect(queryText).toMatch(/Query at \([\d.-]+, [\d.-]+\)/);
  });

  test('should show density info when hovering after fitting Gaussian', async ({ page }) => {
    // First fit a Gaussian
    await page.getByText('Fit Gaussian (MLE)').click();
    await page.waitForTimeout(2000);
    
    // Now hover over the chart
    const chart = page.locator('svg').first();
    const chartBox = await chart.boundingBox();
    if (!chartBox) throw new Error('Chart not found');
    
    const centerX = chartBox.x + chartBox.width / 2;
    const centerY = chartBox.y + chartBox.height / 2;
    
    await page.mouse.move(centerX, centerY);
    await page.waitForTimeout(500);
    
    // Should show actual density values, not placeholders
    const densityText = await page.textContent('text=Probability Density:');
    expect(densityText).not.toContain('Hover over chart');
    expect(densityText).toMatch(/Probability Density:\s*[\d.]+/);
    
    // Should show distance values
    const distanceText = await page.textContent('text=Euclidean Distance:');
    expect(distanceText).not.toContain('Hover over chart');
    expect(distanceText).toMatch(/Euclidean Distance:\s*[\d.]+/);
  });

  test('should show hover indicator (red dot) when moving mouse', async ({ page }) => {
    const chart = page.locator('svg').first();
    const chartBox = await chart.boundingBox();
    if (!chartBox) throw new Error('Chart not found');
    
    // Move to different positions and verify red dot appears
    const positions = [
      { x: chartBox.x + chartBox.width * 0.25, y: chartBox.y + chartBox.height * 0.25 },
      { x: chartBox.x + chartBox.width * 0.75, y: chartBox.y + chartBox.height * 0.75 },
      { x: chartBox.x + chartBox.width * 0.5, y: chartBox.y + chartBox.height * 0.5 }
    ];
    
    for (const pos of positions) {
      await page.mouse.move(pos.x, pos.y);
      await page.waitForTimeout(200);
      
      // Check for red hover indicator circle
      const redCircle = page.locator('svg circle[fill="red"]');
      await expect(redCircle).toBeVisible();
    }
  });

  test('should clear hover info when mouse leaves chart', async ({ page }) => {
    const chart = page.locator('svg').first();
    
    // First hover over chart
    await chart.hover();
    await page.waitForTimeout(500);
    
    // Verify hover info is showing
    const queryText1 = await page.textContent('text=Query at');
    expect(queryText1).toMatch(/Query at \([\d.-]+, [\d.-]+\)/);
    
    // Move mouse away from chart
    await page.mouse.move(0, 0);
    await page.waitForTimeout(500);
    
    // Should show placeholder again
    await expect(page.getByText('Query Point (hover over chart')).toBeVisible();
  });

  test('should work in different viewport sizes', async ({ page }) => {
    // Test desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    const chart = page.locator('svg').first();
    await chart.hover();
    await page.waitForTimeout(500);
    
    let queryText = await page.textContent('text=Query at');
    expect(queryText).toMatch(/Query at \([\d.-]+, [\d.-]+\)/);
    
    // Test tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    await chart.hover();
    await page.waitForTimeout(500);
    
    queryText = await page.textContent('text=Query at');
    expect(queryText).toMatch(/Query at \([\d.-]+, [\d.-]+\)/);
  });

  test('should handle rapid mouse movements without errors', async ({ page }) => {
    const chart = page.locator('svg').first();
    const chartBox = await chart.boundingBox();
    if (!chartBox) throw new Error('Chart not found');
    
    // Rapidly move mouse around the chart
    for (let i = 0; i < 10; i++) {
      const x = chartBox.x + Math.random() * chartBox.width;
      const y = chartBox.y + Math.random() * chartBox.height;
      await page.mouse.move(x, y);
      await page.waitForTimeout(50);
    }
    
    // App should still be functional
    await expect(page.getByText('Query at')).toBeVisible();
    
    // No error messages should appear
    const errorMessages = page.locator('.bg-red-100, .bg-red-900, text=Error');
    await expect(errorMessages).not.toBeVisible();
  });

  test('should maintain hover functionality when switching back from other modes', async ({ page }) => {
    // Switch to K-means
    await page.getByText('K-Means Clustering').click();
    await page.waitForTimeout(1000);
    
    // Switch back to 2D Gaussian
    await page.getByText('2D Gaussian Fitting').click();
    await page.waitForTimeout(1000);
    
    // Hover functionality should still work
    const chart = page.locator('svg').first();
    await chart.hover();
    await page.waitForTimeout(500);
    
    const queryText = await page.textContent('text=Query at');
    expect(queryText).toMatch(/Query at \([\d.-]+, [\d.-]+\)/);
    
    // Panel should be visible
    await expect(page.getByText('Probability Density:')).toBeVisible();
  });

  test('should work with custom uploaded 2D data', async ({ page }) => {
    // Create custom 2D data
    const csvContent = 'x,y\n0,0\n1,1\n2,2\n-1,-1\n0.5,0.5';
    
    // Upload the data
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-2d-data.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });
    
    await page.waitForTimeout(2000);
    
    // Hover should still work with custom data
    const chart = page.locator('svg').first();
    await chart.hover();
    await page.waitForTimeout(500);
    
    const queryText = await page.textContent('text=Query at');
    expect(queryText).toMatch(/Query at \([\d.-]+, [\d.-]+\)/);
  });
});