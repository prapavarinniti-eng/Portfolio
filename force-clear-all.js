const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jpkzzovrrjrtchfdxdce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwa3p6b3ZycmpydGNoZmR4ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzExODUsImV4cCI6MjA2OTcwNzE4NX0.AZ-o5950oVgxUVHhX82RmHH8-FwNNg8hjtGl6vKen_w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceDeleteAll() {
  try {
    console.log('🗑️ Force deleting ALL records...');
    
    // Use SQL to truncate table (fastest method)
    const { error } = await supabase.rpc('delete_all_portfolio_images');
    
    if (error) {
      console.log('RPC failed, trying direct deletion...');
      
      // If RPC fails, try batch deletion
      let deletedTotal = 0;
      let hasMore = true;
      
      while (hasMore) {
        const { data: batch } = await supabase
          .from('portfolio_images')
          .select('id')
          .limit(100);
        
        if (!batch || batch.length === 0) {
          hasMore = false;
          break;
        }
        
        const { error: deleteError } = await supabase
          .from('portfolio_images')
          .delete()
          .in('id', batch.map(r => r.id));
        
        if (deleteError) {
          console.log('Batch delete error:', deleteError);
          break;
        }
        
        deletedTotal += batch.length;
        console.log(`✅ Deleted ${batch.length} records (total: ${deletedTotal})`);
      }
    } else {
      console.log('✅ All records deleted via RPC');
    }
    
    // Verify deletion
    const { count } = await supabase
      .from('portfolio_images')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Final count: ${count} records remaining`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

forceDeleteAll();