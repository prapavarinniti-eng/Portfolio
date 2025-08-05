import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport and disable animations for stable screenshots
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
  });

  test.describe('Portfolio Page Visual Tests', () => {
    test('portfolio page with images loaded', async ({ page }) => {
      await page.goto('/portfolio');
      
      // Wait for content to load
      await page.waitForLoadState('networkidle');
      
      // Wait for either images to load or empty state to show
      await page.waitForFunction(() => {
        const grid = document.querySelector('[role="grid"]');
        const emptyState = document.querySelector('[role="status"]');
        const loading = document.querySelector('[aria-label="Loading portfolio images"]');
        return (grid && grid.children.length > 0) || (emptyState && !loading);
      }, { timeout: 10000 });
      
      // Take screenshot of the full page
      await expect(page).toHaveScreenshot('portfolio-page-desktop.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('portfolio page empty state', async ({ page }) => {
      // Mock empty response
      await page.route('**/rest/v1/portfolio_images*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      });

      await page.goto('/portfolio');
      
      // Wait for empty state
      await page.waitForSelector('[role="status"]', { timeout: 10000 });
      await expect(page.getByText('ยังไม่มีรูปภาพ')).toBeVisible();
      
      await expect(page).toHaveScreenshot('portfolio-empty-state.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('portfolio page loading state', async ({ page }) => {
      // Intercept and delay the API call
      await page.route('**/rest/v1/portfolio_images*', async route => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        await route.continue();
      });

      await page.goto('/portfolio');
      
      // Capture loading state quickly
      await page.waitForSelector('[aria-label="Loading portfolio images"]', { timeout: 5000 });
      
      await expect(page).toHaveScreenshot('portfolio-loading-state.png', {
        animations: 'disabled'
      });
    });

    test('portfolio page error state', async ({ page }) => {
      // Mock error response
      await page.route('**/rest/v1/portfolio_images*', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });

      await page.goto('/portfolio');
      
      // Wait for error state
      await page.waitForSelector('[role="alert"]', { timeout: 10000 });
      await expect(page.getByText('เกิดข้อผิดพลาด')).toBeVisible();
      
      await expect(page).toHaveScreenshot('portfolio-error-state.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('portfolio grid with category filters', async ({ page }) => {
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      
      // Wait for content to load
      await page.waitForTimeout(2000);
      
      // Check if category filters exist
      const categoryButton = page.getByText('งานแต่งงาน');
      if (await categoryButton.isVisible()) {
        await categoryButton.click();
        await page.waitForTimeout(1000);
        
        await expect(page).toHaveScreenshot('portfolio-filtered-wedding.png', {
          fullPage: true,
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Modal Visual Tests', () => {
    test('image modal opened', async ({ page }) => {
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Check if there are images to click
      const imageButtons = page.locator('[role="button"][aria-label*="View"]');
      const buttonCount = await imageButtons.count();
      
      if (buttonCount > 0) {
        await imageButtons.first().click();
        
        // Wait for modal to open
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
        
        await expect(page).toHaveScreenshot('portfolio-modal-open.png', {
          animations: 'disabled'
        });
      } else {
        test.skip('No images available to test modal');
      }
    });

    test('modal with image error', async ({ page }) => {
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const imageButtons = page.locator('[role="button"][aria-label*="View"]');
      const buttonCount = await imageButtons.count();
      
      if (buttonCount > 0) {
        // Mock image error in modal
        await page.route('**/*.jpg', async route => {
          await route.fulfill({
            status: 404,
            contentType: 'text/plain',
            body: 'Not Found'
          });
        });
        
        await imageButtons.first().click();
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
        
        // Wait for placeholder to load
        await page.waitForTimeout(1000);
        
        await expect(page).toHaveScreenshot('portfolio-modal-image-error.png', {
          animations: 'disabled'
        });
      } else {
        test.skip('No images available to test modal error');
      }
    });
  });

  test.describe('Responsive Visual Tests', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      test(`portfolio page on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/portfolio');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        await expect(page).toHaveScreenshot(`portfolio-${viewport.name}.png`, {
          fullPage: true,
          animations: 'disabled'
        });
      });
    }
  });

  test.describe('Category Filter Visual Tests', () => {
    test('category filters display', async ({ page }) => {
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Focus on category filter area
      const filterContainer = page.locator('button').filter({ hasText: /ทั้งหมด|งานแต่งงาน/ }).first().locator('..');
      if (await filterContainer.isVisible()) {
        await expect(filterContainer).toHaveScreenshot('category-filters.png', {
          animations: 'disabled'
        });
      }
    });

    test('category filter active state', async ({ page }) => {
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      const weddingButton = page.getByText('งานแต่งงาน');
      if (await weddingButton.isVisible()) {
        await weddingButton.click();
        await page.waitForTimeout(500);
        
        const filterContainer = weddingButton.locator('..');
        await expect(filterContainer).toHaveScreenshot('category-filters-active.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Cross-browser Visual Tests', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`portfolio page in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
        // Only run this test on the specific browser
        if (currentBrowser !== browserName) {
          test.skip();
        }
        
        await page.goto('/portfolio');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        await expect(page).toHaveScreenshot(`portfolio-${browserName}.png`, {
          fullPage: true,
          animations: 'disabled'
        });
      });
    });
  });

  test.describe('Theme and Color Visual Tests', () => {
    test('high contrast mode simulation', async ({ page }) => {
      // Simulate high contrast mode
      await page.addStyleTag({
        content: `
          @media (prefers-contrast: high) {
            * {
              background: black !important;
              color: white !important;
              border-color: white !important;
            }
          }
        `
      });
      
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('portfolio-high-contrast.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('dark mode simulation', async ({ page }) => {
      // Simulate dark mode preference
      await page.emulateMedia({ colorScheme: 'dark' });
      
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('portfolio-dark-mode.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Print Layout Visual Tests', () => {
    test('portfolio page print layout', async ({ page }) => {
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Emulate print media
      await page.emulateMedia({ media: 'print' });
      
      await expect(page).toHaveScreenshot('portfolio-print-layout.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Focus State Visual Tests', () => {
    test('focused elements display', async ({ page }) => {
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Focus on category filter
      const firstButton = page.getByText('ทั้งหมด');
      if (await firstButton.isVisible()) {
        await firstButton.focus();
        
        await expect(page).toHaveScreenshot('portfolio-focus-category.png', {
          animations: 'disabled'
        });
      }
      
      // Focus on image if available
      const imageButton = page.locator('[role="button"][aria-label*="View"]').first();
      if (await imageButton.isVisible()) {
        await imageButton.focus();
        
        await expect(page).toHaveScreenshot('portfolio-focus-image.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Loading Animation Visual Tests', () => {
    test('skeleton loading animation', async ({ page }) => {
      // Intercept API to delay response
      let resolveRequest: (value: any) => void;
      const requestPromise = new Promise(resolve => {
        resolveRequest = resolve;
      });
      
      await page.route('**/rest/v1/portfolio_images*', async route => {
        await requestPromise;
        await route.continue();
      });
      
      await page.goto('/portfolio');
      
      // Capture loading skeleton
      await page.waitForSelector('[aria-label="Loading portfolio images"]', { timeout: 5000 });
      
      await expect(page).toHaveScreenshot('portfolio-skeleton-loading.png', {
        animations: 'disabled'
      });
      
      // Resolve the request to continue
      resolveRequest!(true);
    });
  });

  test.describe('Error Handling Visual Tests', () => {
    test('network error state', async ({ page }) => {
      // Go offline
      await page.context().setOffline(true);
      
      await page.goto('/portfolio');
      
      // Wait for error or timeout
      try {
        await page.waitForSelector('[role="alert"]', { timeout: 10000 });
      } catch {
        // Page might show different error handling
      }
      
      await expect(page).toHaveScreenshot('portfolio-network-error.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Restore online state
      await page.context().setOffline(false);
    });
  });
});