-- 🗄️ Fuzio Catering - Booking System Database Setup
-- รัน script นี้ใน Supabase SQL Editor

-- ลบตารางเก่าถ้ามี (ระวัง! จะลบข้อมูล)
-- DROP TABLE IF EXISTS bookings CASCADE;
-- DROP TABLE IF EXISTS service_packages CASCADE;

-- สร้างตารางการจองหลัก
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- ข้อมูลลูกค้า
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  
  -- ข้อมูลงาน
  event_type VARCHAR(50) NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME DEFAULT '12:00:00',
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
  dietary_requirements JSONB DEFAULT '[]'::jsonb,
  
  -- อุปกรณ์เพิ่มเติม  
  equipment_needed JSONB DEFAULT '[]'::jsonb,
  
  -- สถานะการจอง
  booking_status VARCHAR(20) DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  
  -- การคำนวณราคา
  estimated_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  
  -- การชำระเงิน
  payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'deposit_paid', 'full_paid')),
  deposit_amount DECIMAL(10,2),
  
  -- ข้อมูลการติดตาม
  booking_reference VARCHAR(20) UNIQUE NOT NULL DEFAULT '',
  admin_notes TEXT,
  
  -- ข้อมูลการติดต่อ
  preferred_contact_method VARCHAR(20) DEFAULT 'phone' CHECK (preferred_contact_method IN ('phone', 'email', 'line')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง indexes เพื่อความเร็ว
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone ON bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- สร้างตารางแพ็กเกจบริการ
CREATE TABLE IF NOT EXISTS service_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_name VARCHAR(255) NOT NULL,
  service_type VARCHAR(50) NOT NULL,
  description TEXT,
  price_per_person DECIMAL(8,2),
  min_guests INTEGER,
  max_guests INTEGER,
  included_items JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- สร้างฟังก์ชันสำหรับสร้าง booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
  ref_code TEXT;
  counter INTEGER := 0;
  max_attempts INTEGER := 10;
BEGIN
  LOOP
    ref_code := 'FZ' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    
    -- ตรวจสอบว่า reference ไม่ซ้ำ
    IF NOT EXISTS (SELECT 1 FROM bookings WHERE booking_reference = ref_code) THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    IF counter >= max_attempts THEN
      ref_code := 'FZ' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(EXTRACT(EPOCH FROM NOW())::INTEGER % 10000::TEXT, 4, '0');
      EXIT;
    END IF;
  END LOOP;
  
  RETURN ref_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger สำหรับสร้าง booking reference อัตโนมัติ
CREATE OR REPLACE FUNCTION set_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  -- สร้าง booking reference ถ้ายังไม่มี
  IF NEW.booking_reference IS NULL OR NEW.booking_reference = '' THEN
    NEW.booking_reference := generate_booking_reference();
  END IF;
  
  -- อัปเดต timestamp
  NEW.updated_at := CURRENT_TIMESTAMP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- สร้าง trigger
DROP TRIGGER IF EXISTS booking_reference_trigger ON bookings;
CREATE TRIGGER booking_reference_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_booking_reference();

-- ใส่ข้อมูลแพ็กเกจตัวอย่าง
INSERT INTO service_packages (package_name, service_type, description, price_per_person, min_guests, max_guests, included_items) 
VALUES
('บุฟเฟต์มาตรฐาน', 'buffet_standard', 'บุฟเฟต์อาหารไทย-สากล หลากหลาย 15 เมนู', 450.00, 30, 200, '["อาหารจานหลัก 8 เมนู", "ของหวาน 3 เมนู", "ผลไม้ตามฤดูกาล", "น้ำดื่ม", "น้ำแข็ง", "โต๊ะบุฟเฟต์", "อุปกรณ์เสิร์ฟ"]'::jsonb),

('บุฟเฟต์พรีเมี่ยม', 'buffet_premium', 'บุฟเฟต์อาหารระดับโรงแรม 20 เมนู', 650.00, 50, 300, '["อาหารจานหลัก 12 เมนู", "อาหารทะเล 3 เมนู", "ของหวาน 4 เมนู", "ผลไม้", "น้ำดื่ม", "โต๊ะบุฟเฟต์", "การตกแต่ง", "พนักงานเสิร์ฟ"]'::jsonb),

('เซ็ตเมนูแต่งงาน', 'set_menu_wedding', 'เซ็ตเมนูงานแต่งงาน 9 คำ', 850.00, 100, 500, '["เมนูจีน 9 คำ", "ขนมหวานแต่งงาน", "ผลไม้", "น้ำดื่ม", "การจัดโต๊ะ", "ดอกไม้ประดับโต๊ะ"]'::jsonb),

('ค็อกเทลปาร์ตี้', 'cocktail', 'อาหารว่างและเครื่องดื่มสำหรับงานค็อกเทล', 320.00, 20, 150, '["อาหารว่าง 8 ชนิด", "เครื่องดื่มไม่มีแอลกอฮอล์", "น้ำแข็ง", "แก้วเสิร์ฟ", "อุปกรณ์จัดเลี้ยง"]'::jsonb),

('คอฟฟี่เบรก', 'coffee_break', 'ขนมและเครื่องดื่มสำหรับพักรับประทาน', 180.00, 10, 100, '["ขนม 4 ชนิด", "กาแฟ/ชา", "น้ำดื่ม", "ถ้วยกาแฟ", "จานขนม"]'::jsonb),

('สแน็คบ็อกซ์', 'snack_box', 'กล่องอาหารว่างพร้อมเครื่องดื่ม', 120.00, 10, 200, '["กล่องขนม", "เครื่องดื่ม 1 ขวด", "ช้อนส้อม", "ผ้าเช็ดปาก"]'::jsonb)

ON CONFLICT (package_name) DO NOTHING;

-- Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;

-- Policy สำหรับ service packages (อ่านได้ทุกคน)
DROP POLICY IF EXISTS "Public can read service packages" ON service_packages;
CREATE POLICY "Public can read service packages" ON service_packages
  FOR SELECT USING (is_active = true);

-- Policy สำหรับการสร้างการจอง (ทุกคนสร้างได้)
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;
CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Policy สำหรับอ่านการจอง (อ่านได้ทุกคน - สำหรับ demo)
-- ในการใช้งานจริงควรจำกัดเฉพาะ admin หรือ owner
DROP POLICY IF EXISTS "Public can read bookings" ON bookings;
CREATE POLICY "Public can read bookings" ON bookings
  FOR SELECT USING (true);

-- Policy สำหรับแก้ไขการจอง (แก้ไขได้ทุกคน - สำหรับ demo) 
-- ในการใช้งานจริงควรจำกัดเฉพาะ admin
DROP POLICY IF EXISTS "Public can update bookings" ON bookings;
CREATE POLICY "Public can update bookings" ON bookings
  FOR UPDATE USING (true);

-- สร้างข้อมูลทดสอบ (ถ้าต้องการ)
/*
INSERT INTO bookings (
  customer_name, customer_phone, customer_email, 
  event_type, event_date, guest_count, service_type, budget_range
) VALUES 
('ทดสอบ ระบบ', '081-234-5678', 'test@example.com', 
 'wedding', '2024-12-25', 100, 'buffet_premium', '50000-100000');
*/

-- แสดงผลลัพธ์
SELECT 
  'สร้างฐานข้อมูลสำเร็จ!' as message,
  (SELECT COUNT(*) FROM bookings) as total_bookings,
  (SELECT COUNT(*) FROM service_packages) as total_packages;

-- แสดงแพ็กเกจทั้งหมด
SELECT package_name, service_type, price_per_person FROM service_packages ORDER BY price_per_person;