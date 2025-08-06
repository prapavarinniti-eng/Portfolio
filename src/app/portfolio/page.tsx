'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import CategoryFilter from '@/components/CategoryFilter';
import { PortfolioCategory } from '@/lib/supabase';

// Dynamic imports for better code splitting
const PortfolioGrid = dynamic(() => import('@/components/PortfolioGrid'), {
  loading: () => <PortfolioGridSkeleton />,
  ssr: false
});

/**
 * Loading skeleton for portfolio grid
 */
function PortfolioGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" aria-label="Loading portfolio images">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="bg-gray-200 rounded-lg animate-pulse" style={{ aspectRatio: '1/1' }} />
      ))}
    </div>
  );
}


/**
 * Portfolio page component with optimized performance and error handling
 */
export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState<PortfolioCategory | ''>('');
  const [isClient, setIsClient] = useState(false);

  // Handle hydration and set page title
  useEffect(() => {
    setIsClient(true);
    document.title = 'Portfolio - Fuzio Catering | แกลเลอรี่ผลงานจัดเลี้ยง';
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'ชมภาพผลงานการจัดเลี้ยงของ Fuzio Catering ในหลากหลายประเภทงาน งานแต่งงาน งานบริษัท ไฟน์ไดนิ่ง และอื่นๆ บริการมาตรฐานโรงแรมตั้งแต่ปี 1991');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'ชมภาพผลงานการจัดเลี้ยงของ Fuzio Catering ในหลากหลายประเภทงาน งานแต่งงาน งานบริษัท ไฟน์ไดนิ่ง และอื่นๆ บริการมาตรฐานโรงแรมตั้งแต่ปี 1991';
      document.head.appendChild(meta);
    }
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category as PortfolioCategory | '');
    
    // Update URL without page reload for better UX
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (category) {
        url.searchParams.set('category', category);
      } else {
        url.searchParams.delete('category');
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Initialize category from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const categoryFromUrl = urlParams.get('category');
      if (categoryFromUrl) {
        setSelectedCategory(categoryFromUrl as PortfolioCategory | '');
      }
    }
  }, []);

  const clients = [
    { name: "MGC Group", type: "Automotive", logo: "🚗" },
    { name: "Krungsri Bank", type: "Banking", logo: "🏦" },
    { name: "SCB Bank", type: "Banking", logo: "💳" },
    { name: "Baker McKenzie", type: "Legal", logo: "⚖️" },
    { name: "AIS", type: "Telecommunications", logo: "📱" },
    { name: "PTT", type: "Energy", logo: "⛽" },
    { name: "Government Sector", type: "Public", logo: "🏛️" },
    { name: "Hospital Network", type: "Healthcare", logo: "🏥" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Skip Link for Accessibility */}
      <a href="#portfolio-heading" className="skip-link">
        Skip to portfolio content
      </a>
      
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md shadow-lg fixed w-full z-50 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
                <Link href="/" className="hover:scale-105 transition-transform duration-200">
                  🍽️ Fuzio Catering
                </Link>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 relative group">
                หน้าแรก
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <a href="/portfolio" className="text-orange-600 font-medium relative">
                ผลงาน
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-orange-600"></span>
              </a>
              <a href="/contact" className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 relative group">
                ติดต่อ
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a href="tel:+66657165037" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
                📞 โทร
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                id="mobile-menu-button"
                className="text-gray-600 hover:text-orange-600 focus:outline-none focus:text-orange-600 transition-colors duration-200"
                onClick={() => {
                  const menu = document.getElementById('mobile-menu');
                  const button = document.getElementById('mobile-menu-button');
                  if (menu?.classList.contains('hidden')) {
                    menu.classList.remove('hidden');
                    if (button) {
                      button.innerHTML = `
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      `;
                    }
                  } else {
                    menu?.classList.add('hidden');
                    if (button) {
                      button.innerHTML = `
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      `;
                    }
                  }
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div id="mobile-menu" className="hidden md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/" className="block px-3 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md font-medium transition-all duration-200">
                🏠 หน้าแรก
              </Link>
              <a href="/portfolio" className="block px-3 py-2 text-orange-600 bg-orange-50 rounded-md font-medium">
                📁 ผลงาน
              </a>
              <a href="/contact" className="block px-3 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md font-medium transition-all duration-200">
                📞 ติดต่อ
              </a>
              <div className="pt-2">
                <a href="tel:+66657165037" className="block mx-3 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-center rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md">
                  📞 โทร: 065-716-5037
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Simple Header */}
      <div className="pt-20 pb-8 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            แกลเลอรี่ผลงาน
          </h1>
          <p className="text-xl text-gray-600">
            ชมภาพผลงานการจัดเลี้ยงของเราในหลากหลายประเภทงาน
          </p>
        </div>
      </div>

      {/* Portfolio Gallery Section */}
      <section className="py-16 bg-white" aria-labelledby="portfolio-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
            <ErrorBoundary>
              {isClient && (
                <CategoryFilter 
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                />
              )}
            </ErrorBoundary>
            
          </div>

          <ErrorBoundary>
            <Suspense fallback={<PortfolioGridSkeleton />}>
              {isClient && <PortfolioGrid selectedCategory={selectedCategory || undefined} />}
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>

      {/* Trusted Clients */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Leading Organizations</h2>
            <p className="text-gray-600">ลูกค้าองค์กรชั้นนำที่ไว้วางใจในบริการของเรา</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {clients.map((client, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{client.logo}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{client.name}</h3>
                <p className="text-sm text-gray-600">{client.type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Download Documents */}
      <div className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Download Documents</h2>
            <p className="text-gray-600 text-sm sm:text-base">เอกสารและโบรชัวร์สำหรับการนำเสนอ</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
            <a 
              href="https://drive.google.com/file/d/17LuSqVJyMQSstT_0j9Eu5i-yNBN7Qckb/view?usp=sharing" 
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-blue-100"
            >
              <div className="flex items-start mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                  <span className="text-xl sm:text-2xl">📄</span>
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 text-sm sm:text-base leading-tight">
                    Company Profile 2025
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">PDF • Google Drive</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                ข้อมูลบริษัท ประวัติ ความเชี่ยวชาญ และผลงานที่ผ่านมา
              </p>
              <div className="flex items-center text-blue-600 text-xs sm:text-sm font-medium">
                <span>ดาวน์โหลด</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>

            <a 
              href="https://drive.google.com/file/d/1O9-RzqTXRxDhYZVOo7ugo2IlxTXDnB9Y/view?usp=sharing" 
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-orange-50 to-red-50 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-orange-100"
            >
              <div className="flex items-start mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors flex-shrink-0">
                  <span className="text-xl sm:text-2xl">💰</span>
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-orange-700 text-sm sm:text-base leading-tight">
                    Price List & Conditions 2025
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">PDF • Google Drive</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                รายการราคาและเงื่อนไขสำหรับการทดลองอาหาร
              </p>
              <div className="flex items-center text-orange-600 text-xs sm:text-sm font-medium">
                <span>ดาวน์โหลด</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>

            <a 
              href="https://drive.google.com/file/d/161XZ4jiLKa1B3uuJq2gOUvFq9hT-I8uw/view?usp=sharing" 
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-green-100"
            >
              <div className="flex items-start mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors flex-shrink-0">
                  <span className="text-xl sm:text-2xl">🍪</span>
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-700 text-sm sm:text-base leading-tight">
                    Snack Box 2025
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">PDF • Google Drive</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                แพ็คเกจขนมและของว่างสำหรับงานต่างๆ
              </p>
              <div className="flex items-center text-green-600 text-xs sm:text-sm font-medium">
                <span>ดาวน์โหลด</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>

            <a 
              href="https://drive.google.com/file/d/13xnMwxGXQaHaRqUyr9alZGlloDCsu0Ro/view?usp=sharing" 
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-purple-50 to-violet-50 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-purple-100"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <span className="text-2xl">🍱</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-700">
                    Food Box 2025
                  </h3>
                  <p className="text-sm text-gray-500">PDF • Google Drive</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                กล่องอาหารสำหรับงานประชุมและอีเวนต์
              </p>
              <div className="flex items-center text-purple-600 text-sm font-medium">
                <span>ดาวน์โหลด</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>

            <a 
              href="https://drive.google.com/file/d/1i4KmUdtLqOak6oHE0iutmUvD60f_D_AU/view?usp=sharing" 
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-amber-50 to-yellow-50 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-amber-100"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <span className="text-2xl">☕</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-amber-700">
                    Coffee Break 2025
                  </h3>
                  <p className="text-sm text-gray-500">PDF • Google Drive</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                เมนูคอฟฟี่เบรคสำหรับงานสัมมนาและประชุม
              </p>
              <div className="flex items-center text-amber-600 text-sm font-medium">
                <span>ดาวน์โหลด</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>

            <a 
              href="https://drive.google.com/file/d/1XN48CIuqvsG6lAmIaHMN3Xh4FQAug8RT/view?usp=sharing" 
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-pink-50 to-rose-50 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-pink-100"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                  <span className="text-2xl">🍸</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-pink-700">
                    Premium Cocktails 2025
                  </h3>
                  <p className="text-sm text-gray-500">PDF • Google Drive</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                เมนูค็อกเทลพรีเมียมสำหรับงานเลี้ยงพิเศษ
              </p>
              <div className="flex items-center text-pink-600 text-sm font-medium">
                <span>ดาวน์โหลด</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>

            <a 
              href="https://drive.google.com/file/d/1IeqzhPtAcQaExGW461dMfN0M3ljoQgh7/view?usp=sharing" 
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-red-50 to-orange-50 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-red-100"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <span className="text-2xl">🍜</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-red-700">
                    Thai Buffet Standard 2025
                  </h3>
                  <p className="text-sm text-gray-500">PDF • Google Drive</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                บุฟเฟต์อาหารไทยมาตรฐานสำหรับงานทั่วไป
              </p>
              <div className="flex items-center text-red-600 text-sm font-medium">
                <span>ดาวน์โหลด</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>

            <a 
              href="https://drive.google.com/file/d/1oGwzJfgmOdJfZvSAsJbWwv9sEIYk1g7E/view?usp=sharing" 
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-gray-900 to-gray-700 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-600 text-white"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center group-hover:bg-gray-500 transition-colors">
                  <span className="text-2xl">🍽️</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-white group-hover:text-gray-200">
                    Fine Dining 2025
                  </h3>
                  <p className="text-sm text-gray-300">PDF • Google Drive</p>
                </div>
              </div>
              <p className="text-sm text-gray-200 mb-4">
                ไฟน์ไดนิ่งระดับพรีเมียมสำหรับงานพิเศษ
              </p>
              <div className="flex items-center text-gray-200 text-sm font-medium">
                <span>ดาวน์โหลด</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>

            <a 
              href="https://drive.google.com/file/d/1gvIFoI5d9wDSSh0HJ1AfxpcKB9GV_out/view?usp=sharing" 
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-teal-50 to-cyan-50 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-teal-100"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                  <span className="text-2xl">🌭</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-teal-700">
                    Food Stall 2025
                  </h3>
                  <p className="text-sm text-gray-500">PDF • Google Drive</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                บริการร้านอาหารแบบถนนหน้างานในรูปแบบ outdoor
              </p>
              <div className="flex items-center text-teal-600 text-sm font-medium">
                <span>ดาวน์โหลด</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>

            <a 
              href="https://drive.google.com/file/d/17P1lBtP2YQ0O5OD45gQWO2kut1cHYhji/view?usp=sharing" 
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-rose-50 to-pink-50 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-rose-100"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                  <span className="text-2xl">💒</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-rose-700">
                    Wedding Package 2025
                  </h3>
                  <p className="text-sm text-gray-500">PDF • Google Drive</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                แพ็คเกจงานแต่งงานครบวงจรและงานเลี้ยงพิเศษ
              </p>
              <div className="flex items-center text-rose-600 text-sm font-medium">
                <span>ดาวน์โหลด</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Fuzio Catering</h3>
          <p className="text-gray-400 mb-6">LifeStyle Catering • ตั้งแต่ปี 1991</p>
          
          <address className="flex flex-col sm:flex-row justify-center items-center gap-8 mb-6 not-italic">
            <div className="flex items-center">
              <span aria-hidden="true">📞</span>
              <a href="tel:+66657165037" className="ml-2 hover:text-orange-400 transition-colors">
                065-716-5037
              </a>
            </div>
            <div className="flex items-center">
              <span aria-hidden="true">📧</span>
              <a href="mailto:info@fuzio.co.th" className="ml-2 hover:text-orange-400 transition-colors">
                info@fuzio.co.th
              </a>
            </div>
            <div className="flex items-center">
              <span aria-hidden="true">📍</span>
              <span className="ml-2">Royal Suite Hotel, Bangkok</span>
            </div>
          </address>
          
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Fuzio Catering. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}