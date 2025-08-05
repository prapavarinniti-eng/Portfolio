'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
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
              <Link href="/" className="text-orange-600 font-medium relative">
                หน้าแรก
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-orange-600"></span>
              </Link>
              <a href="/portfolio" className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 relative group">
                ผลงาน
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-200 group-hover:w-full"></span>
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
              <Link href="/" className="block px-3 py-2 text-orange-600 bg-orange-50 rounded-md font-medium">
                🏠 หน้าแรก
              </Link>
              <a href="/portfolio" className="block px-3 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md font-medium transition-all duration-200">
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

      {/* Hero Section */}
      <section className="pt-20 pb-16 h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-gray-900">
        <div className="text-center text-white px-4 max-w-4xl">
          <div className="mb-6">
            <span className="text-5xl md:text-7xl mb-4 block">🍽️</span>
            <h1 className="text-3xl md:text-5xl font-bold mb-3">
              Fuzio Catering
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-6">
              บริการรับจัดเลี้ยงครบวงจร ด้วยความใส่ใจในทุกรายละเอียด
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a href="/contact" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 text-center shadow-lg hover:shadow-xl transform hover:scale-105">
              📞 ติดต่อเรา
            </a>
            <a href="/portfolio" className="border-2 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white px-6 py-3 rounded-full font-medium transition-all duration-200 text-center hover:shadow-lg transform hover:scale-105">
              📁 ดูผลงาน
            </a>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-bold mb-3">🍽️ Fuzio Catering</h3>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-4">
            <a href="tel:+66657165037" className="flex items-center hover:text-orange-400 transition-colors">
              <span>📞 065-716-5037</span>
            </a>
            <a href="mailto:info@fuzio.co.th" className="flex items-center hover:text-orange-400 transition-colors">
              <span>📧 info@fuzio.co.th</span>
            </a>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 Fuzio Catering • LifeStyle Catering ตั้งแต่ปี 1991
          </p>
        </div>
      </footer>
    </div>
  );
}