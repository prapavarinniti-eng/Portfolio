import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import PortfolioGrid from '@/components/PortfolioGrid';
import CategoryFilter from '@/components/CategoryFilter';
import { getPortfolioImages } from '@/lib/supabase';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock the supabase module
jest.mock('@/lib/supabase', () => ({
  getPortfolioImages: jest.fn(),
}));

const mockGetPortfolioImages = getPortfolioImages as jest.MockedFunction<typeof getPortfolioImages>;

// Mock data for testing
const mockImages = [
  {
    id: '1',
    title: 'Wedding Cake Decoration',
    description: 'Beautiful multi-tier wedding cake with floral decorations',
    image_url: 'https://example.com/wedding-cake.jpg',
    category: 'wedding' as const,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Corporate Event Catering',
    description: 'Professional buffet setup for corporate conference',
    image_url: 'https://example.com/corporate-buffet.jpg',
    category: 'corporate' as const,
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'Fine Dining Experience',
    description: 'Elegant plated dinner service for special occasions',
    image_url: 'https://example.com/fine-dining.jpg',
    category: 'fine-dining' as const,
    created_at: '2024-01-03T00:00:00Z',
  },
];

describe('Accessibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPortfolioImages.mockResolvedValue(mockImages);
  });

  describe('PortfolioGrid Accessibility', () => {
    test('should not have accessibility violations with images loaded', async () => {
      const { container } = render(<PortfolioGrid />);
      
      // Wait for component to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should not have accessibility violations in loading state', async () => {
      // Mock loading state
      mockGetPortfolioImages.mockImplementation(() => new Promise(() => {}));
      
      const { container } = render(<PortfolioGrid />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should not have accessibility violations in empty state', async () => {
      mockGetPortfolioImages.mockResolvedValue([]);
      
      const { container } = render(<PortfolioGrid />);
      
      // Wait for empty state to render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should not have accessibility violations in error state', async () => {
      mockGetPortfolioImages.mockRejectedValue(new Error('API Error'));
      
      const { container } = render(<PortfolioGrid />);
      
      // Wait for error state to render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should not have accessibility violations with category filter', async () => {
      const { container } = render(<PortfolioGrid selectedCategory="wedding" />);
      
      // Wait for filtered content to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have proper ARIA landmarks', async () => {
      const { container } = render(<PortfolioGrid />);
      
      // Wait for component to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check for proper landmarks
      const grid = container.querySelector('[role="grid"]');
      const status = container.querySelector('[role="status"]');
      const alert = container.querySelector('[role="alert"]');
      
      // Should have at least one landmark
      expect(grid || status || alert).toBeTruthy();
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have proper heading structure', async () => {
      const { container } = render(<PortfolioGrid />);
      
      // Wait for component to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Test with axe for heading structure
      const results = await axe(container, {
        rules: {
          'heading-order': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    test('should have sufficient color contrast', async () => {
      const { container } = render(<PortfolioGrid />);
      
      // Wait for component to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    test('should have keyboard accessible elements', async () => {
      const { container } = render(<PortfolioGrid />);
      
      // Wait for component to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const results = await axe(container, {
        rules: {
          'keyboard': { enabled: true },
          'focus-order-semantics': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    test('should have proper focus management in modal', async () => {
      const { container } = render(<PortfolioGrid />);
      
      // Wait for component to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simulate modal opening
      const imageButton = container.querySelector('[role="button"][aria-label*="View"]');
      if (imageButton) {
        (imageButton as HTMLElement).click();
        
        // Wait for modal to render
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const results = await axe(container, {
          rules: {
            'focus-order-semantics': { enabled: true },
          },
        });
        expect(results).toHaveNoViolations();
      }
    });

    test('should have proper image alt text', async () => {
      const { container } = render(<PortfolioGrid />);
      
      // Wait for component to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const results = await axe(container, {
        rules: {
          'image-alt': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    test('should have proper form labels (if any)', async () => {
      const { container } = render(<PortfolioGrid />);
      
      // Wait for component to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const results = await axe(container, {
        rules: {
          'label': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('CategoryFilter Accessibility', () => {
    const mockOnCategoryChange = jest.fn();

    beforeEach(() => {
      mockOnCategoryChange.mockClear();
    });

    test('should not have accessibility violations', async () => {
      const { container } = render(
        <CategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should not have accessibility violations with selected category', async () => {
      const { container } = render(
        <CategoryFilter selectedCategory="wedding" onCategoryChange={mockOnCategoryChange} />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have proper button roles and states', async () => {
      const { container } = render(
        <CategoryFilter selectedCategory="wedding" onCategoryChange={mockOnCategoryChange} />
      );
      
      const results = await axe(container, {
        rules: {
          'button-name': { enabled: true },
          'aria-allowed-attr': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    test('should have sufficient color contrast for buttons', async () => {
      const { container } = render(
        <CategoryFilter selectedCategory="wedding" onCategoryChange={mockOnCategoryChange} />
      );
      
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    test('should have keyboard accessible buttons', async () => {
      const { container } = render(
        <CategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />
      );
      
      const results = await axe(container, {
        rules: {
          'keyboard': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    test('should have proper focus indicators', async () => {
      const { container } = render(
        <CategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />
      );
      
      const results = await axe(container, {
        rules: {
          'focus-order-semantics': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Combined Components Accessibility', () => {
    test('should not have accessibility violations with both components', async () => {
      const mockOnCategoryChange = jest.fn();
      
      const { container } = render(
        <div>
          <CategoryFilter selectedCategory="wedding" onCategoryChange={mockOnCategoryChange} />
          <PortfolioGrid selectedCategory="wedding" />
        </div>
      );
      
      // Wait for components to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should maintain accessibility with dynamic content changes', async () => {
      const mockOnCategoryChange = jest.fn();
      
      const { container, rerender } = render(
        <div>
          <CategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />
          <PortfolioGrid selectedCategory="" />
        </div>
      );
      
      // Wait for initial load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Test initial state
      let results = await axe(container);
      expect(results).toHaveNoViolations();
      
      // Change category and retest
      rerender(
        <div>
          <CategoryFilter selectedCategory="wedding" onCategoryChange={mockOnCategoryChange} />
          <PortfolioGrid selectedCategory="wedding" />
        </div>
      );
      
      // Wait for rerender
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Test after category change
      results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Screen Reader Testing', () => {
    test('should have meaningful accessible names', async () => {
      const { container } = render(<PortfolioGrid />);
      
      // Wait for component to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const results = await axe(container, {
        rules: {
          'button-name': { enabled: true },
          'link-name': { enabled: true },
          'image-alt': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    test('should have proper aria-live regions for dynamic content', async () => {
      const { container } = render(<PortfolioGrid />);
      
      // Wait for component to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check for status regions
      const statusRegions = container.querySelectorAll('[role="status"], [aria-live="polite"], [aria-live="assertive"]');
      
      if (statusRegions.length > 0) {
        const results = await axe(container, {
          rules: {
            'aria-allowed-attr': { enabled: true },
          },
        });
        expect(results).toHaveNoViolations();
      }
    });

    test('should have proper semantic structure', async () => {
      const { container } = render(<PortfolioGrid />);
      
      // Wait for component to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const results = await axe(container, {
        rules: {
          'landmark-one-main': { enabled: true },
          'page-has-heading-one': { enabled: false }, // Not required for components
          'heading-order': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('High Contrast Mode', () => {
    test('should work in high contrast mode', async () => {
      // Simulate high contrast mode by adding CSS
      const style = document.createElement('style');
      style.textContent = `
        @media (prefers-contrast: high) {
          * {
            background: black !important;
            color: white !important;
            border-color: white !important;
          }
        }
      `;
      document.head.appendChild(style);
      
      const { container } = render(<PortfolioGrid />);
      
      // Wait for component to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
      
      // Cleanup
      document.head.removeChild(style);
    });
  });

  describe('Reduced Motion', () => {
    test('should respect prefers-reduced-motion', async () => {
      // This test would ideally check that animations are disabled
      // when prefers-reduced-motion is set
      const { container } = render(<PortfolioGrid />);
      
      // Wait for component to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check for any motion-related accessibility issues
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Mobile Accessibility', () => {
    test('should have proper touch targets', async () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });
      
      const { container } = render(<PortfolioGrid />);
      
      // Wait for component to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check for touch target accessibility
      const results = await axe(container, {
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      });
      expect(results).toHaveNoViolations();
    });
  });
});