import { createClient } from '@supabase/supabase-js'

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Supabase client instance with optimized configuration
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Disable auth session persistence for public data
  },
  global: {
    headers: {
      'x-application-name': 'catering-portfolio'
    }
  }
})

/**
 * Available portfolio categories (UI level)
 */
export type PortfolioCategory = 
  | 'buffet-table'
  | 'food-plating' 
  | 'event-atmosphere' 
  | 'special-dishes'
  | 'wedding'
  | 'corporate'
  | 'fine-dining'
  | 'buffet'
  | 'cocktail'
  | 'coffee-break'
  | 'snack-box'

/**
 * Database categories (legacy)
 */
type DatabaseCategory = 
  | 'wedding'
  | 'corporate'
  | 'fine-dining'
  | 'buffet'
  | 'cocktail'
  | 'coffee-break'
  | 'snack-box'

/**
 * Map new UI categories to database categories
 */
const CATEGORY_MAPPING: Record<PortfolioCategory, DatabaseCategory[]> = {
  'buffet-table': ['corporate', 'buffet'],
  'food-plating': ['fine-dining', 'cocktail', 'coffee-break'],
  'event-atmosphere': ['wedding'],
  'special-dishes': ['snack-box']
}

/**
 * Map database category to UI category
 */
function mapDatabaseToUI(dbCategory: string): PortfolioCategory {
  const mapping: Record<string, PortfolioCategory> = {
    'wedding': 'event-atmosphere',
    'corporate': 'buffet-table',
    'fine-dining': 'food-plating',
    'buffet': 'buffet-table',
    'cocktail': 'food-plating',
    'coffee-break': 'food-plating',
    'snack-box': 'special-dishes'
  }
  return mapping[dbCategory] || 'special-dishes'
}

/**
 * Portfolio image interface with proper typing
 */
export interface PortfolioImage {
  id: string
  title: string
  description?: string | null
  image_url: string
  category: PortfolioCategory
  created_at: string
}

/**
 * Database image interface (with database category)
 */
interface DatabasePortfolioImage {
  id: string
  title: string
  description?: string | null
  image_url: string
  category: string
  created_at: string
}


/**
 * Simple in-memory cache for portfolio images
 */
class PortfolioCache {
  private cache: Map<string, { data: PortfolioImage[], timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  get(key: string): PortfolioImage[] | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION
    if (isExpired) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  set(key: string, data: PortfolioImage[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }
}

const portfolioCache = new PortfolioCache()

/**
 * Fetches portfolio images with pagination, caching and proper error handling
 * @param category - Optional category to filter by
 * @param page - Page number (0-based)
 * @param limit - Number of items per page
 * @returns Promise resolving to portfolio images array
 */
export async function getPortfolioImages(
  category?: PortfolioCategory, 
  page: number = 0, 
  limit: number = 20
): Promise<PortfolioImage[]> {
  const cacheKey = `portfolio_${category || 'all'}_${page}_${limit}`
  
  // Check cache first
  const cached = portfolioCache.get(cacheKey)
  if (cached) {
    return cached
  }

  try {
    let query = supabase
      .from('portfolio_images')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    // Apply category filter if specified
    if (category) {
      const dbCategories = CATEGORY_MAPPING[category]
      query = query.in('category', dbCategories)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch portfolio images: ${error.message}`)
    }

    // Map database results to UI format
    const images: PortfolioImage[] = (data as DatabasePortfolioImage[] || []).map(item => ({
      ...item,
      category: mapDatabaseToUI(item.category)
    }))
    
    // Cache the results
    portfolioCache.set(cacheKey, images)
    
    return images
  } catch (error) {
    console.error('Portfolio images fetch error:', error)
    
    // Return empty array on error to prevent crashes
    return []
  }
}

/**
 * Gets total count of portfolio images for pagination
 * @param category - Optional category to filter by
 * @returns Promise resolving to total count
 */
export async function getPortfolioImagesCount(category?: PortfolioCategory): Promise<number> {
  try {
    let query = supabase
      .from('portfolio_images')
      .select('*', { count: 'exact', head: true })

    if (category) {
      const dbCategories = CATEGORY_MAPPING[category]
      query = query.in('category', dbCategories)
    }

    const { count, error } = await query

    if (error) {
      throw new Error(`Failed to fetch portfolio images count: ${error.message}`)
    }

    return count || 0
  } catch (error) {
    console.error('Portfolio images count error:', error)
    return 0
  }
}

/**
 * Gets optimized image URL from Supabase Storage
 * @param path - Storage path to the image
 * @param options - Image transformation options
 * @returns Optimized image URL
 */
export function getImageUrl(
  path: string, 
  options?: {
    width?: number
    height?: number
    quality?: number
  }
): string {
  const { data } = supabase.storage
    .from('portfolio')
    .getPublicUrl(path, {
      transform: options ? {
        width: options.width,
        height: options.height,
        quality: options.quality || 80
      } : undefined
    })
  
  return data.publicUrl
}

/**
 * Validates if an image URL is accessible
 * @param url - Image URL to validate
 * @returns Promise resolving to boolean
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Clears the portfolio cache (useful for admin operations)
 */
export function clearPortfolioCache(): void {
  portfolioCache.clear()
}

/**
 * Preloads portfolio images for better performance
 * @param images - Array of portfolio images to preload
 */
export function preloadImages(images: PortfolioImage[]): void {
  if (typeof document === 'undefined') return // SSR check
  
  images.slice(0, 6).forEach(image => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = image.image_url
    document.head.appendChild(link)
  })
}