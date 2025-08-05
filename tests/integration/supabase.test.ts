import { getPortfolioImages, validateImageUrl, clearPortfolioCache } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js');
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('Supabase Integration Tests', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    clearPortfolioCache();

    // Mock Supabase client
    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      storage: {
        from: jest.fn().mockReturnThis(),
        getPublicUrl: jest.fn(),
      },
    };

    mockCreateClient.mockReturnValue(mockSupabaseClient);
  });

  describe('getPortfolioImages', () => {
    const mockData = [
      {
        id: '1',
        title: 'Test Image 1',
        description: 'Test description 1',
        image_url: 'https://example.com/image1.jpg',
        category: 'wedding',
        created_at: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        title: 'Test Image 2',
        description: 'Test description 2',
        image_url: 'https://example.com/image2.jpg',
        category: 'corporate',
        created_at: '2024-01-02T00:00:00Z',
      },
    ];

    it('should fetch all portfolio images successfully', async () => {
      mockSupabaseClient.order.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await getPortfolioImages();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('portfolio_images');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockData);
    });

    it('should fetch portfolio images by category', async () => {
      const weddingImages = mockData.filter(img => img.category === 'wedding');
      mockSupabaseClient.order.mockResolvedValue({
        data: weddingImages,
        error: null,
      });

      const result = await getPortfolioImages('wedding');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('portfolio_images');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('category', 'wedding');
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(weddingImages);
    });

    it('should handle database errors gracefully', async () => {
      const mockError = { message: 'Database connection failed' };
      mockSupabaseClient.order.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await getPortfolioImages();

      expect(result).toEqual([]);
    });

    it('should return empty array when no data is returned', async () => {
      mockSupabaseClient.order.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await getPortfolioImages();

      expect(result).toEqual([]);
    });

    it('should handle network errors', async () => {
      mockSupabaseClient.order.mockRejectedValue(new Error('Network error'));

      const result = await getPortfolioImages();

      expect(result).toEqual([]);
    });

    it('should cache results for repeated calls', async () => {
      mockSupabaseClient.order.mockResolvedValue({
        data: mockData,
        error: null,
      });

      // First call
      const result1 = await getPortfolioImages();
      // Second call
      const result2 = await getPortfolioImages();

      expect(result1).toEqual(mockData);
      expect(result2).toEqual(mockData);
      // Should only call Supabase once due to caching
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(1);
    });

    it('should handle empty results', async () => {
      mockSupabaseClient.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getPortfolioImages();

      expect(result).toEqual([]);
    });

    it('should properly format response data', async () => {
      const malformedData = [
        {
          id: '1',
          title: 'Test Image',
          description: null, // Test null description
          image_url: 'https://example.com/image.jpg',
          category: 'wedding',
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockSupabaseClient.order.mockResolvedValue({
        data: malformedData,
        error: null,
      });

      const result = await getPortfolioImages();

      expect(result).toEqual(malformedData);
      expect(result[0].description).toBeNull();
    });
  });

  describe('Image URL Validation', () => {
    // Mock fetch for testing
    global.fetch = jest.fn();
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
      mockFetch.mockClear();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should validate accessible image URLs', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
      } as Response);

      const result = await validateImageUrl('https://example.com/valid-image.jpg');

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/valid-image.jpg', { method: 'HEAD' });
    });

    it('should return false for inaccessible URLs', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const result = await validateImageUrl('https://example.com/missing-image.jpg');

      expect(result).toBe(false);
    });

    it('should handle network errors during validation', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await validateImageUrl('https://example.com/error-image.jpg');

      expect(result).toBe(false);
    });
  });

  describe('Cache Management', () => {
    it('should clear cache when requested', async () => {
      // First, populate the cache
      mockSupabaseClient.order.mockResolvedValue({
        data: [{ id: '1', title: 'Test' }],
        error: null,
      });

      await getPortfolioImages();
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(1);

      // Second call should use cache (no additional API call)
      await getPortfolioImages();
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(1);

      // Clear cache
      clearPortfolioCache();

      // Third call should hit API again
      await getPortfolioImages();
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(2);
    });
  });

  describe('Environment Configuration', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should throw error when environment variables are missing', () => {
      // Remove environment variables
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      expect(() => {
        jest.isolateModules(() => {
          require('@/lib/supabase');
        });
      }).toThrow('Missing Supabase environment variables');
    });

    it('should initialize client with proper configuration', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

      jest.isolateModules(() => {
        require('@/lib/supabase');
      });

      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-key',
        expect.objectContaining({
          auth: {
            persistSession: false,
          },
          global: {
            headers: {
              'x-application-name': 'catering-portfolio',
            },
          },
        })
      );
    });
  });

  describe('Error Logging', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log errors to console', async () => {
      const testError = new Error('Test database error');
      mockSupabaseClient.order.mockRejectedValue(testError);

      await getPortfolioImages();

      expect(consoleSpy).toHaveBeenCalledWith('Portfolio images fetch error:', testError);
    });

    it('should log Supabase errors to console', async () => {
      const supabaseError = { message: 'RLS policy violation' };
      mockSupabaseClient.order.mockResolvedValue({
        data: null,
        error: supabaseError,
      });

      await getPortfolioImages();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Portfolio images fetch error:',
        expect.any(Error)
      );
    });
  });

  describe('Data Type Validation', () => {
    it('should handle malformed response data', async () => {
      const malformedData = [
        {
          id: 123, // Number instead of string
          title: null, // Null title
          image_url: undefined, // Undefined URL
          category: 'invalid-category', // Invalid category
        },
      ];

      mockSupabaseClient.order.mockResolvedValue({
        data: malformedData,
        error: null,
      });

      const result = await getPortfolioImages();

      // Should still return the data as-is (let TypeScript handle validation)
      expect(result).toEqual(malformedData);
    });

    it('should handle unexpected data structures', async () => {
      const unexpectedData = 'not an array';

      mockSupabaseClient.order.mockResolvedValue({
        data: unexpectedData,
        error: null,
      });

      const result = await getPortfolioImages();

      // Should return empty array for non-array data
      expect(result).toEqual([]);
    });
  });
});