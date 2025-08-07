'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    eventType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'เกิดข้อผิดพลาด');
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', phone: '', email: '', eventType: '', message: '' });
      }, 4000);

    } catch (error) {
      console.error('Form submission error:', error);
      alert(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-orange-300/20 to-red-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-8 w-96 h-96 bg-gradient-to-r from-red-300/20 to-orange-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl shadow-lg fixed w-full z-50 border-b border-orange-100/50">
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
              <a href="tel:+66815146939" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
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
                <a href="tel:+66815146939" className="block mx-3 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-center rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md">
                  📞 โทร: 081-514-6939
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Contact Content */}
      <div className="pt-24 pb-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 relative">
            {/* Floating decorative elements */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-4 animate-float">
                <div className="w-3 h-3 bg-orange-400 rounded-full opacity-60 animate-pulse"></div>
                <div className="w-2 h-2 bg-red-400 rounded-full opacity-40 animate-pulse delay-300"></div>
                <div className="w-4 h-4 bg-yellow-400 rounded-full opacity-50 animate-pulse delay-700"></div>
              </div>
            </div>

            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-xl opacity-30 scale-110 animate-pulse"></div>
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-500">
                <span className="text-3xl animate-bounce">📞</span>
                <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full opacity-20 animate-ping"></div>
              </div>
            </div>

            <div className="relative mb-8">
              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black bg-gradient-to-r from-orange-600 via-red-500 via-pink-500 to-orange-600 bg-clip-text text-transparent mb-4 animate-fade-in leading-tight tracking-tight">
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">ติด</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 delay-100 cursor-default">ต่อ</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 delay-200 cursor-default">เรา</span>
              </h1>
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-200/20 via-transparent to-red-200/20 blur-3xl -z-10"></div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-orange-100/50 shadow-lg max-w-3xl mx-auto">
              <p className="text-xl lg:text-2xl text-gray-700 font-medium leading-relaxed mb-4">
                <span className="text-orange-600 font-semibold">🚀 พร้อมให้บริการ</span> และ 
                <span className="text-red-600 font-semibold">💬 ปรึกษาฟรี</span>
              </p>
              <p className="text-lg text-gray-600 flex items-center justify-center gap-2">
                <span className="animate-pulse">⚡</span>
                ตอบกลับรวดเร็วภายใน 24 ชั่วโมง
                <span className="animate-pulse">⚡</span>
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Booking redirect section */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-200/50 p-8 mb-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-300/20 to-red-300/20 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative z-10 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                  <span className="mr-3">📋</span>
                  ต้องการจองบริการ?
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  ใช้ระบบจองออนไลน์ใหม่ของเรา กรอกข้อมูลง่าย ๆ แล้วทีมงานจะติดต่อกลับ
                </p>
                <a
                  href="/booking"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span className="mr-2">🚀</span>
                  จองออนไลน์เลย
                </a>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-red-400/10 to-orange-400/10 rounded-full -translate-y-20 -translate-x-20"></div>
                
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                    <span className="mr-3">📋</span>
                    ข้อมูลการติดต่อ
                  </h2>
                  <p className="text-gray-600 mb-8">ช่องทางการติดต่อหลากหลาย เลือกที่สะดวกที่สุด</p>
                  
                  <div className="space-y-6">
                    <div className="group flex items-start p-4 rounded-2xl hover:bg-orange-50/50 transition-all duration-300 cursor-pointer">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                        📞
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">โทรศัพท์</h3>
                        <p className="text-lg font-semibold text-orange-600">081-514-6939</p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <span className="mr-2">🕐</span>
                          เปิดให้บริการ 8:00 - 20:00 น.
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-orange-500">→</span>
                      </div>
                    </div>

                    <div className="group flex items-start p-4 rounded-2xl hover:bg-orange-50/50 transition-all duration-300 cursor-pointer">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                        📧
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">อีเมล</h3>
                        <p className="text-lg font-semibold text-blue-600">prapavarinniti@gmail.com</p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <span className="mr-2">⚡</span>
                          ตอบกลับภายใน 24 ชั่วโมง
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-blue-500">→</span>
                      </div>
                    </div>

                    <div className="group flex items-start p-4 rounded-2xl hover:bg-orange-50/50 transition-all duration-300 cursor-pointer">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                        💬
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Line</h3>
                        <p className="text-lg font-semibold text-green-600">@fuziocatering</p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <span className="mr-2">💚</span>
                          ปรึกษาฟรี ตอบรวดเร็ว
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-green-500">→</span>
                      </div>
                    </div>

                    <div className="group flex items-start p-4 rounded-2xl hover:bg-orange-50/50 transition-all duration-300">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                        📍
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">พื้นที่ให้บริการ</h3>
                        <p className="text-lg font-semibold text-purple-600">กรุงเทพและปริมณฑล</p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <span className="mr-2">🚗</span>
                          ต่างจังหวัดสามารถปรึกษาได้
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-200/50 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-300/20 to-red-300/20 rounded-full -translate-y-16 translate-x-16"></div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-3">💡</span>
                    เคล็ดลับการสั่งจ้าง
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center p-3 bg-white/60 rounded-xl backdrop-blur-sm hover:bg-white/80 transition-all duration-300">
                      <span className="text-2xl mr-3">📅</span>
                      <span className="text-sm font-medium text-gray-700">จองล่วงหน้าอย่างน้อย 7 วัน</span>
                    </div>
                    <div className="flex items-center p-3 bg-white/60 rounded-xl backdrop-blur-sm hover:bg-white/80 transition-all duration-300">
                      <span className="text-2xl mr-3">👥</span>
                      <span className="text-sm font-medium text-gray-700">แจ้งจำนวนคนที่แน่นอน</span>
                    </div>
                    <div className="flex items-center p-3 bg-white/60 rounded-xl backdrop-blur-sm hover:bg-white/80 transition-all duration-300">
                      <span className="text-2xl mr-3">✨</span>
                      <span className="text-sm font-medium text-gray-700">ระบุความต้องการพิเศษ</span>
                    </div>
                    <div className="flex items-center p-3 bg-white/60 rounded-xl backdrop-blur-sm hover:bg-white/80 transition-all duration-300">
                      <span className="text-2xl mr-3">💰</span>
                      <span className="text-sm font-medium text-gray-700">สอบถามราคาและเงื่อนไขชัดเจน</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
                <span className="text-2xl">❓</span>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                คำถามที่พบบ่อย
              </h2>
              <p className="text-xl text-gray-600">
                คำตอบสำหรับคำถามที่ลูกค้าสอบถามบ่อยที่สุด
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {[
                  {
                    question: "📅 ควรจองล่วงหน้ากี่วัน?",
                    answer: "แนะนำให้จองล่วงหน้าอย่างน้อย 7-14 วัน สำหรับงานใหญ่ เช่น งานแต่งงาน ควรจองล่วงหน้า 1 เดือน เพื่อให้เราเตรียมความพร้อมได้อย่างดีที่สุด"
                  },
                  {
                    question: "💰 ราคาเริ่มต้นเท่าไหร่?",
                    answer: "ราคาขึ้นอยู่กับประเภทงาน จำนวนคน และเมนูที่เลือก เริ่มต้นที่ 150 บาทต่อคน สำหรับเมนูมาตรฐาน สอบถามใบเสนอราคาฟรีได้ที่เบอร์ 081-514-6939"
                  },
                  {
                    question: "🍽️ มีเมนูอาหารให้เลือกหรือไม่?",
                    answer: "มีเมนูหลากหลายให้เลือก ทั้งอาหารไทย อาหารจีน อาหารญี่ปุ่น และอาหารนานาชาติ สามารถปรับแต่งเมนูตามความต้องการ และรองรับอาหารเจ อาหารฮาลาล"
                  },
                  {
                    question: "📍 ให้บริการพื้นที่ไหนบ้าง?",
                    answer: "ให้บริการหลักในกรุงเทพและปริมณฑล สำหรับต่างจังหวัดสามารถให้บริการได้ โดยมีค่าเดินทางเพิ่มเติม กรุณาติดต่อสอบถามรายละเอียด"
                  },
                  {
                    question: "👥 รับจัดงานขั้นต่ำกี่คน?",
                    answer: "รับจัดงานตั้งแต่ 20 คนขึ้นไป สำหรับงานขนาดเล็กกว่านี้ เรามีบริการ Snack Box และอาหารว่างที่สามารถสั่งได้ตั้งแต่ 10 กล่องขึ้นไป"
                  },
                  {
                    question: "🎂 มีบริการเค้กและของหวานไหม?",
                    answer: "มีบริการเค้ก ของหวาน และผลไม้ครบครัน สามารถออกแบบเค้กตามความต้องการ พร้อมบริการตัดเค้กในงาน และมีช่างภาพบันทึกภาพสำคัญ"
                  }
                ].map((faq, index) => (
                  <div key={index} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/50 transition-colors">
                        <h3 className="text-lg font-semibold text-gray-900 pr-4">
                          {faq.question}
                        </h3>
                        <div className="flex-shrink-0 transform transition-transform group-open:rotate-180">
                          <span className="text-2xl text-orange-500">⌄</span>
                        </div>
                      </summary>
                      <div className="px-6 pb-6">
                        <div className="pt-4 border-t border-gray-200/50">
                          <p className="text-gray-700 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </details>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl p-8 border border-orange-200/50">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    🤔 ไม่พบคำตอบที่ต้องการ?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    ติดต่อเราได้ทุกช่องทาง เราพร้อมตอบคำถามและให้คำปรึกษาฟรี
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="tel:081-514-6939"
                      className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105"
                    >
                      <span className="mr-2">📞</span>
                      โทรเลย 081-514-6939
                    </a>
                    <a
                      href="mailto:prapavarinniti@gmail.com"
                      className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                    >
                      <span className="mr-2">📧</span>
                      ส่งอีเมล
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}