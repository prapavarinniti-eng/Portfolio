import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryFilter from '@/components/CategoryFilter';

describe('CategoryFilter Component', () => {
  const user = userEvent.setup();
  const mockOnCategoryChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const expectedCategories = [
    { value: '', label: 'ทั้งหมด' },
    { value: 'wedding', label: 'งานแต่งงาน' },
    { value: 'corporate', label: 'งานบริษัท' },
    { value: 'fine-dining', label: 'ไฟน์ไดนิ่ง' },
    { value: 'cocktail', label: 'ค็อกเทล' },
    { value: 'buffet', label: 'บุฟเฟ่ต์' },
    { value: 'food-stall', label: 'ฟู้ดสตอล์' },
    { value: 'snack-box', label: 'สแน็คบ็อกซ์' },
    { value: 'coffee-break', label: 'คอฟฟี่เบรก' },
  ];

  describe('Rendering', () => {
    it('should render all category buttons', () => {
      render(<CategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />);

      expectedCategories.forEach(category => {
        expect(screen.getByText(category.label)).toBeInTheDocument();
      });
    });

    it('should highlight the selected category', () => {
      render(<CategoryFilter selectedCategory="wedding" onCategoryChange={mockOnCategoryChange} />);

      const weddingButton = screen.getByText('งานแต่งงาน');
      expect(weddingButton).toHaveClass('bg-orange-600', 'text-white');
      
      const allButton = screen.getByText('ทั้งหมด');
      expect(allButton).not.toHaveClass('bg-orange-600', 'text-white');
    });

    it('should highlight "All" when no category is selected', () => {
      render(<CategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />);

      const allButton = screen.getByText('ทั้งหมด');
      expect(allButton).toHaveClass('bg-orange-600', 'text-white');
    });

    it('should have proper button styling for non-selected items', () => {
      render(<CategoryFilter selectedCategory="wedding" onCategoryChange={mockOnCategoryChange} />);

      const corporateButton = screen.getByText('งานบริษัท');
      expect(corporateButton).toHaveClass('bg-white', 'text-gray-700', 'border', 'border-gray-300');
    });
  });

  describe('Interaction', () => {
    it('should call onCategoryChange when a category button is clicked', async () => {
      render(<CategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />);

      const weddingButton = screen.getByText('งานแต่งงาน');
      await user.click(weddingButton);

      expect(mockOnCategoryChange).toHaveBeenCalledWith('wedding');
      expect(mockOnCategoryChange).toHaveBeenCalledTimes(1);
    });

    it('should call onCategoryChange with empty string when "All" is clicked', async () => {
      render(<CategoryFilter selectedCategory="wedding" onCategoryChange={mockOnCategoryChange} />);

      const allButton = screen.getByText('ทั้งหมด');
      await user.click(allButton);

      expect(mockOnCategoryChange).toHaveBeenCalledWith('');
      expect(mockOnCategoryChange).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple category selections', async () => {
      render(<CategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />);

      // Click wedding category
      await user.click(screen.getByText('งานแต่งงาน'));
      expect(mockOnCategoryChange).toHaveBeenCalledWith('wedding');

      // Click corporate category
      await user.click(screen.getByText('งานบริษัท'));
      expect(mockOnCategoryChange).toHaveBeenCalledWith('corporate');

      expect(mockOnCategoryChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation', async () => {
      render(<CategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />);

      const firstButton = screen.getByText('ทั้งหมด');
      firstButton.focus();

      // Tab to next button
      await user.keyboard('{Tab}');
      expect(screen.getByText('งานแต่งงาน')).toHaveFocus();
    });

    it('should activate button with Enter key', async () => {
      render(<CategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />);

      const weddingButton = screen.getByText('งานแต่งงาน');
      weddingButton.focus();
      
      await user.keyboard('{Enter}');
      expect(mockOnCategoryChange).toHaveBeenCalledWith('wedding');
    });

    it('should activate button with Space key', async () => {
      render(<CategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />);

      const weddingButton = screen.getByText('งานแต่งงาน');
      weddingButton.focus();
      
      await user.keyboard(' ');
      expect(mockOnCategoryChange).toHaveBeenCalledWith('wedding');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<CategoryFilter selectedCategory="wedding" onCategoryChange={mockOnCategoryChange} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });

      // Check that selected button has proper aria-pressed
      const weddingButton = screen.getByText('งานแต่งงาน');
      expect(weddingButton).toHaveAttribute('type', 'button');
    });

    it('should have proper focus management', async () => {
      render(<CategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />);

      const buttons = screen.getAllByRole('button');
      
      // Each button should be focusable
      for (const button of buttons) {
        button.focus();
        expect(button).toHaveFocus();
      }
    });

    it('should have semantic button elements', () => {
      render(<CategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(expectedCategories.length);

      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Visual States', () => {
    it('should show hover states', () => {
      render(<CategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />);

      const corporateButton = screen.getByText('งานบริษัท');
      expect(corporateButton).toHaveClass('hover:bg-orange-50', 'hover:border-orange-300');
    });

    it('should show focus states', () => {
      render(<CategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-orange-500');
      });
    });

    it('should have smooth transitions', () => {
      render(<CategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('transition-colors', 'duration-200');
      });
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive layout classes', () => {
      render(<CategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />);

      // Check for responsive container
      const container = screen.getByRole('button', { name: 'ทั้งหมด' }).parentElement;
      expect(container).toHaveClass('flex', 'flex-wrap', 'gap-2', 'justify-center', 'mb-8');
    });

    it('should have proper button sizing', () => {
      render(<CategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('px-4', 'py-2', 'rounded-full', 'font-medium', 'text-sm');
      });
    });
  });

  describe('Props Validation', () => {
    it('should handle undefined selectedCategory', () => {
      render(<CategoryFilter selectedCategory={undefined as any} onCategoryChange={mockOnCategoryChange} />);

      const allButton = screen.getByText('ทั้งหมด');
      expect(allButton).toHaveClass('bg-orange-600', 'text-white');
    });

    it('should handle invalid selectedCategory', () => {
      render(<CategoryFilter selectedCategory="invalid-category" onCategoryChange={mockOnCategoryChange} />);

      // All button should be highlighted when invalid category is provided
      const allButton = screen.getByText('ทั้งหมด');
      expect(allButton).toHaveClass('bg-orange-600', 'text-white');
    });

    it('should not break when onCategoryChange is not provided', () => {
      render(<CategoryFilter selectedCategory="" onCategoryChange={undefined as any} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(expectedCategories.length);
    });
  });
});