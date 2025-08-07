-- RESET BOOKING SYSTEM - Simple Version
-- Run this script in Supabase SQL Editor

-- Drop existing tables and functions completely
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS service_packages CASCADE;
DROP FUNCTION IF EXISTS is_valid_email(TEXT);
DROP FUNCTION IF EXISTS is_valid_thai_phone(TEXT);
DROP FUNCTION IF EXISTS generate_booking_reference();
DROP FUNCTION IF EXISTS set_booking_reference();
DROP FUNCTION IF EXISTS update_timestamp();
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS public_booking_lookup(TEXT);
DROP FUNCTION IF EXISTS get_booking_stats(DATE, DATE);
DROP FUNCTION IF EXISTS check_booking_availability(DATE, INTEGER);
DROP VIEW IF EXISTS v_booking_summary;

-- Drop enum types
DROP TYPE IF EXISTS booking_status_type CASCADE;
DROP TYPE IF EXISTS payment_status_type CASCADE;
DROP TYPE IF EXISTS contact_method_type CASCADE;
DROP TYPE IF EXISTS venue_type_enum CASCADE;
DROP TYPE IF EXISTS event_type_enum CASCADE;

-- Create simple enum types
CREATE TYPE booking_status_type AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status_type AS ENUM ('unpaid', 'deposit_paid', 'full_paid', 'refunded');
CREATE TYPE contact_method_type AS ENUM ('phone', 'email', 'line', 'facebook');
CREATE TYPE venue_type_enum AS ENUM ('customer_venue', 'our_venue', 'hotel', 'restaurant', 'outdoor');
CREATE TYPE event_type_enum AS ENUM ('wedding', 'corporate', 'birthday', 'anniversary', 'conference', 'seminar', 'other');

-- Create simple bookings table WITHOUT complex validations
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Customer information (no complex validation)
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(25) NOT NULL,
  customer_email VARCHAR(320) NOT NULL,
  
  -- Event information
  event_type event_type_enum NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL DEFAULT '12:00:00',
  event_duration INTEGER NOT NULL DEFAULT 4,
  
  -- Venue information
  venue_type venue_type_enum NOT NULL DEFAULT 'customer_venue',
  venue_address TEXT DEFAULT '',
  venue_details TEXT DEFAULT '',
  
  -- Guest count (simple validation)
  guest_count INTEGER NOT NULL CHECK (guest_count >= 1),
  
  -- Service information
  service_type VARCHAR(50) NOT NULL DEFAULT 'to_be_discussed',
  menu_preferences TEXT DEFAULT '',
  
  -- Budget information
  budget_range VARCHAR(50) DEFAULT '',
  
  -- Special requirements
  special_requests TEXT DEFAULT '',
  dietary_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Equipment
  equipment_needed JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Status tracking
  booking_status booking_status_type NOT NULL DEFAULT 'pending',
  
  -- Pricing
  estimated_price DECIMAL(12,2) DEFAULT NULL,
  final_price DECIMAL(12,2) DEFAULT NULL,
  
  -- Payment tracking
  payment_status payment_status_type NOT NULL DEFAULT 'unpaid',
  deposit_amount DECIMAL(12,2) DEFAULT 0.0,
  
  -- Reference and tracking
  booking_reference VARCHAR(15) UNIQUE NOT NULL,
  admin_notes TEXT DEFAULT '',
  
  -- Contact preferences
  preferred_contact_method contact_method_type NOT NULL DEFAULT 'phone',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create simple booking reference generation
CREATE OR REPLACE FUNCTION generate_simple_booking_reference()
RETURNS TEXT AS $$
DECLARE
  ref_code TEXT;
  timestamp_part TEXT;
  random_part INTEGER;
BEGIN
  timestamp_part := TO_CHAR(NOW(), 'YYMMDD');
  random_part := FLOOR(RANDOM() * 10000);
  ref_code := 'FZ' || timestamp_part || LPAD(random_part::TEXT, 4, '0');
  
  -- Simple uniqueness check
  WHILE EXISTS (SELECT 1 FROM bookings WHERE booking_reference = ref_code) LOOP
    random_part := FLOOR(RANDOM() * 10000);
    ref_code := 'FZ' || timestamp_part || LPAD(random_part::TEXT, 4, '0');
  END LOOP;
  
  RETURN ref_code;
END;
$$ LANGUAGE plpgsql;

-- Create simple trigger function
CREATE OR REPLACE FUNCTION set_simple_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_reference IS NULL OR TRIM(NEW.booking_reference) = '' THEN
    NEW.booking_reference := generate_simple_booking_reference();
  END IF;
  
  NEW.updated_at := CURRENT_TIMESTAMP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trg_simple_booking_reference
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_simple_booking_reference();

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies
CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read bookings" ON bookings
  FOR SELECT USING (true);

-- Create basic indexes
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_date ON bookings(event_date);

-- Success message
SELECT 'Simple booking system created successfully!' as message;