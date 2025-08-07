import Link from 'next/link';

export default function BookingPage() {
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

      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-8 shadow-xl">
              <span className="text-3xl text-white">📞</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              ติดต่อจองบริการ
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              พร้อมให้บริการจัดเลี้ยงครบวงจร สำหรับทุกโอกาสพิเศษของคุณ<br/>
              ติดต่อเราโดยตรงเพื่อปรึกษารายละเอียดและรับใบเสนอราคา
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Phone Contact */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all hover:scale-105">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">โทรศัพท์</h3>
              <p className="text-3xl font-bold text-orange-600 mb-4">081-514-6939</p>
              <p className="text-gray-600 mb-6">
                เปิดรับสาย: จันทร์-เสาร์ 8:00-20:00<br/>
                อาทิตย์ 9:00-18:00
              </p>
              <a 
                href="tel:0815146939"
                className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                📞 โทรเลย
              </a>
            </div>

            {/* Email Contact */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all hover:scale-105">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">อีเมล</h3>
              <p className="text-xl font-bold text-blue-600 mb-4 break-all">prapavarinniti@gmail.com</p>
              <p className="text-gray-600 mb-6">
                ส่งรายละเอียดงาน ภาพอ้างอิง<br/>
                เราจะตอบกลับภายใน 24 ชั่วโมง
              </p>
              <a 
                href="mailto:prapavarinniti@gmail.com?subject=สอบถามบริการจัดเลี้ยง&body=สวัสดีครับ/ค่ะ%0A%0Aต้องการสอบถามบริการจัดเลี้ยง%0A%0Aประเภทงาน: %0Aวันที่: %0าจำนวนแขก: %0าสถานที่: %0A%0Aขอบคุณครับ/ค่ะ"
                className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                📧 ส่งอีเมล
              </a>
            </div>
          </div>

          {/* Office Info */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">🏢</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">สำนักงาน</h3>
            <p className="text-xl text-gray-700 mb-4">Royal Suite Hotel, Bangkok</p>
            <p className="text-gray-600">
              📍 ให้บริการทั่วกรุงเทพฯ และปริมณฑล<br/>
              🚚 มีบริการขนส่งอุปกรณ์และตกแต่งสถานที่
            </p>
          </div>

          {/* Service Types */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">บริการของเรา</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: '💒', title: 'งานแต่งงาน', desc: 'งานแต่งงาน งานหมั้น งานฉลอง' },
                { icon: '🏢', title: 'งานบริษัท', desc: 'สัมนา ประชุม งานเลี้ยงปีใหม่' },
                { icon: '🎂', title: 'งานเฉลิมฉลอง', desc: 'วันเกิด รับปริญญา งานบุญ' }
              ].map((service, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h4>
                  <p className="text-gray-600">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Booking Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4 shadow-lg">
                <span className="text-2xl text-white">🚀</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">จองด่วนออนไลน์</h2>
              <p className="text-gray-600">กรอกข้อมูลพื้นฐาน เราจะ<strong>บันทึกข้อมูลไว้ในระบบ</strong>และติดต่อกลับภายใน 2 ชั่วโมง</p>
            </div>

            <form className="space-y-6 max-w-2xl mx-auto" onSubmit={async (e) => {
              e.preventDefault();
              
              const submitButton = e.currentTarget.querySelector('button[type="submit"]') as HTMLButtonElement;
              const originalText = submitButton.innerHTML;
              
              try {
                // Disable button and show loading
                submitButton.disabled = true;
                submitButton.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>กำลังส่งข้อมูล...';
                
                const formData = new FormData(e.target as HTMLFormElement);
                const data = Object.fromEntries(formData.entries());
                
                // First, save to our system
                const response = await fetch('/api/booking-form', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                });

                const result = await response.json();
                
                if (response.ok) {
                  // Success! Show booking reference
                  alert(`✅ บันทึกข้อมูลสำเร็จ!
รหัสการจอง: ${result.reference}

เราจะติดต่อกลับภายใน 2 ชั่วโมง
กรุณาเก็บรหัสนี้ไว้สำหรับการติดตาม`);
                  
                  // Create WhatsApp message with booking reference
                  const message = `🍽️ Fuzio Catering - จองบริการออนไลน์

📋 รหัสการจอง: ${result.reference}

📋 รายละเอียดการจอง:
👤 ชื่อ: ${data.name}
📞 เบอร์: ${data.phone}
📧 อีเมล: ${data.email}
🎉 ประเภทงาน: ${data.eventType}
📅 วันที่: ${data.eventDate}
👥 จำนวนแขก: ${data.guestCount} คน
📍 สถานที่: ${data.location || 'ไม่ได้ระบุ'}
💬 รายละเอียด: ${data.details || 'ไม่ได้ระบุ'}

ขอใบเสนอราคาครับ/ค่ะ`;

                  // Open WhatsApp
                  const whatsappUrl = `https://wa.me/66815146939?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                  
                  // Reset form
                  (e.target as HTMLFormElement).reset();
                  
                } else {
                  // Error saving data
                  alert(`❌ เกิดข้อผิดพลาด: ${result.error}`);
                }
                
              } catch (error) {
                alert('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
              } finally {
                // Re-enable button
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
              }
            }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อ-นามสกุล *</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                    placeholder="กรอกชื่อ-นามสกุล"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">เบอร์โทร *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                    placeholder="081-234-5678"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">อีเมล *</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                  placeholder="your@email.com"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ประเภทงาน *</label>
                  <select 
                    name="eventType" 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">เลือกประเภทงาน</option>
                    <option value="งานแต่งงาน">💒 งานแต่งงาน</option>
                    <option value="งานบริษัท">🏢 งานบริษัท</option>
                    <option value="งานวันเกิด">🎂 งานวันเกิด</option>
                    <option value="งานรับปริญญา">🎓 งานรับปริญญา</option>
                    <option value="งานบุญ">🙏 งานบุญ</option>
                    <option value="อื่นๆ">✨ อื่นๆ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">วันที่งาน *</label>
                  <input 
                    type="date" 
                    name="eventDate" 
                    required 
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">จำนวนแขก *</label>
                  <select 
                    name="guestCount" 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">จำนวนแขก</option>
                    <option value="10-30">10-30 คน</option>
                    <option value="31-50">31-50 คน</option>
                    <option value="51-100">51-100 คน</option>
                    <option value="101-200">101-200 คน</option>
                    <option value="201-500">201-500 คน</option>
                    <option value="500+">มากกว่า 500 คน</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">สถานที่</label>
                  <input 
                    type="text" 
                    name="location" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                    placeholder="โรงแรม/ห้องจัดเลี้ยง/บ้าน"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">รายละเอียดเพิ่มเติม</label>
                <textarea 
                  name="details" 
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                  placeholder="ธีม สี ประเภทอาหารที่ต้องการ งบประมาณ หรือความต้องการพิเศษอื่น ๆ"
                ></textarea>
              </div>

              <div className="text-center">
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-full font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                  📋 บันทึกและส่ง WhatsApp
                </button>
                <p className="text-sm text-gray-500 mt-3">
                  บันทึกข้อมูลในระบบ + เปิด WhatsApp พร้อมข้อความ พร้อมรหัสจอง
                </p>
              </div>
            </form>
          </div>

          {/* Alternative Contact */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4 text-center">หรือติดต่อโดยตรง</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:0815146939"
                className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
              >
                📞 081-514-6939
              </a>
              <a 
                href="mailto:prapavarinniti@gmail.com"
                className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
              >
                📧 ส่งอีเมล
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}