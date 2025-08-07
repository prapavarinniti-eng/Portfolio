-- Fuzio Catering - Production Booking System Database Setup
-- Run this script in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if needed (CAUTION: This will delete data!)
-- DROP TABLE IF EXISTS bookings CASCADE;
-- DROP TABLE IF EXISTS service_packages CASCADE;

-- Create enum types for better data integrity
CREATE TYPE booking_status_type AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status_type AS ENUM ('unpaid', 'deposit_paid', 'full_paid', 'refunded');
CREATE TYPE contact_method_type AS ENUM ('phone', 'email', 'line', 'facebook');
CREATE TYPE venue_type_enum AS ENUM ('customer_venue', 'our_venue', 'hotel', 'restaurant', 'outdoor');
CREATE TYPE event_type_enum AS ENUM ('wedding', 'corporate', 'birthday', 'anniversary', 'conference', 'seminar', 'other');

-- Function to validate email format
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate Thai phone number
CREATE OR REPLACE FUNCTION is_valid_thai_phone(phone TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
  -- Allow formats: 08X-XXX-XXXX, 08XXXXXXXX, +6608XXXXXXXX
  RETURN phone ~* '^(\+66|0)[0-9]{8,9}$' OR phone ~* '^[0-9]{2,3}-[0-9]{3}-[0-9]{4}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create main bookings table with enhanced constraints
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Customer information with validation
  customer_name VARCHAR(255) NOT NULL CHECK (LENGTH(TRIM(customer_name)) >= 2),
  customer_phone VARCHAR(25) NOT NULL CHECK (is_valid_thai_phone(customer_phone)),
  customer_email VARCHAR(320) NOT NULL CHECK (is_valid_email(customer_email)),
  
  -- Event information
  event_type event_type_enum NOT NULL,
  event_date DATE NOT NULL CHECK (event_date >= CURRENT_DATE),
  event_time TIME NOT NULL DEFAULT '12:00:00',
  event_duration INTEGER NOT NULL DEFAULT 4 CHECK (event_duration BETWEEN 1 AND 24),
  
  -- Venue information
  venue_type venue_type_enum NOT NULL DEFAULT 'customer_venue',
  venue_address TEXT CHECK (venue_type = 'our_venue' OR LENGTH(TRIM(venue_address)) > 0),
  venue_details TEXT,
  
  -- Guest count with realistic limits
  guest_count INTEGER NOT NULL CHECK (guest_count BETWEEN 10 AND 2000),
  
  -- Service information
  service_type VARCHAR(50) NOT NULL,
  menu_preferences TEXT,
  
  -- Budget information
  budget_range VARCHAR(50),
  
  -- Special requirements with JSON validation
  special_requests TEXT,
  dietary_requirements JSONB NOT NULL DEFAULT '[]'::jsonb 
    CHECK (jsonb_typeof(dietary_requirements) = 'array'),
  
  -- Equipment with JSON validation
  equipment_needed JSONB NOT NULL DEFAULT '[]'::jsonb 
    CHECK (jsonb_typeof(equipment_needed) = 'array'),
  
  -- Status tracking
  booking_status booking_status_type NOT NULL DEFAULT 'pending',
  
  -- Pricing with validation
  estimated_price DECIMAL(12,2) CHECK (estimated_price IS NULL OR estimated_price >= 0),
  final_price DECIMAL(12,2) CHECK (final_price IS NULL OR final_price >= 0),
  
  -- Payment tracking
  payment_status payment_status_type NOT NULL DEFAULT 'unpaid',
  deposit_amount DECIMAL(12,2) DEFAULT 0 CHECK (deposit_amount >= 0),
  
  -- Reference and tracking
  booking_reference VARCHAR(15) UNIQUE NOT NULL,
  admin_notes TEXT,
  
  -- Contact preferences
  preferred_contact_method contact_method_type NOT NULL DEFAULT 'phone',
  
  -- Audit timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Additional constraints
  CONSTRAINT valid_deposit_amount CHECK (
    deposit_amount <= COALESCE(final_price, estimated_price, 999999)
  ),
  CONSTRAINT valid_pricing CHECK (
    final_price IS NULL OR estimated_price IS NULL OR final_price >= estimated_price * 0.5
  )
);

-- Create optimized indexes for performance
-- Single column indexes
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON bookings(event_date) 
  WHERE booking_status != 'cancelled';
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone ON bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_service_type ON bookings(service_type);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_bookings_date_status ON bookings(event_date, booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_status_created ON bookings(booking_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_lookup ON bookings(customer_phone, customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_event_service ON bookings(event_type, service_type);

-- JSONB indexes for dietary requirements and equipment
CREATE INDEX IF NOT EXISTS idx_bookings_dietary_gin ON bookings USING GIN(dietary_requirements);
CREATE INDEX IF NOT EXISTS idx_bookings_equipment_gin ON bookings USING GIN(equipment_needed);

-- Create service packages table with enhanced validation
CREATE TABLE IF NOT EXISTS service_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_name VARCHAR(255) NOT NULL UNIQUE,
  service_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL CHECK (LENGTH(TRIM(description)) > 0),
  price_per_person DECIMAL(10,2) NOT NULL CHECK (price_per_person >= 0),
  min_guests INTEGER NOT NULL DEFAULT 1 CHECK (min_guests >= 1),
  max_guests INTEGER CHECK (max_guests IS NULL OR max_guests >= min_guests),
  included_items JSONB NOT NULL DEFAULT '[]'::jsonb 
    CHECK (jsonb_typeof(included_items) = 'array'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraint to ensure logical guest limits
  CONSTRAINT valid_guest_range CHECK (max_guests IS NULL OR max_guests >= min_guests)
);

-- Index for service packages
CREATE INDEX IF NOT EXISTS idx_service_packages_type_active ON service_packages(service_type, is_active);
CREATE INDEX IF NOT EXISTS idx_service_packages_active_sort ON service_packages(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_service_packages_price ON service_packages(price_per_person) WHERE is_active = true;

-- Enhanced booking reference generation with collision safety
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
  ref_code TEXT;
  base_code TEXT;
  counter INTEGER := 0;
  max_attempts INTEGER := 50;
  random_part INTEGER;
  timestamp_part TEXT;
BEGIN
  -- Use date and hour for better distribution
  timestamp_part := TO_CHAR(NOW(), 'YYMMDD');
  base_code := 'FZ' || timestamp_part;
  
  LOOP
    -- Generate 4-digit random number for better uniqueness
    random_part := FLOOR(RANDOM() * 10000);
    ref_code := base_code || LPAD(random_part::TEXT, 4, '0');
    
    -- Check if reference is unique (with advisory lock to prevent race conditions)
    PERFORM pg_advisory_lock(hashtext(ref_code));
    
    IF NOT EXISTS (SELECT 1 FROM bookings WHERE booking_reference = ref_code) THEN
      PERFORM pg_advisory_unlock(hashtext(ref_code));
      EXIT;
    END IF;
    
    PERFORM pg_advisory_unlock(hashtext(ref_code));
    
    counter := counter + 1;
    IF counter >= max_attempts THEN
      -- Fallback: use microseconds for absolute uniqueness
      ref_code := base_code || LPAD((EXTRACT(MICROSECONDS FROM NOW())::INTEGER % 10000)::TEXT, 4, '0');
      
      -- Final check and force uniqueness if needed
      WHILE EXISTS (SELECT 1 FROM bookings WHERE booking_reference = ref_code) LOOP
        ref_code := base_code || LPAD((RANDOM() * 10000)::INTEGER::TEXT, 4, '0');
      END LOOP;
      
      EXIT;
    END IF;
  END LOOP;
  
  RETURN ref_code;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Enhanced trigger function with validation and audit
CREATE OR REPLACE FUNCTION set_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate booking reference if not provided or empty
  IF NEW.booking_reference IS NULL OR TRIM(NEW.booking_reference) = '' THEN
    NEW.booking_reference := generate_booking_reference();
  END IF;
  
  -- Validate booking reference format (FZ + 6 digits + 4 digits)
  IF NEW.booking_reference !~ '^FZ[0-9]{6}[0-9]{4}$' THEN
    RAISE EXCEPTION 'Invalid booking reference format. Expected: FZYYMMDDxxxx, got: %', NEW.booking_reference;
  END IF;
  
  -- Set updated timestamp
  NEW.updated_at := CURRENT_TIMESTAMP;
  
  -- Validate event date is not in the past (allow same day bookings)
  IF NEW.event_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Event date cannot be in the past. Date provided: %', NEW.event_date;
  END IF;
  
  -- Validate deposit doesn't exceed final/estimated price
  IF NEW.deposit_amount > COALESCE(NEW.final_price, NEW.estimated_price, 999999) THEN
    RAISE EXCEPTION 'Deposit amount (%) cannot exceed the booking price (%)', 
      NEW.deposit_amount, COALESCE(NEW.final_price, NEW.estimated_price);
  END IF;
  
  -- Auto-set payment status based on amounts
  IF TG_OP = 'UPDATE' AND OLD.deposit_amount != NEW.deposit_amount THEN
    IF NEW.deposit_amount = 0 THEN
      NEW.payment_status := 'unpaid';
    ELSIF NEW.final_price IS NOT NULL AND NEW.deposit_amount >= NEW.final_price THEN
      NEW.payment_status := 'full_paid';
    ELSIF NEW.deposit_amount > 0 THEN
      NEW.payment_status := 'deposit_paid';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers with proper naming
DROP TRIGGER IF EXISTS booking_reference_trigger ON bookings;
DROP TRIGGER IF EXISTS trg_bookings_reference_and_audit ON bookings;

CREATE TRIGGER trg_bookings_reference_and_audit
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_booking_reference();

-- Create trigger for service packages updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_service_packages_updated_at ON service_packages;
CREATE TRIGGER trg_service_packages_updated_at
  BEFORE UPDATE ON service_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Insert sample service packages with proper validation
INSERT INTO service_packages (package_name, service_type, description, price_per_person, min_guests, max_guests, included_items, sort_order) 
VALUES
('Standard Buffet', 'buffet_standard', 'Thai-International buffet with 15 diverse menu items including appetizers, main courses, and desserts', 450.00, 30, 200, '[
  "8 main course dishes",
  "3 dessert options", 
  "Seasonal fruits",
  "Drinking water",
  "Ice",
  "Buffet tables",
  "Serving equipment",
  "Basic table setup"
]'::jsonb, 1),

('Premium Buffet', 'buffet_premium', 'Hotel-grade buffet featuring 20 premium menu items with seafood and premium ingredients', 650.00, 50, 300, '[
  "12 main course dishes",
  "3 seafood specialties",
  "4 premium desserts",
  "Fresh fruit selection",
  "Premium beverages",
  "Elegant buffet setup",
  "Table decorations",
  "Professional service staff",
  "Upgraded serving equipment"
]'::jsonb, 2),

('Wedding Set Menu', 'set_menu_wedding', 'Traditional 9-course Chinese wedding banquet with ceremonial presentation', 850.00, 100, 500, '[
  "9-course Chinese banquet",
  "Wedding cake service",
  "Fruit platter",
  "Tea service",
  "Premium table setting",
  "Floral centerpieces",
  "Professional presentation",
  "Ceremonial service"
]'::jsonb, 3),

('Cocktail Party', 'cocktail', 'Elegant cocktail reception with canapes and premium beverages', 320.00, 20, 150, '[
  "8 types of canapés",
  "Premium non-alcoholic beverages",
  "Ice service",
  "Cocktail glassware",
  "Cocktail tables",
  "Appetizer displays",
  "Professional bartender service"
]'::jsonb, 4),

('Coffee Break', 'coffee_break', 'Professional coffee break service ideal for meetings and conferences', 180.00, 10, 100, '[
  "4 types of pastries",
  "Premium coffee and tea",
  "Bottled water",
  "Coffee cups and saucers",
  "Pastry plates",
  "Sugar and cream service",
  "Disposable stirrers"
]'::jsonb, 5),

('Snack Box', 'snack_box', 'Individual snack boxes perfect for events and meetings', 120.00, 10, 200, '[
  "Premium snack box",
  "1 beverage bottle",
  "Disposable utensils",
  "Napkins",
  "Individual packaging"
]'::jsonb, 6)

ON CONFLICT (package_name) DO UPDATE SET
  description = EXCLUDED.description,
  price_per_person = EXCLUDED.price_per_person,
  min_guests = EXCLUDED.min_guests,
  max_guests = EXCLUDED.max_guests,
  included_items = EXCLUDED.included_items,
  sort_order = EXCLUDED.sort_order,
  updated_at = CURRENT_TIMESTAMP;

-- Enable Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;

-- Create admin role check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin role in JWT or auth.users metadata
  RETURN (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Service Packages Policies (Public read access for active packages)
DROP POLICY IF EXISTS "Public can read active service packages" ON service_packages;
CREATE POLICY "Public can read active service packages" ON service_packages
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin can manage service packages" ON service_packages;
CREATE POLICY "Admin can manage service packages" ON service_packages
  FOR ALL USING (is_admin());

-- Bookings Policies (More restrictive for production)

-- Allow anyone to create bookings (customer-facing booking form)
DROP POLICY IF EXISTS "Public can create bookings" ON bookings;
CREATE POLICY "Public can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Allow customers to read their own bookings by phone/email
DROP POLICY IF EXISTS "Customers can read own bookings" ON bookings;
CREATE POLICY "Customers can read own bookings" ON bookings
  FOR SELECT USING (
    -- Allow if admin
    is_admin() OR
    -- Allow if accessing via booking reference (public lookup)
    booking_reference = current_setting('app.booking_reference', true) OR
    -- Allow if authenticated user matches customer email
    (auth.jwt() ->> 'email' = customer_email)
  );

-- Only admin can update bookings
DROP POLICY IF EXISTS "Admin can update bookings" ON bookings;
CREATE POLICY "Admin can update bookings" ON bookings
  FOR UPDATE USING (is_admin());

-- Only admin can delete bookings
DROP POLICY IF EXISTS "Admin can delete bookings" ON bookings;
CREATE POLICY "Admin can delete bookings" ON bookings
  FOR DELETE USING (is_admin());

-- Function to lookup booking by reference (bypasses RLS for public lookup)
CREATE OR REPLACE FUNCTION public_booking_lookup(ref_code TEXT)
RETURNS TABLE (
  booking_reference TEXT,
  customer_name TEXT,
  event_type TEXT,
  event_date DATE,
  event_time TIME,
  guest_count INTEGER,
  service_type TEXT,
  booking_status TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Validate reference format
  IF ref_code !~ '^FZ[0-9]{10}$' THEN
    RAISE EXCEPTION 'Invalid booking reference format';
  END IF;
  
  -- Set session variable for RLS policy
  PERFORM set_config('app.booking_reference', ref_code, true);
  
  RETURN QUERY
  SELECT 
    b.booking_reference,
    b.customer_name,
    b.event_type::TEXT,
    b.event_date,
    b.event_time,
    b.guest_count,
    b.service_type,
    b.booking_status::TEXT,
    b.created_at
  FROM bookings b
  WHERE b.booking_reference = ref_code;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Additional utility functions for the booking system

-- Function to get booking statistics
CREATE OR REPLACE FUNCTION get_booking_stats(start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL)
RETURNS TABLE (
  total_bookings BIGINT,
  pending_bookings BIGINT,
  confirmed_bookings BIGINT,
  completed_bookings BIGINT,
  cancelled_bookings BIGINT,
  total_revenue DECIMAL,
  average_booking_value DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_bookings,
    COUNT(*) FILTER (WHERE booking_status = 'pending') as pending_bookings,
    COUNT(*) FILTER (WHERE booking_status = 'confirmed') as confirmed_bookings,
    COUNT(*) FILTER (WHERE booking_status = 'completed') as completed_bookings,
    COUNT(*) FILTER (WHERE booking_status = 'cancelled') as cancelled_bookings,
    COALESCE(SUM(final_price), 0) as total_revenue,
    COALESCE(AVG(final_price), 0) as average_booking_value
  FROM bookings
  WHERE (start_date IS NULL OR event_date >= start_date)
    AND (end_date IS NULL OR event_date <= end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check booking availability on specific date
CREATE OR REPLACE FUNCTION check_booking_availability(check_date DATE, required_duration INTEGER DEFAULT 4)
RETURNS TABLE (
  date_available BOOLEAN,
  existing_bookings INTEGER,
  suggested_times TIME[]
) AS $$
DECLARE
  existing_count INTEGER;
  available_slots TIME[] := ARRAY[]::TIME[];
  slot_time TIME;
BEGIN
  -- Count existing confirmed bookings on the date
  SELECT COUNT(*) INTO existing_count
  FROM bookings
  WHERE event_date = check_date 
    AND booking_status IN ('confirmed', 'pending');
  
  -- Suggest available time slots (basic logic)
  FOR slot_time IN 
    SELECT time_slot FROM (
      VALUES ('10:00'::TIME), ('12:00'::TIME), ('14:00'::TIME), 
             ('16:00'::TIME), ('18:00'::TIME), ('20:00'::TIME)
    ) AS slots(time_slot)
  LOOP
    -- Check if slot is available (simplified logic)
    IF NOT EXISTS (
      SELECT 1 FROM bookings 
      WHERE event_date = check_date 
        AND booking_status IN ('confirmed', 'pending')
        AND event_time = slot_time
    ) THEN
      available_slots := array_append(available_slots, slot_time);
    END IF;
  END LOOP;
  
  RETURN QUERY
  SELECT 
    (existing_count < 5) as date_available,  -- Max 5 events per day
    existing_count,
    available_slots;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create sample test data (commented out for production)
/*
-- Sample bookings for testing (uncomment if needed)
INSERT INTO bookings (
  customer_name, customer_phone, customer_email, 
  event_type, event_date, guest_count, service_type, 
  budget_range, estimated_price, booking_status
) VALUES 
('John Smith', '081-234-5678', 'john@example.com', 
 'wedding', CURRENT_DATE + INTERVAL '30 days', 150, 'buffet_premium', 
 '50000-100000', 97500.00, 'confirmed'),

('Jane Doe', '082-345-6789', 'jane@example.com',
 'corporate', CURRENT_DATE + INTERVAL '15 days', 80, 'buffet_standard',
 '30000-50000', 36000.00, 'pending'),

('Bob Johnson', '083-456-7890', 'bob@example.com',
 'birthday', CURRENT_DATE + INTERVAL '7 days', 50, 'cocktail',
 '10000-20000', 16000.00, 'confirmed');
*/

-- Performance monitoring views (for admin use)
CREATE OR REPLACE VIEW v_booking_summary AS
SELECT 
  DATE_TRUNC('month', event_date) as event_month,
  booking_status,
  COUNT(*) as booking_count,
  SUM(guest_count) as total_guests,
  AVG(guest_count) as avg_guests_per_booking,
  SUM(final_price) as total_revenue,
  AVG(final_price) as avg_booking_value
FROM bookings
WHERE event_date >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY DATE_TRUNC('month', event_date), booking_status
ORDER BY event_month DESC, booking_status;

-- Grant permissions to authenticated users for the view
GRANT SELECT ON v_booking_summary TO authenticated;

-- Final database setup confirmation
SELECT 
  'Database setup completed successfully!' as message,
  (SELECT COUNT(*) FROM bookings) as total_bookings,
  (SELECT COUNT(*) FROM service_packages) as total_packages,
  (SELECT COUNT(*) FROM service_packages WHERE is_active = true) as active_packages;

-- Display all service packages
SELECT 
  package_name,
  service_type,
  price_per_person,
  min_guests,
  max_guests,
  is_active
FROM service_packages 
ORDER BY sort_order, price_per_person;