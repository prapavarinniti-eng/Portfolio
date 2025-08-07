# 🗄️ คู่มือสร้างฐานข้อมูล Supabase

## ขั้นตอนการสร้างตารางสำหรับระบบจองออนไลน์

### 1. เข้าไปที่ Supabase Dashboard
- ไปที่ https://supabase.com/dashboard
- เลือกโปรเจกต์ของคุณ
- ไปที่ SQL Editor

### 2. รัน SQL Code นี้:

```sql
-- Booking System Database Schema
-- สร้างตารางสำหรับระบบจองออนไลน์

-- ตารางการจองหลัก
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- ข้อมูลลูกค้า
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  
  -- ข้อมูลงาน
  event_type VARCHAR(50) NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  event_duration INTEGER DEFAULT 4,
  
  -- สถานที่
  venue_type VARCHAR(20) DEFAULT 'customer_venue',
  venue_address TEXT,
  venue_details TEXT,
  
  -- จำนวนคน
  guest_count INTEGER NOT NULL,
  
  -- ประเภทบริการ
  service_type VARCHAR(50) NOT NULL,
  menu_preferences TEXT,
  
  -- งบประมาณ
  budget_range VARCHAR(50),
  
  -- ความต้องการพิเศษ
  special_requests TEXT,
  dietary_requirements JSONB DEFAULT '[]',
  
  -- อุปกรณ์เพิ่มเติม
  equipment_needed JSONB DEFAULT '[]',
  
  -- สถานะการจอง
  booking_status VARCHAR(20) DEFAULT 'pending',
  
  -- การคำนวณราคา
  estimated_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  
  -- การชำระเงิน
  payment_status VARCHAR(20) DEFAULT 'unpaid',
  deposit_amount DECIMAL(10,2),
  
  -- ข้อมูลการติดตาม
  booking_reference VARCHAR(20) UNIQUE NOT NULL,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- ข้อมูลการติดต่อ
  preferred_contact_method VARCHAR(20) DEFAULT 'phone'
);

-- สร้าง indexes เพื่อความเร็ว
CREATE INDEX idx_bookings_date ON bookings(event_date);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_customer_phone ON bookings(customer_phone);

-- สร้างฟังก์ชันสำหรับสร้าง booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
  ref_code TEXT;
BEGIN
  ref_code := 'FZ' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
  RETURN ref_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger สำหรับสร้าง booking reference อัตโนมัติ
CREATE OR REPLACE FUNCTION set_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_reference IS NULL THEN
    NEW.booking_reference := generate_booking_reference();
  END IF;
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_reference_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_booking_reference();

-- ตารางแพ็กเกจบริการ
CREATE TABLE service_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_name VARCHAR(255) NOT NULL,
  service_type VARCHAR(50) NOT NULL,
  description TEXT,
  price_per_person DECIMAL(8,2),
  min_guests INTEGER,
  max_guests INTEGER,
  included_items JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ข้อมูลแพ็กเกจตัวอย่าง
INSERT INTO service_packages (package_name, service_type, description, price_per_person, min_guests, max_guests, included_items) VALUES
('บุฟเฟต์มาตรฐาน', 'buffet_standard', 'บุฟเฟต์อาหารไทย-สากล หลากหลาย 15 เมนู', 450.00, 30, 200, '["อาหารจานหลัก 8 เมนู", "ของหวาน 3 เมนู", "ผลไม้ตามฤดูกาล", "น้ำดื่ม", "น้ำแข็ง", "โต๊ะบุฟเฟต์", "อุปกรณ์เสิร์ฟ"]'),
('บุฟเฟต์พรีเมี่ยม', 'buffet_premium', 'บุฟเฟต์อาหารระดับโรงแรม 20 เมนู', 650.00, 50, 300, '["อาหารจานหลัก 12 เมนู", "อาหารทะเล 3 เมนู", "ของหวาน 4 เมนู", "ผลไม้", "น้ำดื่ม", "โต๊ะบุฟเฟต์", "การตกแต่ง", "พนักงานเสิร์ฟ"]'),
('เซ็ตเมนูแต่งงาน', 'set_menu_wedding', 'เซ็ตเมนูงานแต่งงาน 9 คำ', 850.00, 100, 500, '["เมนูจีน 9 คำ", "ขนมหวานแต่งงาน", "ผลไม้", "น้ำดื่ม", "การจัดโต๊ะ", "ดอกไม้ประดับโต๊ะ"]');

-- Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;

-- Policy สำหรับ public access (read service packages)
CREATE POLICY "Public can read service packages" ON service_packages
  FOR SELECT USING (is_active = true);

-- Policy สำหรับการสร้างการจอง (anyone can create)
CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Policy สำหรับ admin (full access) - ใส่ admin user ID ของคุณที่นี่
-- CREATE POLICY "Admin full access bookings" ON bookings
--   FOR ALL USING (auth.uid() = 'your-admin-user-id-here');
```

### 3. ตรวจสอบการสร้างตาราง
- ไปที่ Table Editor
- ควรเห็นตาราง `bookings` และ `service_packages`

### 4. ทดสอบระบบ
- เข้าไปที่ https://portfolio-yap6.onrender.com/booking
- ลองกรอกฟอร์มและส่ง
- ตรวจสอบใน Supabase ว่ามีข้อมูลเข้ามา

### 5. ดูการจองใน Admin
- เข้าไปที่ https://portfolio-yap6.onrender.com/admin/bookings
- จะเห็นรายการจองทั้งหมด