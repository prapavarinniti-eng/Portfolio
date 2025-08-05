'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import Image from 'next/image';
import { PortfolioImage, getPortfolioImages, getPortfolioImagesCount } from '@/lib/supabase';

/**
 * Props interface for PortfolioGrid component
 */
interface PortfolioGridProps {
  /** Selected category to filter images */
  selectedCategory?: string;
}

/**
 * Category labels mapping for Thai localization
 */
const categoryLabels: Record<string, string> = {
  'wedding': 'งานแต่งงาน',
  'corporate': 'ประชุมองค์กร', 
  'fine-dining': 'ไฟน์ไดนิ่ง',
  'cocktail': 'ค็อกเทล',
  'buffet': 'บุฟเฟ่ต์',
  'snack-box': 'สแน็คบ็อกซ์',
  'coffee-break': 'คอฟฟี่เบรค',
  'government': 'งานภาครัฐ',
  'signature': 'ซิกเนเจอร์'
};

/**
 * Loading skeleton component for better UX
 */
const LoadingSkeleton = memo(() => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" role="status" aria-label="Loading portfolio images">
    {Array.from({ length: 10 }, (_, i) => (
      <div key={i} className="bg-gray-200 rounded-lg animate-pulse" style={{ aspectRatio: '1/1' }} />
    ))}
  </div>
));
LoadingSkeleton.displayName = 'LoadingSkeleton';

/**
 * Empty state component
 */
const EmptyState = memo(() => (
  <div className="text-center py-12" role="status">
    <div className="text-6xl mb-4" aria-hidden="true">📸</div>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">ยังไม่มีรูปภาพ</h3>
    <p className="text-gray-500">รูปภาพผลงานจะแสดงที่นี่เมื่อเพิ่มเข้าในระบบ</p>
  </div>
));
EmptyState.displayName = 'EmptyState';

/**
 * Individual portfolio item component
 */
interface PortfolioItemProps {
  image: PortfolioImage;
  onImageClick: (image: PortfolioImage) => void;
}

const PortfolioItem = memo<PortfolioItemProps>(({ image, onImageClick }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleClick = useCallback(() => {
    onImageClick(image);
  }, [image, onImageClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onImageClick(image);
    }
  }, [image, onImageClick]);

  return (
    <article
      className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View ${image.title} in fullscreen`}
    >
      <div className="relative overflow-hidden bg-gray-200" style={{ aspectRatio: '1/1' }}>
        <Image
          src={imageError ? '/placeholder.svg' : image.image_url}
          alt={image.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          loading="lazy"
          quality={75}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
      </div>
      
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
            {categoryLabels[image.category] || image.category}
          </span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-1 truncate" title={image.title}>
          {image.title}
        </h3>
        {image.description && (
          <p 
            className="text-sm text-gray-600 line-clamp-2"
            title={image.description}
          >
            {image.description}
          </p>
        )}
      </div>
    </article>
  );
});
PortfolioItem.displayName = 'PortfolioItem';

/**
 * Modal component for viewing full-size images
 */
interface ImageModalProps {
  image: PortfolioImage;
  onClose: () => void;
}

const ImageModal = memo<ImageModalProps>(({ image, onClose }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div className="relative max-w-4xl max-h-full">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-orange-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black rounded"
          aria-label="Close modal"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="relative">
          <Image
            src={imageError ? '/placeholder.svg' : image.image_url}
            alt={image.title}
            width={1024}
            height={768}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            onError={handleImageError}
            priority
          />
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 rounded-b-lg">
            <div className="text-white">
              <span className="text-xs font-medium text-orange-400 bg-orange-900 bg-opacity-50 px-2 py-1 rounded-full mb-2 inline-block">
                {categoryLabels[image.category] || image.category}
              </span>
              <h3 id="modal-title" className="text-xl font-bold mb-2">{image.title}</h3>
              {image.description && (
                <p id="modal-description" className="text-gray-200">{image.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
ImageModal.displayName = 'ImageModal';

/**
 * Pagination component
 */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = memo<PaginationProps>(({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center space-x-2 mt-8" role="navigation" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-label="Previous page"
      >
        ← ก่อนหน้า
      </button>
      
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-orange-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            1
          </button>
          {startPage > 2 && <span className="text-gray-500">...</span>}
        </>
      )}
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            currentPage === page
              ? 'bg-orange-600 text-white border-orange-600'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-orange-50'
          }`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-orange-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {totalPages}
          </button>
        </>
      )}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-label="Next page"
      >
        ถัดไป →
      </button>
    </div>
  );
});
Pagination.displayName = 'Pagination';

/**
 * Main PortfolioGrid component with pagination and optimized performance
 */
export default function PortfolioGrid({ selectedCategory }: PortfolioGridProps) {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Memoized callbacks
  const handleImageClick = useCallback((image: PortfolioImage) => {
    setSelectedImage(image);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both images and total count
        const [imagesData, countData] = await Promise.all([
          getPortfolioImages(selectedCategory, currentPage - 1, ITEMS_PER_PAGE),
          getPortfolioImagesCount(selectedCategory)
        ]);
        
        if (isMounted) {
          setImages(imagesData);
          setTotalCount(countData);
        }
      } catch {
        if (isMounted) {
          setError('Failed to load images. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, currentPage]);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12" role="alert">
        <div className="text-6xl mb-4" aria-hidden="true">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 mb-2">เกิดข้อผิดพลาด</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  if (images.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        role="grid"
        aria-label="Portfolio gallery"
      >
        {images.map((image) => (
          <PortfolioItem
            key={image.id}
            image={image}
            onImageClick={handleImageClick}
          />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}