'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BookingPage() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    eventType: '',
    eventDate: '',
    eventTime: '12:00',
    guestCount: 50,
    budgetRange: '',
    specialRequests: '',
    venueType: 'customer_venue',
    venueAddress: '',
    preferredContactMethod: 'phone'
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate estimated price
  useEffect(() => {
    if (formData.guestCount > 0) {
      const basePrice = getBasePrice('');
      setEstimatedPrice(basePrice * formData.guestCount);
    }
  }, [formData.guestCount]);

  const getBasePrice = (serviceType: string) => {
    // Simple base price since admin will discuss details later
    return 500;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.customerName.trim()) newErrors.customerName = 'กรุณากรอกชื่อ-นามสกุล';
      if (!formData.customerPhone.trim()) newErrors.customerPhone = 'กรุณากรอกเบอร์โทร';
      if (!formData.customerEmail.trim()) newErrors.customerEmail = 'กรุณากรอกอีเมล';
      else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) newErrors.customerEmail = 'รูปแบบอีเมลไม่ถูกต้อง';
    } else if (step === 2) {
      if (!formData.eventType) newErrors.eventType = 'กรุณาเลือกประเภทงาน';
      if (!formData.eventDate) newErrors.eventDate = 'กรุณาเลือกวันที่';
      if (formData.guestCount < 10) newErrors.guestCount = 'จำนวนแขกอย่างน้อย 10 คน';
    } else if (step === 3) {
      if (!formData.budgetRange) newErrors.budgetRange = 'กรุณาเลือกงบประมาณ';
      if (formData.venueType === 'customer_venue' && !formData.venueAddress.trim()) {
        newErrors.venueAddress = 'กรุณากรอกที่อยู่สถานที่จัดงาน';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedPrice
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage(`✅ จองสำเร็จ! รหัสการจอง: ${result.bookingReference}`);
        setCurrentStep(4);
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
    { value: 'wedding', label: 'งานแต่งงาน', icon: '💒', color: 'pink' },
    { value: 'corporate', label: 'งานบริษัท', icon: '🏢', color: 'blue' },
    { value: 'birthday', label: 'งานวันเกิด', icon: '🎂', color: 'yellow' },
    { value: 'anniversary', label: 'งานรับปริญญา', icon: '🎓', color: 'green' },
    { value: 'seminar', label: 'งานบุญ', icon: '🙏', color: 'purple' },
    { value: 'other', label: 'อื่นๆ', icon: '✨', color: 'gray' }
  ];

  // Removed service package selection - admin will discuss details later

  const stepTitles = [
    { title: 'ข้อมูลผู้จอง', subtitle: 'กรอกข้อมูลติดต่อของคุณ', icon: '👤' },
    { title: 'รายละเอียดงาน', subtitle: 'ข้อมูลเกี่ยวกับงานของคุณ', icon: '🎉' },
    { title: 'ข้อมูลเพิ่มเติม', subtitle: 'งบประมาณและความต้องการ', icon: '💰' },
    { title: 'เสร็จสิ้น', subtitle: 'ยืนยันและส่งคำขอจอง', icon: '✅' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200">
                🍽️ Fuzio Catering
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">หน้าแรก</Link>
              <Link href="/portfolio" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">ผลงาน</Link>
              <Link href="/contact" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">ติดต่อ</Link>
              <span className="text-orange-600 font-medium px-3 py-1 bg-orange-100 rounded-full">จองออนไลน์</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-6 shadow-lg">
              <span className="text-2xl text-white">{stepTitles[currentStep - 1].icon}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              📋 จองบริการออนไลน์
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              กรอกข้อมูลง่ายๆ เพื่อรับใบเสนอราคาและจองบริการจัดเลี้ยงของคุณ
            </p>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3, 4].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      step < currentStep 
                        ? 'bg-green-500 text-white shadow-lg' 
                        : step === currentStep
                        ? 'bg-orange-500 text-white shadow-lg scale-110'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step < currentStep ? '✓' : step}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-medium ${
                        step <= currentStep ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {stepTitles[step - 1].title}
                      </div>
                    </div>
                  </div>
                  {index < 3 && (
                    <div className={`w-16 h-1 mx-4 transition-all duration-300 ${
                      step < currentStep ? 'bg-green-500' : step === currentStep ? 'bg-orange-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {stepTitles[currentStep - 1].title}
              </h2>
              <p className="text-gray-600">{stepTitles[currentStep - 1].subtitle}</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
            {/* Step 1: Customer Information */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      ชื่อ-นามสกุล *
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                        errors.customerName ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
                      }`}
                      placeholder="กรอกชื่อ-นามสกุลของคุณ"
                    />
                    {errors.customerName && <p className="mt-2 text-sm text-red-600">{errors.customerName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      เบอร์โทรศัพท์ *
                    </label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                        errors.customerPhone ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
                      }`}
                      placeholder="081-234-5678"
                    />
                    {errors.customerPhone && <p className="mt-2 text-sm text-red-600">{errors.customerPhone}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      อีเมล *
                    </label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                      className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                        errors.customerEmail ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
                      }`}
                      placeholder="your@email.com"
                    />
                    {errors.customerEmail && <p className="mt-2 text-sm text-red-600">{errors.customerEmail}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      วิธีการติดต่อที่สะดวก
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'phone', label: 'โทรศัพท์', icon: '📞' },
                        { value: 'email', label: 'อีเมล', icon: '📧' },
                        { value: 'line', label: 'Line', icon: '💬' }
                      ].map((contact) => (
                        <button
                          key={contact.value}
                          type="button"
                          onClick={() => handleInputChange('preferredContactMethod', contact.value)}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            formData.preferredContactMethod === contact.value
                              ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-2xl mb-2">{contact.icon}</div>
                          <div className="text-sm font-medium">{contact.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Event Details */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    ประเภทงาน *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {eventTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleInputChange('eventType', type.value)}
                        className={`p-6 rounded-xl border-2 text-center transition-all hover:scale-105 ${
                          formData.eventType === type.value
                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-3xl mb-3">{type.icon}</div>
                        <div className="text-sm font-semibold">{type.label}</div>
                      </button>
                    ))}
                  </div>
                  {errors.eventType && <p className="mt-2 text-sm text-red-600">{errors.eventType}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      วันที่จัดงาน *
                    </label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => handleInputChange('eventDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                        errors.eventDate ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
                      }`}
                    />
                    {errors.eventDate && <p className="mt-2 text-sm text-red-600">{errors.eventDate}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      เวลาเริ่มงาน
                    </label>
                    <input
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) => handleInputChange('eventTime', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      จำนวนแขก: <span className="text-orange-600 font-bold">{formData.guestCount}</span> คน
                    </label>
                    <div className="px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                      <input
                        type="range"
                        min="10"
                        max="500"
                        step="10"
                        value={formData.guestCount}
                        onChange={(e) => handleInputChange('guestCount', parseInt(e.target.value))}
                        className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>10</span>
                        <span>500</span>
                      </div>
                    </div>
                    {errors.guestCount && <p className="mt-2 text-sm text-red-600">{errors.guestCount}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Additional Information */}
            {currentStep === 3 && (
              <div className="space-y-8">
                {/* Info Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="text-center">
                    <div className="text-3xl mb-3">📞</div>
                    <h3 className="text-lg font-bold text-blue-800 mb-2">
                      รายละเอียดแพ็กเกจและเมนู
                    </h3>
                    <p className="text-blue-700">
                      ทีมงานจะติดต่อกลับไปเพื่อปรึกษารายละเอียดแพ็กเกจ เมนูอาหาร และราคาที่เหมาะสมกับงานของคุณ
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      งบประมาณที่คาดหวัง *
                    </label>
                    <select
                      value={formData.budgetRange}
                      onChange={(e) => handleInputChange('budgetRange', e.target.value)}
                      className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                        errors.budgetRange ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
                      }`}
                    >
                      <option value="">เลือกช่วงงบประมาณ</option>
                      <option value="10000-20000">฿10,000 - 20,000</option>
                      <option value="20000-50000">฿20,000 - 50,000</option>
                      <option value="50000-100000">฿50,000 - 100,000</option>
                      <option value="100000-200000">฿100,000 - 200,000</option>
                      <option value="200000+">฿200,000+</option>
                    </select>
                    {errors.budgetRange && <p className="mt-2 text-sm text-red-600">{errors.budgetRange}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      สถานที่จัดงาน *
                    </label>
                    <select
                      value={formData.venueType}
                      onChange={(e) => handleInputChange('venueType', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    >
                      <option value="customer_venue">สถานที่ของลูกค้า</option>
                      <option value="our_recommendation">แนะนำสถานที่</option>
                    </select>
                  </div>
                </div>

                {formData.venueType === 'customer_venue' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      ที่อยู่สถานที่จัดงาน *
                    </label>
                    <textarea
                      value={formData.venueAddress}
                      onChange={(e) => handleInputChange('venueAddress', e.target.value)}
                      className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                        errors.venueAddress ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
                      }`}
                      rows={3}
                      placeholder="กรุณาระบุที่อยู่ที่ชัดเจน พร้อมสถานที่สำคัญใกล้เคียง"
                    />
                    {errors.venueAddress && <p className="mt-2 text-sm text-red-600">{errors.venueAddress}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    ความต้องการพิเศษ
                  </label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    rows={4}
                    placeholder="เช่น การจัดแต่งธีมสี, ประเภทอาหารที่ต้องการ, อุปกรณ์เพิ่มเติม, ข้อจำกัดด้านอาหาร..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <div className="text-center space-y-8">
                {submitMessage.includes('✅') ? (
                  <div>
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl text-white">✅</span>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-8">
                      <div className="text-2xl font-bold text-green-800 mb-4">
                        จองสำเร็จแล้ว! 🎉
                      </div>
                      <div className="text-green-700 mb-6">
                        {submitMessage.replace('✅ ', '')}
                      </div>
                      <div className="text-sm text-green-600 space-y-2">
                        <p>🕒 เราจะติดต่อกลับภายใน 24 ชั่วโมง</p>
                        <p>📞 โทรสอบถามเพิ่มเติม: 081-514-6939</p>
                        <p>📧 อีเมล: prapavarinniti@gmail.com</p>
                      </div>
                      <div className="mt-8 space-y-4">
                        <Link
                          href="/"
                          className="inline-block px-8 py-4 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors"
                        >
                          กลับหน้าหลัก
                        </Link>
                        <div>
                          <button
                            onClick={() => {
                              setCurrentStep(1);
                              setFormData({
                                customerName: '',
                                customerPhone: '',
                                customerEmail: '',
                                eventType: '',
                                eventDate: '',
                                eventTime: '12:00',
                                guestCount: 50,
                                serviceType: '',
                                budgetRange: '',
                                specialRequests: '',
                                venueType: 'customer_venue',
                                venueAddress: '',
                                preferredContactMethod: 'phone'
                              });
                              setSubmitMessage('');
                              setEstimatedPrice(0);
                            }}
                            className="text-gray-600 hover:text-gray-800 font-medium"
                          >
                            จองใหม่อีกครั้ง
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl text-white">📋</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      ตรวจสอบข้อมูลและส่งคำขอจอง
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-8 text-left max-w-2xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><span className="font-semibold">ชื่อ:</span> {formData.customerName}</div>
                        <div><span className="font-semibold">เบอร์:</span> {formData.customerPhone}</div>
                        <div><span className="font-semibold">ประเภทงาน:</span> {eventTypes.find(t => t.value === formData.eventType)?.label}</div>
                        <div><span className="font-semibold">วันที่:</span> {formData.eventDate}</div>
                        <div><span className="font-semibold">จำนวนแขก:</span> {formData.guestCount} คน</div>
                        <div><span className="font-semibold">บริการ:</span> {serviceTypes.find(s => s.value === formData.serviceType)?.label}</div>
                        {estimatedPrice > 0 && (
                          <div className="md:col-span-2">
                            <span className="font-semibold">ราคาประเมิน:</span> 
                            <span className="text-xl font-bold text-orange-600 ml-2">
                              ฿{estimatedPrice.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
              {currentStep > 1 && currentStep < 4 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  ← ย้อนกลับ
                </button>
              )}
              
              {currentStep < 3 && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold ml-auto"
                >
                  ถัดไป →
                </button>
              )}
              
              {currentStep === 3 && !submitMessage.includes('✅') && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold ml-auto"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังส่ง...
                    </>
                  ) : (
                    '✅ ส่งคำขอจอง'
                  )}
                </button>
              )}
            </div>
            
            {submitMessage && !submitMessage.includes('✅') && (
              <div className="mt-6 p-4 rounded-xl bg-red-100 text-red-800 border border-red-200 text-center">
                {submitMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}