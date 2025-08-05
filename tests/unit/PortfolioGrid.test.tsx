import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PortfolioGrid from '@/components/PortfolioGrid';
import { getPortfolioImages } from '@/lib/supabase';

// Mock the supabase module
jest.mock('@/lib/supabase', () => ({
  getPortfolioImages: jest.fn(),
}));

const mockGetPortfolioImages = getPortfolioImages as jest.MockedFunction<typeof getPortfolioImages>;

// Mock data
const mockImages = [
  {
    id: '1',
    title: 'Wedding Cake',
    description: 'Beautiful wedding cake for special occasions',
    image_url: 'https://example.com/wedding-cake.jpg',
    category: 'wedding' as const,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Corporate Lunch',
    description: 'Professional catering for corporate events',
    image_url: 'https://example.com/corporate-lunch.jpg',
    category: 'corporate' as const,
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'Fine Dining Experience',
    description: 'Exquisite fine dining presentation',
    image_url: 'https://example.com/fine-dining.jpg',
    category: 'fine-dining' as const,
    created_at: '2024-01-03T00:00:00Z',
  },
];

describe('PortfolioGrid Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPortfolioImages.mockResolvedValue(mockImages);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading skeleton initially', async () => {
      // Make the promise not resolve immediately
      mockGetPortfolioImages.mockImplementation(() => new Promise(() => {}));
      
      render(<PortfolioGrid />);
      
      expect(screen.getByLabelText('Loading portfolio images')).toBeInTheDocument();
      expect(screen.getAllByRole('status')).toHaveLength(1);
    });

    it('should have correct loading skeleton structure', () => {
      mockGetPortfolioImages.mockImplementation(() => new Promise(() => {}));
      
      render(<PortfolioGrid />);
      
      const skeleton = screen.getByLabelText('Loading portfolio images');
      expect(skeleton).toHaveClass('grid', 'grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4', 'xl:grid-cols-5', 'gap-4');
    });
  });

  describe('Data Fetching', () => {
    it('should fetch and display portfolio images', async () => {
      render(<PortfolioGrid />);

      await waitFor(() => {
        expect(mockGetPortfolioImages).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(screen.getByText('Wedding Cake')).toBeInTheDocument();
        expect(screen.getByText('Corporate Lunch')).toBeInTheDocument();
        expect(screen.getByText('Fine Dining Experience')).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      mockGetPortfolioImages.mockRejectedValue(new Error('API Error'));

      render(<PortfolioGrid />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('เกิดข้อผิดพลาด')).toBeInTheDocument();
        expect(screen.getByText('Failed to load images. Please try again later.')).toBeInTheDocument();
      });
    });

    it('should display retry button on error', async () => {
      mockGetPortfolioImages.mockRejectedValue(new Error('API Error'));
      
      render(<PortfolioGrid />);

      await waitFor(() => {
        const retryButton = screen.getByText('ลองใหม่');
        expect(retryButton).toBeInTheDocument();
        expect(retryButton).toHaveClass('px-4', 'py-2', 'bg-orange-600', 'text-white', 'rounded-lg');
      });
    });
  });

  describe('Category Filtering', () => {
    it('should filter images by selected category', async () => {
      render(<PortfolioGrid selectedCategory="wedding" />);

      await waitFor(() => {
        expect(screen.getByText('Wedding Cake')).toBeInTheDocument();
        expect(screen.queryByText('Corporate Lunch')).not.toBeInTheDocument();
        expect(screen.queryByText('Fine Dining Experience')).not.toBeInTheDocument();
      });
    });

    it('should display all images when no category is selected', async () => {
      render(<PortfolioGrid />);

      await waitFor(() => {
        expect(screen.getByText('Wedding Cake')).toBeInTheDocument();
        expect(screen.getByText('Corporate Lunch')).toBeInTheDocument();
        expect(screen.getByText('Fine Dining Experience')).toBeInTheDocument();
      });
    });

    it('should show empty state when filtered category has no images', async () => {
      render(<PortfolioGrid selectedCategory="buffet" />);

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('ยังไม่มีรูปภาพ')).toBeInTheDocument();
        expect(screen.getByText('รูปภาพผลงานจะแสดงที่นี่เมื่อเพิ่มเข้าในระบบ')).toBeInTheDocument();
      });
    });
  });

  describe('Image Grid Display', () => {
    it('should render images in responsive grid layout', async () => {
      render(<PortfolioGrid />);

      await waitFor(() => {
        const grid = screen.getByRole('grid');
        expect(grid).toHaveClass(
          'grid',
          'grid-cols-2',
          'md:grid-cols-3',
          'lg:grid-cols-4',
          'xl:grid-cols-5',
          'gap-4'
        );
      });
    });

    it('should display correct category labels in Thai', async () => {
      render(<PortfolioGrid />);

      await waitFor(() => {
        expect(screen.getByText('งานแต่งงาน')).toBeInTheDocument(); // wedding
        expect(screen.getByText('งานบริษัท')).toBeInTheDocument(); // corporate
        expect(screen.getByText('ไฟน์ไดนิ่ง')).toBeInTheDocument(); // fine-dining
      });
    });

    it('should render images with proper alt text', async () => {
      render(<PortfolioGrid />);

      await waitFor(() => {
        expect(screen.getByAltText('Wedding Cake')).toBeInTheDocument();
        expect(screen.getByAltText('Corporate Lunch')).toBeInTheDocument();
        expect(screen.getByAltText('Fine Dining Experience')).toBeInTheDocument();
      });
    });
  });

  describe('Image Modal Functionality', () => {
    it('should open modal when image is clicked', async () => {
      render(<PortfolioGrid />);

      await waitFor(() => {
        expect(screen.getByText('Wedding Cake')).toBeInTheDocument();
      });

      const imageButton = screen.getByLabelText('View Wedding Cake in fullscreen');
      await user.click(imageButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
      });
    });

    it('should close modal when close button is clicked', async () => {
      render(<PortfolioGrid />);

      await waitFor(() => {
        expect(screen.getByText('Wedding Cake')).toBeInTheDocument();
      });

      // Open modal
      const imageButton = screen.getByLabelText('View Wedding Cake in fullscreen');
      await user.click(imageButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByLabelText('Close modal');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should close modal when clicking backdrop', async () => {
      render(<PortfolioGrid />);

      await waitFor(() => {
        expect(screen.getByText('Wedding Cake')).toBeInTheDocument();
      });

      // Open modal
      const imageButton = screen.getByLabelText('View Wedding Cake in fullscreen');
      await user.click(imageButton);

      const modal = await screen.findByRole('dialog');
      expect(modal).toBeInTheDocument();

      // Click backdrop (the modal container itself)
      await user.click(modal);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should close modal when Escape key is pressed', async () => {
      render(<PortfolioGrid />);

      await waitFor(() => {
        expect(screen.getByText('Wedding Cake')).toBeInTheDocument();
      });

      // Open modal
      const imageButton = screen.getByLabelText('View Wedding Cake in fullscreen');
      await user.click(imageButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Press Escape
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should prevent body scroll when modal is open', async () => {
      render(<PortfolioGrid />);

      await waitFor(() => {
        expect(screen.getByText('Wedding Cake')).toBeInTheDocument();
      });

      // Initially body should not have overflow hidden
      expect(document.body.style.overflow).not.toBe('hidden');

      // Open modal
      const imageButton = screen.getByLabelText('View Wedding Cake in fullscreen');
      await user.click(imageButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(document.body.style.overflow).toBe('hidden');
      });

      // Close modal
      const closeButton = screen.getByLabelText('Close modal');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe('unset');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation for image buttons', async () => {
      render(<PortfolioGrid />);

      await waitFor(() => {
        expect(screen.getByText('Wedding Cake')).toBeInTheDocument();
      });

      const imageButton = screen.getByLabelText('View Wedding Cake in fullscreen');
      
      // Focus the button
      imageButton.focus();
      expect(imageButton).toHaveFocus();

      // Press Enter to open modal
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should support space key to activate image buttons', async () => {
      render(<PortfolioGrid />);

      await waitFor(() => {
        expect(screen.getByText('Wedding Cake')).toBeInTheDocument();
      });

      const imageButton = screen.getByLabelText('View Wedding Cake in fullscreen');
      
      // Focus the button
      imageButton.focus();
      
      // Press Space to open modal
      await user.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Image Error Handling', () => {
    it('should show placeholder when image fails to load', async () => {
      render(<PortfolioGrid />);

      await waitFor(() => {
        expect(screen.getByAltText('Wedding Cake')).toBeInTheDocument();
      });

      const image = screen.getByAltText('Wedding Cake');
      
      // Simulate image load error
      await act(async () => {
        fireEvent.error(image);
      });

      // Image should now show placeholder
      expect(image).toHaveAttribute('src', '/placeholder.svg');
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no images are available', async () => {
      mockGetPortfolioImages.mockResolvedValue([]);

      render(<PortfolioGrid />);

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('ยังไม่มีรูปภาพ')).toBeInTheDocument();
        expect(screen.getByText('รูปภาพผลงานจะแสดงที่นี่เมื่อเพิ่มเข้าในระบบ')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Optimizations', () => {
    it('should only re-render when props change', async () => {
      const { rerender } = render(<PortfolioGrid selectedCategory="wedding" />);

      await waitFor(() => {
        expect(screen.getByText('Wedding Cake')).toBeInTheDocument();
      });

      // Rerender with same props should not call API again
      rerender(<PortfolioGrid selectedCategory="wedding" />);
      
      // Should only be called once from initial render
      expect(mockGetPortfolioImages).toHaveBeenCalledTimes(1);
    });

    it('should cleanup properly on unmount', async () => {
      const { unmount } = render(<PortfolioGrid />);

      await waitFor(() => {
        expect(screen.getByText('Wedding Cake')).toBeInTheDocument();
      });

      // Open modal to test cleanup
      const imageButton = screen.getByLabelText('View Wedding Cake in fullscreen');
      await user.click(imageButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Unmount component
      unmount();

      // Body scroll should be restored
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      render(<PortfolioGrid />);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
        expect(screen.getByLabelText('Portfolio gallery')).toBeInTheDocument();
      });

      const imageButtons = screen.getAllByRole('button');
      imageButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have proper modal accessibility attributes', async () => {
      render(<PortfolioGrid />);

      await waitFor(() => {
        expect(screen.getByText('Wedding Cake')).toBeInTheDocument();
      });

      // Open modal
      const imageButton = screen.getByLabelText('View Wedding Cake in fullscreen');
      await user.click(imageButton);

      const modal = await screen.findByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
      expect(modal).toHaveAttribute('aria-describedby');
    });
  });
});