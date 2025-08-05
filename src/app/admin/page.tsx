'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, PortfolioImage } from '@/lib/supabase';
import Image from 'next/image';

export default function AdminPanel() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState<{total: number; byCategory: Record<string, number>} | null>(null);
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentView, setCurrentView] = useState<'upload' | 'manage'>('upload');
  const [editingImage, setEditingImage] = useState<PortfolioImage | null>(null);

  useEffect(() => {
    loadStats();
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setImages(data);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('category');
      
      if (!error && data) {
        console.log('📊 Raw data length:', data.length); // Debug
        console.log('📋 Sample data:', data.slice(0, 3)); // Debug first 3 items
        
        const categoryCount = data.reduce((acc: Record<string, number>, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {});
        
        console.log('🏷️ Category breakdown:', categoryCount); // Debug
        
        setStats({
          total: data.length,
          byCategory: categoryCount
        });
      } else {
        console.error('Stats error:', error);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // File preview handler
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setPreviewFiles(files);
    }
  };

  const uploadMultipleImages = async () => {
    try {
      setUploading(true);
      setMessage('');
      setUploadProgress(0);

      if (previewFiles.length === 0) {
        throw new Error('Please select images to upload.');
      }

      let successCount = 0;
      const totalFiles = previewFiles.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = previewFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = fileName;

        // Upload to Storage
        const { error: uploadError } = await supabase.storage
          .from('portfolio-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        // Get public URL
        const { data } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(filePath);

        // Guess category from filename
        const category = guessCategory(file.name);
        const title = `${getCategoryLabel(category)} ${successCount + 1}`;

        // Insert into database
        const { error: dbError } = await supabase
          .from('portfolio_images')
          .insert([{
            title: title,
            description: `ผลงาน${getCategoryLabel(category)}จากทีม Fuzio Catering`,
            image_url: data.publicUrl,
            category: category
          }]);

        if (!dbError) {
          successCount++;
        }

        // Update progress
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      setMessage(`✅ อัพโหลดสำเร็จ ${successCount}/${totalFiles} รูป`);
      setPreviewFiles([]); // Clear preview
      loadStats();
      loadImages();
    } catch (error: unknown) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Delete single image
  const deleteImage = async (image: PortfolioImage) => {
    if (!confirm(`ต้องการลบ "${image.title}" ใช่หรือไม่?`)) return;

    try {
      const { error } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', image.id);

      if (!error) {
        setMessage(`✅ ลบ "${image.title}" สำเร็จ`);
        loadStats();
        loadImages();
      }
    } catch (error) {
      setMessage(`❌ ลบรูปล้มเหลว`);
    }
  };

  // Bulk delete
  const deleteSelectedImages = async () => {
    if (selectedImages.size === 0) return;
    if (!confirm(`ต้องการลบ ${selectedImages.size} รูปที่เลือกใช่หรือไม่?`)) return;

    try {
      const { error } = await supabase
        .from('portfolio_images')
        .delete()
        .in('id', Array.from(selectedImages));

      if (!error) {
        setMessage(`✅ ลบ ${selectedImages.size} รูปสำเร็จ`);
        setSelectedImages(new Set());
        loadStats();
        loadImages();
      }
    } catch (error) {
      setMessage(`❌ ลบรูปล้มเหลว`);
    }
  };

  // Toggle image selection
  const toggleImageSelection = (imageId: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  // Update image details
  const updateImage = async (imageId: string, updates: Partial<PortfolioImage>) => {
    try {
      const { error } = await supabase
        .from('portfolio_images')
        .update(updates)
        .eq('id', imageId);

      if (!error) {
        setMessage(`✅ อัพเดทข้อมูลสำเร็จ`);
        setEditingImage(null);
        loadStats();
        loadImages();
      }
    } catch (error) {
      setMessage(`❌ อัพเดทล้มเหลว`);
    }
  };

  const guessCategory = (fileName: string) => {
    const name = fileName.toLowerCase();
    if (name.includes('wedding') || name.includes('แต่ง')) return 'wedding';
    if (name.includes('corporate') || name.includes('บริษัท')) return 'corporate';
    if (name.includes('buffet') || name.includes('บุฟ')) return 'buffet';
    if (name.includes('cocktail') || name.includes('ค็อก')) return 'cocktail';
    if (name.includes('fine') || name.includes('dining')) return 'fine-dining';
    if (name.includes('stall')) return 'food-stall';
    if (name.includes('snack') || name.includes('box')) return 'snack-box';
    if (name.includes('coffee') || name.includes('กาแฟ')) return 'coffee-break';
    return 'corporate';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'wedding': 'งานแต่งงาน',
      'corporate': 'งานบริษัท',
      'buffet': 'บุฟเฟต์',
      'cocktail': 'ค็อกเทล',
      'fine-dining': 'ไฟน์ไดนิ่ง',
      'food-stall': 'ฟู้ดสตอล์',
      'snack-box': 'สแน็คบ็อกซ์',
      'coffee-break': 'คอฟฟี่เบรก'
    };
    return labels[category] || 'งานบริษัท';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              🎯 Fuzio Admin Panel
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentView('upload')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'upload' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📤 อัพโหลด
              </button>
              <button
                onClick={() => setCurrentView('manage')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'manage' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🗂️ จัดการ ({images.length})
              </button>
              <a 
                href="/portfolio" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                👀 ดู Gallery
              </a>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{stats?.total || 0}</div>
                <div className="text-sm text-blue-800">รูปทั้งหมด</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{stats?.byCategory?.wedding || 0}</div>
                <div className="text-sm text-green-800">งานแต่งงาน</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{stats?.byCategory?.corporate || 0}</div>
                <div className="text-sm text-purple-800">งานบริษัท</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{stats?.byCategory?.buffet || 0}</div>
                <div className="text-sm text-orange-800">บุฟเฟต์</div>
              </div>
            </div>

            {/* Admin Info Panel */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg mb-6 border border-indigo-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-indigo-800">🎯 Fuzio Admin Dashboard</h3>
                  <p className="text-sm text-indigo-600">จัดการรูปภาพผลงานแบบครบครัน</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-indigo-500">อัพเดท: {new Date().toLocaleDateString('th-TH')}</div>
                  <div className="text-xs text-indigo-500">สถานะ: 🟢 พร้อมใช้งาน</div>
                </div>
              </div>
            </div>

            {/* Upload View */}
            {currentView === 'upload' && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="space-y-4">
                    <div className="text-4xl">📸</div>
                    <h2 className="text-xl font-semibold text-gray-700">
                      อัพโหลดรูปหลายรูปพร้อมกัน
                    </h2>
                    <p className="text-gray-500">
                      เลือกรูปได้สูงสุด 200 รูป อัพโหลดพร้อมกันเลย!
                    </p>
                    
                    <label className="inline-block">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                      />
                      <div className={`
                        px-6 py-3 bg-orange-600 text-white rounded-lg cursor-pointer hover:bg-orange-700 transition-colors
                        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                      `}>
                        📁 เลือกรูปภาพ
                      </div>
                    </label>
                  </div>
                </div>

                {/* Preview Images */}
                {previewFiles.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ตัวอย่างรูปที่เลือก ({previewFiles.length} รูป)</h3>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
                      {previewFiles.map((file, index) => (
                        <div key={index} className="relative aspect-square">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                            {guessCategory(file.name)}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Progress Bar */}
                    {uploading && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-orange-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      <button
                        onClick={uploadMultipleImages}
                        disabled={uploading}
                        className={`
                          px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors
                          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        {uploading ? `🔄 กำลังอัพโหลด... ${uploadProgress}%` : '🚀 อัพโหลดทั้งหมด'}
                      </button>
                      <button
                        onClick={() => setPreviewFiles([])}
                        disabled={uploading}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        ❌ ยกเลิก
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600 space-y-2">
                  <h3 className="font-semibold">💡 เคล็ดลับการตั้งชื่อไฟล์:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>wedding_xxx.jpg</strong> → หมวดงานแต่งงาน</li>
                    <li><strong>corporate_xxx.jpg</strong> → หมวดงานบริษัท</li>
                    <li><strong>buffet_xxx.jpg</strong> → หมวดบุฟเฟต์</li>
                    <li><strong>cocktail_xxx.jpg</strong> → หมวดค็อกเทล</li>
                    <li>ไฟล์อื่นๆ → หมวดงานบริษัท (default)</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Manage View */}
            {currentView === 'manage' && (
              <div className="space-y-6">
                {/* Bulk Actions */}
                {selectedImages.size > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-yellow-800">เลือกแล้ว {selectedImages.size} รูป</span>
                    <button
                      onClick={deleteSelectedImages}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      🗑️ ลบที่เลือก
                    </button>
                  </div>
                )}

                {/* Images Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={selectedImages.has(image.id)}
                          onChange={() => toggleImageSelection(image.id)}
                          className="w-4 h-4 text-orange-600 bg-white border-gray-300 rounded"
                        />
                      </div>

                      {/* Image */}
                      <div className="relative aspect-square">
                        <Image
                          src={image.image_url}
                          alt={image.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                        
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg">
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingImage(image)}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                title="แก้ไข"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => deleteImage(image)}
                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                title="ลบ"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Image Info */}
                      <div className="mt-2 text-xs">
                        <div className="font-medium truncate" title={image.title}>
                          {image.title}
                        </div>
                        <div className="text-gray-500">
                          {getCategoryLabel(image.category)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Edit Modal */}
            {editingImage && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-semibold mb-4">แก้ไขรูปภาพ</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                      <input
                        type="text"
                        defaultValue={editingImage.title}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        onChange={(e) => setEditingImage({...editingImage, title: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                      <textarea
                        defaultValue={editingImage.description || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                        onChange={(e) => setEditingImage({...editingImage, description: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
                      <select
                        defaultValue={editingImage.category}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        onChange={(e) => setEditingImage({...editingImage, category: e.target.value as any})}
                      >
                        <option value="wedding">งานแต่งงาน</option>
                        <option value="corporate">งานบริษัท</option>
                        <option value="buffet">บุฟเฟต์</option>
                        <option value="cocktail">ค็อกเทล</option>
                        <option value="fine-dining">ไฟน์ไดนิ่ง</option>
                        <option value="coffee-break">คอฟฟี่เบรก</option>
                        <option value="snack-box">สแน็คบ็อกซ์</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => updateImage(editingImage.id, editingImage)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      ✅ บันทึก
                    </button>
                    <button
                      onClick={() => setEditingImage(null)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      ❌ ยกเลิก
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Status Message */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}