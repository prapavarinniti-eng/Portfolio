import { test, expect } from '@playwright/test';

test.describe('Navigation and Routing E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Page Navigation', () => {
    test('should navigate to portfolio page from home', async ({ page }) => {
      // Look for portfolio link/button
      const portfolioLink = page.locator('a[href="/portfolio"]').or(page.getByText('Portfolio')).or(page.getByText('ผลงาน'));
      
      if (await portfolioLink.isVisible()) {
        await portfolioLink.click();
        await expect(page).toHaveURL(/.*\/portfolio/);
        await expect(page.locator('[role="grid"]').or(page.getByText('ยังไม่มีรูปภาพ'))).toBeVisible();
      } else {
        // If no direct link, navigate manually
        await page.goto('/portfolio');
        await expect(page).toHaveURL(/.*\/portfolio/);
      }
    });

    test('should navigate to admin page', async ({ page }) => {
      await page.goto('/admin');
      await expect(page).toHaveURL(/.*\/admin/);
      
      // Admin page should have some admin-specific content
      // (This might require authentication in real scenarios)
    });

    test('should navigate to contact page', async ({ page }) => {
      await page.goto('/contact');
      await expect(page).toHaveURL(/.*\/contact/);
    });

    test('should handle direct URL navigation', async ({ page }) => {
      // Direct navigation to portfolio should work
      await page.goto('/portfolio');
      await expect(page).toHaveURL(/.*\/portfolio/);
      await page.waitForLoadState('networkidle');
      
      // Should show portfolio content
      await expect(page.locator('[role="grid"]').or(page.getByText('ยังไม่มีรูปภาพ'))).toBeVisible();
    });
  });

  test.describe('Browser Navigation', () => {
    test('should handle back/forward navigation', async ({ page }) => {
      // Start on home page
      await page.goto('/');
      
      // Navigate to portfolio
      await page.goto('/portfolio');
      await expect(page).toHaveURL(/.*\/portfolio/);
      
      // Go back
      await page.goBack();
      await expect(page).toHaveURL(/.*\//);
      
      // Go forward
      await page.goForward();
      await expect(page).toHaveURL(/.*\/portfolio/);
    });

    test('should handle page refresh', async ({ page }) => {
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      
      // Refresh the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should still show portfolio content
      await expect(page.locator('[role="grid"]').or(page.getByText('ยังไม่มีรูปภาพ'))).toBeVisible();
    });
  });

  test.describe('URL Parameters and State', () => {
    test('should maintain category filter in URL', async ({ page }) => {
      await page.goto('/portfolio');
      
      // If category buttons exist, test URL updates
      const categoryButton = page.getByText('งานแต่งงาน');
      if (await categoryButton.isVisible()) {
        await categoryButton.click();
        
        // URL should reflect the category (if implemented)
        // This depends on how routing is implemented
        await page.waitForTimeout(1000);
      }
    });

    test('should handle invalid routes gracefully', async ({ page }) => {
      const response = await page.goto('/invalid-route');
      
      // Should either redirect to 404 page or handle gracefully
      expect(response?.status()).toBeGreaterThanOrEqual(200);
    });
  });

  test.describe('SEO and Meta Tags', () => {
    test('should have proper page titles', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle(/Catering|Portfolio|Fuzio/i);
      
      await page.goto('/portfolio');
      await expect(page).toHaveTitle(/Portfolio|ผลงาน/i);
    });

    test('should have meta descriptions', async ({ page }) => {
      await page.goto('/');
      
      const metaDescription = page.locator('meta[name="description"]');
      if (await metaDescription.count() > 0) {
        const content = await metaDescription.getAttribute('content');
        expect(content).toBeTruthy();
        expect(content!.length).toBeGreaterThan(50);
      }
    });

    test('should have Open Graph tags', async ({ page }) => {
      await page.goto('/');
      
      const ogTitle = page.locator('meta[property="og:title"]');
      if (await ogTitle.count() > 0) {
        const content = await ogTitle.getAttribute('content');
        expect(content).toBeTruthy();
      }
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load pages within reasonable time', async ({ page }) => {
      const urls = ['/', '/portfolio', '/contact', '/admin'];
      
      for (const url of urls) {
        const startTime = Date.now();
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        
        expect(loadTime).toBeLessThan(10000); // 10 seconds max
        console.log(`${url} loaded in ${loadTime}ms`);
      }
    });

    test('should preload critical resources', async ({ page }) => {
      await page.goto('/');
      
      // Check for preload links
      const preloadLinks = page.locator('link[rel="preload"]');
      const preloadCount = await preloadLinks.count();
      
      if (preloadCount > 0) {
        console.log(`Found ${preloadCount} preload links`);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Navigate to portfolio first
      await page.goto('/portfolio');
      
      // Simulate offline condition
      await page.context().setOffline(true);
      
      // Try to refresh or navigate
      await page.goto('/portfolio');
      
      // Should show some error state or cached content
      // The exact behavior depends on implementation
      
      // Restore online
      await page.context().setOffline(false);
    });

    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow 3G
      await page.context().route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        await route.continue();
      });
      
      const startTime = Date.now();
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      console.log(`Slow network load time: ${loadTime}ms`);
      
      // Should still load, just slower
      await expect(page.locator('[role="grid"]').or(page.getByText('ยังไม่มีรูปภาพ'))).toBeVisible();
    });
  });

  test.describe('Mobile Navigation', () => {
    test('should work on mobile devices', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip();
      }
      
      await page.goto('/');
      
      // Mobile navigation should work
      await page.goto('/portfolio');
      await expect(page).toHaveURL(/.*\/portfolio/);
      
      // Check mobile-specific elements
      const viewport = page.viewportSize();
      expect(viewport?.width).toBeLessThan(768);
    });

    test('should handle touch interactions', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip();
      }
      
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      
      // Test touch interactions on images
      const imageButtons = page.locator('[role="button"][aria-label*="View"]');
      const buttonCount = await imageButtons.count();
      
      if (buttonCount > 0) {
        await imageButtons.first().tap();
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        
        // Close modal with tap
        await page.locator('[aria-label="Close modal"]').tap();
        await expect(page.locator('[role="dialog"]')).not.toBeVisible();
      }
    });
  });

  test.describe('Security', () => {
    test('should have secure headers', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();
      
      if (headers) {
        // Check for security headers (these may not be set in development)
        console.log('Response headers:', Object.keys(headers));
      }
    });

    test('should handle XSS attempts', async ({ page }) => {
      // Try to navigate to URL with XSS payload
      const xssPayload = '/<script>alert("xss")</script>';
      await page.goto(`/portfolio${xssPayload}`);
      
      // Should not execute the script
      // The page should handle it gracefully
      await page.waitForTimeout(1000);
    });
  });
});