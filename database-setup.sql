-- Database setup for Catering Portfolio
-- Create tables for customer inquiries and FAQ

-- Table: customer_inquiries
-- Store customer contact form submissions
CREATE TABLE IF NOT EXISTS customer_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('wedding', 'merit', 'corporate', 'birthday', 'graduation', 'other')),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON customer_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON customer_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_event_type ON customer_inquiries(event_type);

-- Table: faq
-- Store frequently asked questions and answers
CREATE TABLE IF NOT EXISTS faq (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for FAQ
CREATE INDEX IF NOT EXISTS idx_faq_active_order ON faq(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_faq_category ON faq(category) WHERE is_active = TRUE;

-- Insert sample FAQ data
INSERT INTO faq (question, answer, category, display_order, is_active) VALUES 
(
  'ควรจองล่วงหน้ากี่วัน?',
  'แนะนำให้จองล่วงหน้าอย่างน้อย 7-14 วัน สำหรับงานใหญ่ เช่น งานแต่งงาน ควรจองล่วงหน้า 1 เดือน เพื่อให้เราเตรียมความพร้อมได้อย่างดีที่สุด',
  'booking',
  1,
  true
),
(
  'ราคาเริ่มต้นเท่าไหร่?',
  'ราคาขึ้นอยู่กับประเภทงาน จำนวนคน และเมนูที่เลือก เริ่มต้นที่ 150 บาทต่อคน สำหรับเมนูมาตรฐาน สอบถามใบเสนอราคาฟรีได้ที่เบอร์ 065-716-5037',
  'pricing',
  2,
  true
),
(
  'มีเมนูอาหารให้เลือกหรือไม่?',
  'มีเมนูหลากหลายให้เลือก ทั้งอาหารไทย อาหารจีน อาหารญี่ปุ่น และอาหารนานาชาติ สามารถปรับแต่งเมนูตามความต้องการ และรองรับอาหารเจ อาหารฮาลาล',
  'menu',
  3,
  true
),
(
  'ให้บริการพื้นที่ไหนบ้าง?',
  'ให้บริการหลักในกรุงเทพและปริมณฑล สำหรับต่างจังหวัดสามารถให้บริการได้ โดยมีค่าเดินทางเพิ่มเติม กรุณาติดต่อสอบถามรายละเอียด',
  'service',
  4,
  true
),
(
  'รับจัดงานขั้นต่ำกี่คน?',
  'รับจัดงานตั้งแต่ 20 คนขึ้นไป สำหรับงานขนาดเล็กกว่านี้ เรามีบริการ Snack Box และอาหารว่างที่สามารถสั่งได้ตั้งแต่ 10 กล่องขึ้นไป',
  'service',
  5,
  true
),
(
  'มีบริการเค้กและของหวานไหม?',
  'มีบริการเค้ก ของหวาน และผลไม้ครบครัน สามารถออกแบบเค้กตามความต้องการ พร้อมบริการตัดเค้กในงาน และมีช่างภาพบันทึกภาพสำคัญ',
  'menu',
  6,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_inquiries_updated_at 
  BEFORE UPDATE ON customer_inquiries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_updated_at 
  BEFORE UPDATE ON faq 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for better security
ALTER TABLE customer_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your needs)
CREATE POLICY "Allow public insert on customer_inquiries" ON customer_inquiries
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public select on faq" ON faq
  FOR SELECT TO anon USING (is_active = true);

-- For authenticated admin access (you may need to adjust this based on your auth setup)
CREATE POLICY "Allow authenticated full access on inquiries" ON customer_inquiries
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated full access on faq" ON faq
  FOR ALL TO authenticated USING (true);

-- Grant permissions
GRANT SELECT, INSERT ON customer_inquiries TO anon;
GRANT SELECT ON faq TO anon;
GRANT ALL ON customer_inquiries TO authenticated;
GRANT ALL ON faq TO authenticated;