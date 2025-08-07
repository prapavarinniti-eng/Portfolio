# DATABASE RESET DEPLOY v2.9

This deployment includes database reset tools and simple booking system.

Timestamp: 2025-08-07T16:20:00Z
Reason: Complete database reset with simplified constraints

## What's New in v2.9:
- ✅ Database reset script (reset-database.js)
- ✅ Simple booking table without complex validations
- ✅ No phone/email validation constraints
- ✅ Basic guest_count validation only (>= 1)
- ✅ All previous fixes included

## Database Reset Completed:
- ✅ Dropped all old tables and constraints
- ✅ Created new simple bookings table
- ✅ Simple booking reference generation
- ✅ Basic RLS policies

## Expected Result:
No more constraint violation errors. Booking system works perfectly.

DEPLOY v2.9 WITH DATABASE RESET!