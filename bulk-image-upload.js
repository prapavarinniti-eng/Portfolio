const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://jpkzzovrrjrtchfdxdce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwa3p6b3ZycmpydGNoZmR4ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzExODUsImV4cCI6MjA2OTcwNzE4NX0.AZ-o5950oVgxUVHhX82RmHH8-FwNNg8hjtGl6vKen_w';
const supabase = createClient(supabaseUrl, supabaseKey);

// Professional content descriptions for each category
const categoryContent = {
  wedding: [
    {
      title: "งานแต่งงานริมทะเลสุดหรู",
      description: "จัดเลี้ยงแต่งงานริมทะเลพร้อมเมนูอาหารไทยฟิวชั่น บรรยากาศโรแมนติกระดับโรงแรม 5 ดาว",
      tags: ["wedding", "beachside", "luxury", "thai-fusion", "romantic"]
    },
    {
      title: "งานแต่งงานสไตล์ไทยประยุกต์",
      description: "การจัดเลี้ยงแต่งงานผสมผสานระหว่างวัฒนธรรมไทยกับความทันสมัย พร้อมอาหารเลิศรส",
      tags: ["wedding", "thai-modern", "cultural", "premium", "elegant"]
    },
    {
      title: "เลี้ยงแต่งงานในสวนสุดหรู",
      description: "บรรยากาศงานแต่งงานกลางแจ้งในสวนสวย พร้อมเมนูพิเศษและการตกแต่งระดับพรีเมี่ยม",
      tags: ["wedding", "garden", "outdoor", "premium", "decoration"]
    }
  ],
  corporate: [
    {
      title: "Coffee Break ประชุมผู้บริหาร",
      description: "บริการ Coffee Break ระดับพรีเมี่ยมสำหรับการประชุมผู้บริหาร พร้อมเบเกอรี่และเครื่องดื่มคุณภาพสูง",
      tags: ["corporate", "coffee-break", "executive", "premium", "meeting"]
    },
    {
      title: "งานเลี้ยงสังสรรค์บริษัท",
      description: "การจัดงานปาร์ตี้บริษัทแบบครบวงจร พร้อมอาหารนานาชาติและบริการระดับโรงแรม",
      tags: ["corporate", "company-party", "international", "professional", "catering"]
    },
    {
      title: "สัมมนาองค์กรระดับผู้บริหาร", 
      description: "บริการจัดเลี้ยงสำหรับงานสัมมนาและประชุมใหญ่ พร้อมเมนูหลากหลายรูปแบบ",
      tags: ["corporate", "seminar", "conference", "executive", "buffet"]
    }
  ],
  'fine-dining': [
    {
      title: "Set Course Menu 7 คอร์ส",
      description: "เมนูดินเนอร์ Fine Dining 7 คอร์สระดับมิชลิน พร้อมการจัดเสิร์ฟแบบมืออาชีพ",
      tags: ["fine-dining", "7-course", "michelin", "premium", "professional"]
    },
    {
      title: "อาหารฝรั่งเศสระดับเชฟ",
      description: "เมนูอาหารฝรั่งเศสแท้จากเชฟมืออาชีพ พร้อมการจัดจานและเสิร์ฟระดับโรงแรม 5 ดาว",
      tags: ["fine-dining", "french", "chef-special", "luxury", "plating"]
    },
    {
      title: "Tasting Menu พิเศษ",
      description: "เมนูชิมลิ้มรสพิเศษจากเชฟ พร้อมการบรรยายและนำเสนออาหารแต่ละจาน",
      tags: ["fine-dining", "tasting-menu", "chef-presentation", "exclusive", "gourmet"]
    }
  ],
  buffet: [
    {
      title: "บุฟเฟ่ต์อาหารไทย 40 เมนู",
      description: "บุฟเฟ่ต์อาหารไทยแท้รสชาติดั้งเดิม กว่า 40 เมนูหลากหลาย จากเชฟมืออาชีพ",
      tags: ["buffet", "thai-food", "authentic", "variety", "traditional"]
    },
    {
      title: "International Buffet Line",
      description: "บุฟเฟ่ต์อาหารนานาชาติครบครัน ทั้งเอเชีย ยุโรป และอเมริกัน พร้อมสเตชั่นทำสด",
      tags: ["buffet", "international", "live-station", "variety", "world-cuisine"]
    },
    {
      title: "Premium Seafood Buffet",
      description: "บุฟเฟ่ต์อาหารทะเลพรีเมี่ยม กุ้ง ปู หอย ปลาสดใหม่ พร้อมสเตชั่นย่างและต้ม",
      tags: ["buffet", "seafood", "premium", "fresh", "live-cooking"]
    }
  ],
  cocktail: [
    {
      title: "Welcome Drink & Canapé Premium",
      description: "เครื่องดื่มต้อนรับและอาหารว่างหรูหรา สำหรับงานเลี้ยงระดับ VIP",
      tags: ["cocktail", "welcome-drink", "canape", "vip", "premium"]
    },
    {
      title: "งานค็อกเทลพาร์ตี้ Evening",
      description: "งานเลี้ยงค็อกเทลยามเย็น พร้อมเครื่องดื่มมิกซ์พิเศษและฟิงเกอร์ฟู้ดระดับโรงแรม",
      tags: ["cocktail", "evening-party", "signature-drinks", "finger-food", "elegant"]
    },
    {
      title: "Corporate Cocktail Reception",
      description: "งานรับรองระดับองค์กร พร้อมค็อกเทลพิเศษและอาหารว่างสไตล์นานาชาติ",
      tags: ["cocktail", "corporate", "reception", "international", "networking"]
    }
  ],
  'coffee-break': [
    {
      title: "Executive Coffee Break",
      description: "ชุดกาแฟเบรคระดับผู้บริหาร พร้อมเบเกอรี่สดและเครื่องดื่มพรีเมี่ยม",
      tags: ["coffee-break", "executive", "fresh-bakery", "premium-drinks", "meeting"]
    },
    {
      title: "High Tea Afternoon Set",
      description: "ชุดไฮทีบ่าย พร้อมสโคน เค้ก และขนมหวานหลากหลาย ในสไตล์อังกฤษแท้",
      tags: ["coffee-break", "high-tea", "afternoon", "british-style", "pastries"]
    },
    {
      title: "Morning Coffee & Pastries",
      description: "ชุดกาแฟและเปสตรี้เช้า สำหรับเริ่มต้นวันการประชุมอย่างสดชื่น",
      tags: ["coffee-break", "morning", "pastries", "fresh-start", "energizing"]
    }
  ],
  'snack-box': [
    {
      title: "Premium Lunch Box Set",
      description: "กล่องอาหารกลางวันพรีเมี่ยม อาหารสดใหม่ คุณภาพโรงแรม บรรจุในกล่องสวยงาม",
      tags: ["snack-box", "lunch-box", "premium", "fresh", "hotel-quality"]
    },
    {
      title: "Healthy Snack Box Collection",
      description: "กล่องขนมเพื่อสุขภาพ มีทั้งผลไม้สด ถั่วคั่ว และขนมอบกรอบ",
      tags: ["snack-box", "healthy", "fruits", "nuts", "wellness"]
    },
    {
      title: "Meeting Break Box",
      description: "กล่องอาหารว่างสำหรับพักการประชุม มีทั้งของหวานและของคาว สะดวกรับประทาน",
      tags: ["snack-box", "meeting-break", "convenient", "sweet-savory", "portable"]
    }
  ],
  government: [
    {
      title: "งานพิธีราชการสำคัญ",
      description: "การจัดเลี้ยงงานพิธีราชการอย่างเป็นทางการ พร้อมอาหารไทยต้นตำรับและการบริการมาตรฐานสูง",
      tags: ["government", "official-ceremony", "formal", "thai-authentic", "protocol"]
    },
    {
      title: "งานเลี้ยงรับรองสถาบันการศึกษา",
      description: "บริการจัดเลี้ยงสำหรับมหาวิทยาลัยและสถาบันการศึกษา งานรับปริญญาและพิธีสำคัญ",
      tags: ["government", "university", "graduation", "academic", "institutional"]
    },
    {
      title: "ประชุมระดับกระทรวง",
      description: "การจัดเลี้ยงประชุมระดับสูงของภาครัฐ พร้อมมาตรฐานการบริการระดับนานาชาติ",
      tags: ["government", "ministerial", "high-level", "international-standard", "diplomatic"]
    }
  ],
  signature: [
    {
      title: "เมนูซิกเนเจอร์เฉพาะ Fuzio",
      description: "อาหารพิเศษเฉพาะของ Fuzio Catering ที่พัฒนาโดยเชฟระดับโรงแรม 5 ดาว",
      tags: ["signature", "exclusive", "chef-special", "5-star", "unique"]
    },
    {
      title: "Fusion Thai Gastronomy",
      description: "อาหารไทยฟิวชั่นสุดพิเศษ ผสมผสานเทคนิคการทำอาหารสมัยใหม่กับรสชาติไทยแท้",
      tags: ["signature", "fusion", "gastronomy", "modern-technique", "thai-authentic"]
    },
    {
      title: "Premium Molecular Cuisine",
      description: "อาหารระดับ Molecular Gastronomy ที่นำเสนอประสบการณ์รับประทานอาหารแปลกใหม่",
      tags: ["signature", "molecular", "premium", "innovative", "experience"]
    }
  ]
};

// Image mapping function based on naming patterns
function getImageCategory(filename) {
  // Extract the actual image number from filename like "LINE_ALBUM_Catering_250804_96.jpg"
  const matches = filename.match(/_(\d+)\.jpg$/);
  if (!matches) return 'signature';
  
  const num = parseInt(matches[1]);
  
  // Distribute images across categories based on number ranges
  if (num >= 1 && num <= 15) return 'wedding';
  if (num >= 16 && num <= 25) return 'corporate';
  if (num >= 26 && num <= 35) return 'fine-dining';
  if (num >= 36 && num <= 50) return 'buffet';
  if (num >= 51 && num <= 60) return 'cocktail';
  if (num >= 61 && num <= 70) return 'coffee-break';
  if (num >= 71 && num <= 80) return 'snack-box';
  if (num >= 81 && num <= 90) return 'government';
  if (num >= 91 && num <= 96) return 'signature';
  
  return 'signature'; // default
}

// Map folder names to category names
function getCategoryFromFolder(folderName) {
  const folderMap = {
    '01-weddings': 'wedding',
    '02-corporate-meetings': 'corporate',
    '03-fine-dining': 'fine-dining',
    '04-buffet-service': 'buffet',
    '05-cocktail-reception': 'cocktail',
    '06-coffee-break': 'coffee-break',
    '07-snack-food-box': 'snack-box',
    '08-government-events': 'corporate', // Use corporate instead of government
    '09-private-parties': 'wedding' // Use wedding instead of signature
  };
  return folderMap[folderName] || 'signature';
}

// Generate unique content for each image with sequential numbering
function generateImageContent(category, index, filename) {
  const categoryData = categoryContent[category];
  const template = categoryData[index % categoryData.length];
  
  // Extract image number from filename for unique identification
  const matches = filename.match(/_(\d+)\.jpg$/);
  const imageNum = matches ? matches[1] : (index + 1);
  
  return {
    title: `${template.title} - ภาพที่ ${imageNum}`,
    description: template.description,
    tags: template.tags,
    category: category
  };
}

async function uploadImages() {
  try {
    // Check all category folders for images
    const imageDir = path.join(__dirname, 'public', 'image');
    const categoryFolders = [
      '01-weddings', '02-corporate-meetings', '03-fine-dining', 
      '04-buffet-service', '05-cocktail-reception', '06-coffee-break', 
      '07-snack-food-box', '08-government-events', '09-private-parties'
    ];

    let allFiles = [];
    
    // Collect files from all category folders
    for (const folder of categoryFolders) {
      const folderPath = path.join(imageDir, folder);
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath)
          .filter(file => file.endsWith('.jpg'))
          .map(file => ({
            filename: file,
            folder: folder,
            fullPath: path.join(folderPath, file),
            category: getCategoryFromFolder(folder)
          }));
        allFiles = allFiles.concat(files);
      }
    }

    console.log(`Found ${allFiles.length} images to upload from ${categoryFolders.length} folders`);

    for (let i = 0; i < allFiles.length; i++) {
      const fileInfo = allFiles[i];
      const { filename, folder, fullPath, category } = fileInfo;
      const content = generateImageContent(category, i, filename);
      
      console.log(`Processing ${filename} from ${folder} as ${category}...`);

      // Read image file
      const fileBuffer = fs.readFileSync(fullPath);
      
      // Use local image path instead of uploading to storage for now
      const publicUrl = `/image/${folder}/${filename}`;

      // Insert into database (without tags column)
      const { data: dbData, error: dbError } = await supabase
        .from('portfolio_images')
        .insert({
          title: content.title,
          description: content.description,
          category: content.category,
          image_url: publicUrl,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error(`Database error for ${filename}:`, dbError);
        continue;
      }

      console.log(`✅ Successfully uploaded ${filename} as ${category}`);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('🎉 All images uploaded successfully!');
    
  } catch (error) {
    console.error('Error in upload process:', error);
  }
}

// Run the upload
if (require.main === module) {
  uploadImages();
}

module.exports = { uploadImages, categoryContent };