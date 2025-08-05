const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jpkzzovrrjrtchfdxdce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwa3p6b3ZycmpydGNoZmR4ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzExODUsImV4cCI6MjA2OTcwNzE4NX0.AZ-o5950oVgxUVHhX82RmHH8-FwNNg8hjtGl6vKen_w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceClearDatabase() {
  try {
    console.log('🗑️  Force clearing database...');
    
    // Get all existing images with their IDs
    const { data: existingImages, error: fetchError } = await supabase
      .from('portfolio_images')
      .select('id, title');

    if (fetchError) {
      console.error('❌ Error fetching existing images:', fetchError);
      return;
    }

    console.log(`📊 Found ${existingImages.length} existing images`);

    if (existingImages.length === 0) {
      console.log('✅ Database is already empty');
      return;
    }

    // Delete each image individually
    let deletedCount = 0;
    for (const image of existingImages) {
      const { error: deleteError } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', image.id);

      if (deleteError) {
        console.log(`❌ Failed to delete ${image.title}:`, deleteError.message);
      } else {
        deletedCount++;
        console.log(`✅ Deleted: ${image.title}`);
      }
    }

    console.log(`🎯 Deleted ${deletedCount} out of ${existingImages.length} images`);

    // Final verification
    const { data: finalCheck, error: finalError } = await supabase
      .from('portfolio_images')
      .select('*');

    if (finalError) {
      console.error('❌ Error in final verification:', finalError);
      return;
    }

    console.log(`🔍 Final check: ${finalCheck.length} images remaining`);
    
    if (finalCheck.length === 0) {
      console.log('🎉 Database cleared successfully! Ready for new upload.');
    }

  } catch (error) {
    console.error('💥 Force clear failed:', error.message);
  }
}

// Run the force clear
if (require.main === module) {
  forceClearDatabase();
}

module.exports = { forceClearDatabase };