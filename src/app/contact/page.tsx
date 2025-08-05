'use client';

import Link from 'next/link';

export default function Contact() {
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
              <Link href="/" className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 relative group">
                หน้าแรก
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <a href="/portfolio" className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 relative group">
                ผลงาน
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a href="/contact" className="text-orange-600 font-medium relative">
                ติดต่อ
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-orange-600"></span>
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
              <a href="/portfolio" className="block px-3 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md font-medium transition-all duration-200">
                📁 ผลงาน
              </a>
              <a href="/contact" className="block px-3 py-2 text-orange-600 bg-orange-50 rounded-md font-medium">
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

      {/* Contact Content */}
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">ติดต่อเรา</h1>
            <p className="text-xl text-gray-600">พร้อมให้บริการและปรึกษาฟรี</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">ส่งข้อความถึงเรา</h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="กรุณากรอกชื่อ-นามสกุล"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="081-234-5678"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="event-type" className="block text-sm font-medium text-gray-700 mb-2">
                    ประเภทงาน
                  </label>
                  <select
                    id="event-type"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">เลือกประเภทงาน</option>
                    <option value="wedding">งานแต่งงาน</option>
                    <option value="merit">งานบุญ</option>
                    <option value="corporate">งานบริษัท</option>
                    <option value="birthday">งานวันเกิด</option>
                    <option value="graduation">งานรับปริญญา</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    รายละเอียด
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="กรุณาระบุรายละเอียดงาน วันที่ เวลา จำนวนคน และความต้องการพิเศษ"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  ส่งข้อความ
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">ข้อมูลการติดต่อ</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 text-orange-600 mt-1">
                    📞
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">โทรศัพท์</h3>
                    <p className="text-gray-600">081-234-5678</p>
                    <p className="text-sm text-gray-500">เปิดให้บริการ 8:00 - 20:00 น.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 text-orange-600 mt-1">
                    📧
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">อีเมล</h3>
                    <p className="text-gray-600">info@fuziocatering.com</p>
                    <p className="text-sm text-gray-500">ตอบกลับภายใน 24 ชั่วโมง</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 text-orange-600 mt-1">
                    💬
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Line</h3>
                    <p className="text-gray-600">@fuziocatering</p>
                    <p className="text-sm text-gray-500">ปรึกษาฟรี ตอบรวดเร็ว</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 text-orange-600 mt-1">
                    📍
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">พื้นที่ให้บริการ</h3>
                    <p className="text-gray-600">กรุงเทพและปริมณฑล</p>
                    <p className="text-sm text-gray-500">ต่างจังหวัดสามารถปรึกษาได้</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-orange-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">💡 เคล็ดลับการสั่งจ้าง</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• จองล่วงหน้าอย่างน้อย 7 วัน</li>
                  <li>• แจ้งจำนวนคนที่แน่นอน</li>
                  <li>• ระบุความต้องการพิเศษ</li>
                  <li>• สอบถามราคาและเงื่อนไขชัดเจน</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Fuzio Catering</h3>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mb-6">
            <div className="flex items-center">
              <span>📞 081-234-5678</span>
            </div>
            <div className="flex items-center">
              <span>📧 info@fuziocatering.com</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 Fuzio Catering. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}