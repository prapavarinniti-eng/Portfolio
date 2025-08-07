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

          {/* CTA */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">พร้อมให้บริการแล้ว!</h2>
            <p className="text-xl mb-8 opacity-90">
              ติดต่อเราวันนี้เพื่อปรึกษาและรับใบเสนอราคาฟรี
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:0815146939"
                className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                📞 081-514-6939
              </a>
              <a 
                href="mailto:prapavarinniti@gmail.com"
                className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
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