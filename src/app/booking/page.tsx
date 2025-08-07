'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BookingPage() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    eventType: '',
    eventDate: '',
    guestCount: 50,
    serviceType: '',
    budgetRange: '',
    specialRequests: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage(`✅ จองสำเร็จ! รหัสการจอง: ${result.bookingReference}`);
      } else {
        setSubmitMessage(`❌ เกิดข้อผิดพลาด: ${result.error}`);
      }
    } catch (error) {
      setSubmitMessage('❌ เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventTypes = [
    { value: 'wedding', label: '💒 งานแต่งงาน' },
    { value: 'corporate', label: '🏢 งานบริษัท' },
    { value: 'birthday', label: '🎂 งานวันเกิด' },
    { value: 'graduation', label: '🎓 งานรับปริญญา' },
    { value: 'merit', label: '🙏 งานบุญ' },
    { value: 'other', label: '✨ อื่นๆ' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
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
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200">
                หน้าแรก
              </Link>
              <Link href="/portfolio" className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200">
                ผลงาน
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200">
                ติดต่อ
              </Link>
              <span className="text-orange-600 font-medium">
                จองออนไลน์
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              📋 จองบริการออนไลน์
            </h1>
            <p className="text-xl text-gray-600">
              กรอกข้อมูลเพื่อรับใบเสนอราคาและจองบริการ
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    step <= currentStep 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-orange-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  👤 ข้อมูลการจอง
                </h2>
                <p className="text-gray-600">กรุณากรอกข้อมูลของคุณ</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อ-นามสกุล *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="กรุณากรอกชื่อ-นามสกุล"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เบอร์โทรศัพท์ *
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="081-234-5678"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    อีเมล *
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ประเภทงาน *
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => handleInputChange('eventType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">เลือกประเภทงาน</option>
                    {eventTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันที่จัดงาน *
                  </label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => handleInputChange('eventDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    จำนวนแขก: {formData.guestCount} คน
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={formData.guestCount}
                    onChange={(e) => handleInputChange('guestCount', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ประเภทบริการ *
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => handleInputChange('serviceType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">เลือกประเภทบริการ</option>
                    <option value="buffet_standard">บุฟเฟต์มาตรฐาน (฿450/คน)</option>
                    <option value="buffet_premium">บุฟเฟต์พรีเมี่ยม (฿650/คน)</option>
                    <option value="set_menu_wedding">เซ็ตเมนูแต่งงาน (฿850/คน)</option>
                    <option value="cocktail">ค็อกเทล (฿320/คน)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    งบประมาณ *
                  </label>
                  <select
                    value={formData.budgetRange}
                    onChange={(e) => handleInputChange('budgetRange', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">เลือกช่วงงบประมาณ</option>
                    <option value="10000-20000">฿10,000-20,000</option>
                    <option value="20000-50000">฿20,000-50,000</option>
                    <option value="50000-100000">฿50,000-100,000</option>
                    <option value="100000+">฿100,000+</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ความต้องการพิเศษ
                  </label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows={3}
                    placeholder="บอกเราเกี่ยวกับความต้องการพิเศษของคุณ..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.customerName || !formData.customerPhone || !formData.customerEmail || !formData.eventType || !formData.eventDate || !formData.serviceType || !formData.budgetRange}
                className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
              >
                {isSubmitting ? '🔄 กำลังส่ง...' : '✅ ส่งคำขอจอง'}
              </button>
            </div>
            
            {submitMessage && (
              <div className={`mt-4 p-4 rounded-lg text-center ${
                submitMessage.includes('✅') 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {submitMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}