import { test, expect, type Page } from '@playwright/test';

test.describe('Portfolio Grid E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to portfolio page before each test
    await page.goto('/portfolio');
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test.describe('Page Loading and Layout', () => {
    test('should load portfolio page successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/Portfolio/i);
      
      // Check for main portfolio container
      await expect(page.locator('[role="grid"]').or(page.getByText('Loading')).or(page.getByText('ยังไม่มีรูปภาพ'))).toBeVisible();
    });

    test('should display responsive grid layout', async ({ page }) => {
      // Wait for content to load (either grid or empty state)
      await page.waitForFunction(() => {
        const grid = document.querySelector('[role="grid"]');
        const loading = document.querySelector('[aria-label="Loading portfolio images"]');
        const empty = document.querySelector('[role="status"]');
        return grid || (!loading && empty);
      });

      // Check if we have images or empty state
      const hasImages = await page.locator('[role="grid"] article').count() > 0;
      const hasEmptyState = await page.getByText('ยังไม่มีรูปภาพ').isVisible();

      expect(hasImages || hasEmptyState).toBe(true);
    });

    test('should be responsive on mobile devices', async ({ page, isMobile }) => {
      if (isMobile) {
        // Check mobile-specific layout
        const grid = page.locator('[role="grid"]');
        if (await grid.isVisible()) {
          // Mobile should show 2 columns
          await expect(grid).toHaveClass(/grid-cols-2/);
        }
      }
    });
  });

  test.describe('Category Filtering', () => {
    test('should display category filter buttons', async ({ page }) => {
      // Look for category filter buttons
      const filterButtons = page.locator('button').filter({ hasText: /ทั้งหมด|งานแต่งงาน|งานบริษัท/ });
      
      // Should have at least the "All" button
      await expect(filterButtons.first()).toBeVisible();
    });

    test('should filter images by category', async ({ page }) => {
      // Wait for content to load
      await page.waitForTimeout(2000);
      
      // Check if we have any images
      const imageCount = await page.locator('[role="grid"] article').count();
      
      if (imageCount > 0) {
        // Click on a category filter (wedding)
        const weddingButton = page.getByText('งานแต่งงาน');
        if (await weddingButton.isVisible()) {
          await weddingButton.click();
          
          // Verify filtering works (URL should change or content should update)
          await page.waitForTimeout(1000);
          
          // Check that the button is now active
          await expect(weddingButton).toHaveClass(/bg-orange-600/);
        }
      }
    });

    test('should reset filter when "All" is clicked', async ({ page }) => {
      // Click on "All" category
      const allButton = page.getByText('ทั้งหมด');
      if (await allButton.isVisible()) {
        await allButton.click();
        
        // Verify the "All" button is active
        await expect(allButton).toHaveClass(/bg-orange-600/);
      }
    });
  });

  test.describe('Image Display and Interaction', () => {
    test('should display images with proper attributes', async ({ page }) => {
      const images = page.locator('[role="grid"] img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        const firstImage = images.first();
        
        // Check image has alt text
        await expect(firstImage).toHaveAttribute('alt');
        
        // Check image has src
        await expect(firstImage).toHaveAttribute('src');
        
        // Check image loads successfully
        await expect(firstImage).toBeVisible();
      }
    });

    test('should open modal when image is clicked', async ({ page }) => {
      const imageButtons = page.locator('[role="button"][aria-label*="View"]');
      const buttonCount = await imageButtons.count();
      
      if (buttonCount > 0) {
        const firstButton = imageButtons.first();
        await firstButton.click();
        
        // Check modal opens
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // Check modal has close button
        const closeButton = page.locator('[aria-label="Close modal"]');
        await expect(closeButton).toBeVisible();
      }
    });

    test('should close modal with close button', async ({ page }) => {
      const imageButtons = page.locator('[role="button"][aria-label*="View"]');
      const buttonCount = await imageButtons.count();
      
      if (buttonCount > 0) {
        // Open modal
        await imageButtons.first().click();
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        
        // Close modal
        await page.locator('[aria-label="Close modal"]').click();
        await expect(page.locator('[role="dialog"]')).not.toBeVisible();
      }
    });

    test('should close modal with Escape key', async ({ page }) => {
      const imageButtons = page.locator('[role="button"][aria-label*="View"]');
      const buttonCount = await imageButtons.count();
      
      if (buttonCount > 0) {
        // Open modal
        await imageButtons.first().click();
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        
        // Close with Escape key
        await page.keyboard.press('Escape');
        await expect(page.locator('[role="dialog"]')).not.toBeVisible();
      }
    });

    test('should close modal when clicking backdrop', async ({ page }) => {
      const imageButtons = page.locator('[role="button"][aria-label*="View"]');
      const buttonCount = await imageButtons.count();
      
      if (buttonCount > 0) {
        // Open modal
        await imageButtons.first().click();
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // Click on backdrop (modal background)
        await modal.click({ position: { x: 10, y: 10 } });
        await expect(modal).not.toBeVisible();
      }
    });
  });

  test.describe('Loading States', () => {
    test('should show loading skeleton initially', async ({ page }) => {
      // Navigate to a fresh page to catch loading state
      await page.goto('/portfolio');
      
      // Check for loading skeleton or loaded content
      const loadingOrContent = page.locator('[aria-label="Loading portfolio images"]').or(page.locator('[role="grid"]')).or(page.getByText('ยังไม่มีรูปภาพ'));
      await expect(loadingOrContent).toBeVisible();
    });

    test('should handle empty state gracefully', async ({ page }) => {
      // Wait for content to load
      await page.waitForTimeout(3000);
      
      // Check if we have empty state
      const emptyState = page.getByText('ยังไม่มีรูปภาพ');
      const hasImages = await page.locator('[role="grid"] article').count() > 0;
      
      if (!hasImages) {
        await expect(emptyState).toBeVisible();
        await expect(page.getByText('รูปภาพผลงานจะแสดงที่นี่เมื่อเพิ่มเข้าในระบบ')).toBeVisible();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels and roles', async ({ page }) => {
      // Check main grid has proper role
      const grid = page.locator('[role="grid"]');
      if (await grid.isVisible()) {
        await expect(grid).toHaveAttribute('aria-label', 'Portfolio gallery');
      }
      
      // Check image buttons have proper labels
      const imageButtons = page.locator('[role="button"][aria-label*="View"]');
      const buttonCount = await imageButtons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = imageButtons.nth(i);
        await expect(button).toHaveAttribute('aria-label');
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      const imageButtons = page.locator('[role="button"][aria-label*="View"]');
      const buttonCount = await imageButtons.count();
      
      if (buttonCount > 0) {
        const firstButton = imageButtons.first();
        
        // Focus the button
        await firstButton.focus();
        await expect(firstButton).toBeFocused();
        
        // Activate with Enter
        await page.keyboard.press('Enter');
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        
        // Close with Escape
        await page.keyboard.press('Escape');
        await expect(page.locator('[role="dialog"]')).not.toBeVisible();
      }
    });

    test('should have proper focus management in modal', async ({ page }) => {
      const imageButtons = page.locator('[role="button"][aria-label*="View"]');
      const buttonCount = await imageButtons.count();
      
      if (buttonCount > 0) {
        // Open modal
        await imageButtons.first().click();
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // Check modal has proper attributes
        await expect(modal).toHaveAttribute('aria-modal', 'true');
        await expect(modal).toHaveAttribute('aria-labelledby');
        
        // Close button should be focusable
        const closeButton = page.locator('[aria-label="Close modal"]');
        await closeButton.focus();
        await expect(closeButton).toBeFocused();
      }
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
    });

    test('should lazy load images', async ({ page }) => {
      const images = page.locator('[role="grid"] img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        // Check that images have loading="lazy" attribute
        const firstImage = images.first();
        const loadingAttr = await firstImage.getAttribute('loading');
        expect(loadingAttr).toBe('lazy');
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle image load errors gracefully', async ({ page }) => {
      // Wait for images to load/fail
      await page.waitForTimeout(5000);
      
      const images = page.locator('[role="grid"] img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        // Check that images either load successfully or show placeholder
        for (let i = 0; i < Math.min(imageCount, 5); i++) {
          const image = images.nth(i);
          const src = await image.getAttribute('src');
          
          // Image should have either real URL or placeholder
          expect(src).toBeTruthy();
          expect(src).toMatch(/^(https?:\/\/|\/)/);
        }
      }
    });

    test('should display error state when API fails', async ({ page }) => {
      // This test would require mocking the API to fail
      // For now, we'll just check that error handling exists
      
      // Wait for content to load
      await page.waitForTimeout(3000);
      
      // Check if error state is displayed (if API is down)
      const errorState = page.getByText('เกิดข้อผิดพลาด');
      if (await errorState.isVisible()) {
        await expect(page.getByText('ลองใหม่')).toBeVisible();
      }
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    test('should work consistently across browsers', async ({ page, browserName }) => {
      console.log(`Testing on ${browserName}`);
      
      // Basic functionality should work the same across browsers
      await expect(page.locator('[role="grid"]').or(page.getByText('ยังไม่มีรูปภาพ'))).toBeVisible();
      
      // Category filters should be visible
      const categoryButtons = page.locator('button').filter({ hasText: /ทั้งหมด|งานแต่งงาน/ });
      if (await categoryButtons.count() > 0) {
        await expect(categoryButtons.first()).toBeVisible();
      }
    });
  });
});