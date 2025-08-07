'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BookingPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    eventType: '',
    eventDate: '',
    guestCount: '',
    details: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`✅ จองสำเร็จ! รหัสการจอง: ${result.reference}`);
        setFormData({
          name: '',
          phone: '',
          email: '',
          eventType: '',
          eventDate: '',
          guestCount: '',
          details: ''
        });
      } else {
        setMessage(`❌ เกิดข้อผิดพลาด: ${result.error || 'ไม่สามารถจองได้'}`);
      }
    } catch (error) {
      setMessage('❌ เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-orange-600">
              🍽️ Fuzio Catering
            </Link>
            <div className="space-x-6">
              <Link href="/" className="text-gray-600 hover:text-orange-600">หน้าแรก</Link>
              <Link href="/portfolio" className="text-gray-600 hover:text-orange-600">ผลงาน</Link>
              <Link href="/contact" className="text-gray-600 hover:text-orange-600">ติดต่อ</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">📋 จองบริการ</h1>
            <p className="text-xl text-gray-600">กรอกข้อมูลเพื่อจองบริการจัดเลี้ยง</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ชื่อ-นามสกุล */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ชื่อ-นามสกุล *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>

              {/* เบอร์โทร */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  เบอร์โทรศัพท์ *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="081-234-5678"
                />
              </div>

              {/* อีเมล */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  อีเมล *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="your@email.com"
                />
              </div>

              {/* ประเภทงาน */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ประเภทงาน *
                </label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">เลือกประเภทงาน</option>
                  <option value="งานแต่งงาน">งานแต่งงาน</option>
                  <option value="งานบริษัท">งานบริษัท</option>
                  <option value="งานวันเกิด">งานวันเกิด</option>
                  <option value="งานรับปริญญา">งานรับปริญญา</option>
                  <option value="งานบุญ">งานบุญ</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              {/* วันที่งาน */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  วันที่จัดงาน *
                </label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* จำนวนแขก */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  จำนวนแขก (คน) *
                </label>
                <input
                  type="number"
                  name="guestCount"
                  value={formData.guestCount}
                  onChange={handleChange}
                  required
                  min="10"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="จำนวนแขก"
                />
              </div>

              {/* รายละเอียดเพิ่มเติม */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  รายละเอียดเพิ่มเติม
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="บอกเราเกี่ยวกับงานของคุณ เช่น สถานที่, ธีม, ความต้องการพิเศษ..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    กำลังส่งข้อมูล...
                  </div>
                ) : (
                  '✅ ส่งข้อมูลการจอง'
                )}
              </button>
            </form>

            {/* Message */}
            {message && (
              <div className={`mt-6 p-4 rounded-lg text-center font-medium ${
                message.includes('✅') 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Contact Info */}
            <div className="mt-8 text-center text-gray-600">
              <p className="text-sm">หรือติดต่อเราโดยตรง</p>
              <div className="mt-2 space-y-1">
                <p>📞 <strong>081-514-6939</strong></p>
                <p>📧 <strong>prapavarinniti@gmail.com</strong></p>
                <p>🏢 Royal Suite Hotel, Bangkok</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}