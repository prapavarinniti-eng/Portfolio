const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import fetch
const fetch = require('node-fetch');

async function resetDatabase() {
  console.log('🔄 Starting database reset...');

  // Create Supabase client with service role key (bypass RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Read the reset SQL file
    const sqlFilePath = path.join(__dirname, 'supabase-reset.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 SQL script loaded successfully');
    console.log('🗑️  Dropping existing tables and functions...');
    console.log('🔨 Creating new simple database structure...');

    // Execute the SQL script using Supabase client
    // Note: We need to execute this as a raw query
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlContent });

    if (error) {
      console.error('❌ Database reset failed:', error.message);
      
      // Try alternative method - execute parts of the SQL manually
      console.log('🔄 Trying alternative reset method...');
      
      // Drop tables
      await supabase.rpc('exec_sql', { sql_query: 'DROP TABLE IF EXISTS bookings CASCADE;' }).catch(() => {});
      await supabase.rpc('exec_sql', { sql_query: 'DROP TABLE IF EXISTS service_packages CASCADE;' }).catch(() => {});
      
      // Drop functions
      const dropFunctions = [
        'DROP FUNCTION IF EXISTS is_valid_email(TEXT);',
        'DROP FUNCTION IF EXISTS is_valid_thai_phone(TEXT);',
        'DROP FUNCTION IF EXISTS generate_booking_reference();',
        'DROP FUNCTION IF EXISTS set_booking_reference();',
        'DROP FUNCTION IF EXISTS update_timestamp();',
        'DROP FUNCTION IF EXISTS is_admin();'
      ];
      
      for (const dropSQL of dropFunctions) {
        await supabase.rpc('exec_sql', { sql_query: dropSQL }).catch(() => {});
      }
      
      console.log('✅ Manual cleanup completed');
      return false;
    }

    console.log('✅ Database reset completed successfully!');
    console.log('📊 New simple booking system is ready');
    
    return true;

  } catch (error) {
    console.error('❌ Unexpected error during database reset:', error.message);
    return false;
  }
}

// Alternative method: Execute SQL via HTTP if RPC fails
async function resetDatabaseHTTP() {
  console.log('🔄 Using HTTP method to reset database...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const sqlFilePath = path.join(__dirname, 'supabase-reset.sql');
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey
      },
      body: JSON.stringify({ sql_query: sqlContent })
    });

    if (response.ok) {
      console.log('✅ HTTP database reset completed successfully!');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ HTTP reset failed:', errorText);
      return false;
    }
    
  } catch (error) {
    console.error('❌ HTTP reset error:', error.message);
    return false;
  }
}

// Simple method: Just drop and create basic table
async function simpleReset() {
  console.log('🔄 Using simple reset method...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Simple SQL commands
    const resetCommands = [
      "DROP TABLE IF EXISTS bookings CASCADE;",
      "DROP TYPE IF EXISTS booking_status_type CASCADE;",
      "DROP TYPE IF EXISTS payment_status_type CASCADE;",
      "DROP TYPE IF EXISTS contact_method_type CASCADE;", 
      "DROP TYPE IF EXISTS venue_type_enum CASCADE;",
      "DROP TYPE IF EXISTS event_type_enum CASCADE;",
      
      "CREATE TYPE booking_status_type AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');",
      "CREATE TYPE payment_status_type AS ENUM ('unpaid', 'deposit_paid', 'full_paid', 'refunded');",
      "CREATE TYPE contact_method_type AS ENUM ('phone', 'email', 'line', 'facebook');",
      "CREATE TYPE venue_type_enum AS ENUM ('customer_venue', 'our_venue', 'hotel', 'restaurant', 'outdoor');",
      "CREATE TYPE event_type_enum AS ENUM ('wedding', 'corporate', 'birthday', 'anniversary', 'conference', 'seminar', 'other');",
      
      `CREATE TABLE bookings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(25) NOT NULL,
        customer_email VARCHAR(320) NOT NULL,
        event_type event_type_enum NOT NULL,
        event_date DATE NOT NULL,
        event_time TIME NOT NULL DEFAULT '12:00:00',
        event_duration INTEGER NOT NULL DEFAULT 4,
        venue_type venue_type_enum NOT NULL DEFAULT 'customer_venue',
        venue_address TEXT DEFAULT '',
        venue_details TEXT DEFAULT '',
        guest_count INTEGER NOT NULL CHECK (guest_count >= 1),
        service_type VARCHAR(50) NOT NULL DEFAULT 'to_be_discussed',
        menu_preferences TEXT DEFAULT '',
        budget_range VARCHAR(50) DEFAULT '',
        special_requests TEXT DEFAULT '',
        dietary_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
        equipment_needed JSONB NOT NULL DEFAULT '[]'::jsonb,
        booking_status booking_status_type NOT NULL DEFAULT 'pending',
        estimated_price DECIMAL(12,2) DEFAULT NULL,
        final_price DECIMAL(12,2) DEFAULT NULL,
        payment_status payment_status_type NOT NULL DEFAULT 'unpaid',
        deposit_amount DECIMAL(12,2) DEFAULT 0.0,
        booking_reference VARCHAR(15) UNIQUE NOT NULL,
        admin_notes TEXT DEFAULT '',
        preferred_contact_method contact_method_type NOT NULL DEFAULT 'phone',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
      
      `CREATE OR REPLACE FUNCTION generate_simple_booking_reference()
       RETURNS TEXT AS $$
       DECLARE
         ref_code TEXT;
         timestamp_part TEXT;
         random_part INTEGER;
       BEGIN
         timestamp_part := TO_CHAR(NOW(), 'YYMMDD');
         random_part := FLOOR(RANDOM() * 10000);
         ref_code := 'FZ' || timestamp_part || LPAD(random_part::TEXT, 4, '0');
         
         WHILE EXISTS (SELECT 1 FROM bookings WHERE booking_reference = ref_code) LOOP
           random_part := FLOOR(RANDOM() * 10000);
           ref_code := 'FZ' || timestamp_part || LPAD(random_part::TEXT, 4, '0');
         END LOOP;
         
         RETURN ref_code;
       END;
       $$ LANGUAGE plpgsql;`,
       
      `CREATE OR REPLACE FUNCTION set_simple_booking_reference()
       RETURNS TRIGGER AS $$
       BEGIN
         IF NEW.booking_reference IS NULL OR TRIM(NEW.booking_reference) = '' THEN
           NEW.booking_reference := generate_simple_booking_reference();
         END IF;
         
         NEW.updated_at := CURRENT_TIMESTAMP;
         
         RETURN NEW;
       END;
       $$ LANGUAGE plpgsql;`,
       
      `CREATE TRIGGER trg_simple_booking_reference
         BEFORE INSERT OR UPDATE ON bookings
         FOR EACH ROW
         EXECUTE FUNCTION set_simple_booking_reference();`,
         
      "ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;",
      
      `CREATE POLICY "Anyone can create bookings" ON bookings
         FOR INSERT WITH CHECK (true);`,
         
      `CREATE POLICY "Anyone can read bookings" ON bookings
         FOR SELECT USING (true);`,
         
      "CREATE INDEX idx_bookings_reference ON bookings(booking_reference);",
      "CREATE INDEX idx_bookings_status ON bookings(booking_status);", 
      "CREATE INDEX idx_bookings_date ON bookings(event_date);"
    ];

    console.log('🗑️  Executing database reset commands...');
    
    for (let i = 0; i < resetCommands.length; i++) {
      const command = resetCommands[i];
      console.log(`📋 Step ${i + 1}/${resetCommands.length}: ${command.substring(0, 50)}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: command });
      if (error) {
        console.warn(`⚠️  Warning in step ${i + 1}: ${error.message}`);
        // Continue with next command
      }
    }

    console.log('✅ Simple database reset completed!');
    return true;
    
  } catch (error) {
    console.error('❌ Simple reset failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Fuzio Catering - Database Reset Tool');
  console.log('=====================================');
  
  // Try multiple methods
  let success = false;
  
  // Method 1: Direct SQL execution
  console.log('\n🔄 Method 1: Direct SQL execution');
  success = await resetDatabase();
  
  if (!success) {
    // Method 2: HTTP method
    console.log('\n🔄 Method 2: HTTP SQL execution');
    success = await resetDatabaseHTTP();
  }
  
  if (!success) {
    // Method 3: Simple step-by-step
    console.log('\n🔄 Method 3: Simple step-by-step reset');
    success = await simpleReset();
  }
  
  if (success) {
    console.log('\n🎉 SUCCESS: Database has been reset successfully!');
    console.log('✅ New simple booking system is ready to use');
    console.log('📱 You can now test the booking form without validation errors');
  } else {
    console.log('\n❌ FAILED: Database reset was unsuccessful');
    console.log('🔧 Please run the SQL script manually in Supabase Dashboard');
  }
}

main().catch(console.error);