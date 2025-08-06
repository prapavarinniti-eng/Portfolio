'use client';

import { useState, useEffect } from 'react';
import { supabase, PortfolioImage } from '@/lib/supabase';
import Image from 'next/image';
import EasyAdminCommands from '@/components/EasyAdminCommands';

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  event_type: string;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
}

export default function AdminPanel() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState<{total: number; byCategory: Record<string, number>} | null>(null);
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentView, setCurrentView] = useState<'dashboard' | 'upload' | 'manage' | 'easy' | 'inquiries' | 'terminal'>('terminal');
  const [editingImage, setEditingImage] = useState<PortfolioImage | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiryStats, setInquiryStats] = useState({ total: 0, new: 0, contacted: 0, closed: 0 });
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);

  useEffect(() => {
    loadStats();
    loadImages();
    loadInquiries();
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

  const loadInquiries = async () => {
    try {
      const response = await fetch('/api/inquiries?limit=10');
      const data = await response.json();
      
      if (response.ok) {
        setInquiries(data.inquiries);
        
        // Calculate stats
        const stats = data.inquiries.reduce((acc: any, inquiry: Inquiry) => {
          acc.total++;
          acc[inquiry.status]++;
          return acc;
        }, { total: 0, new: 0, contacted: 0, closed: 0 });
        
        setInquiryStats(stats);
      }
    } catch (error) {
      console.error('Failed to load inquiries:', error);
    }
  };

  const updateInquiryStatus = async (id: string, status: 'new' | 'contacted' | 'closed') => {
    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setInquiries(prev => 
          prev.map(inquiry => 
            inquiry.id === id ? { ...inquiry, status } : inquiry
          )
        );
        loadInquiries(); // Refresh stats
      }
    } catch (error) {
      console.error('Failed to update status:', error);
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
    } catch {
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
    } catch {
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
    } catch {
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

  const handleTerminalCommand = async (command: string) => {
    const cmd = command.trim();
    let output = '';

    switch (cmd) {
      case '1':
        output = `📊 สถิติรูปภาพ:\n🖼️ รูปทั้งหมด: ${stats?.total || 0}\n💒 งานแต่งงาน: ${stats?.byCategory?.wedding || 0}\n🏢 งานบริษัท: ${stats?.byCategory?.corporate || 0}\n🍽️ บุฟเฟต์: ${stats?.byCategory?.buffet || 0}\n🍸 ค็อกเทล: ${stats?.byCategory?.cocktail || 0}`;
        break;
      case '2':
        setCurrentView('upload');
        output = '📤 เปลี่ยนไปหน้าอัพโหลดรูปภาพ...';
        break;
      case '3':
        try {
          const response = await fetch('/api/admin/easy-commands', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'optimize' }),
          });
          const result = await response.json();
          output = `⚡ ${result.message || 'เพิ่มประสิทธิภาพฐานข้อมูลสำเร็จ'}`;
          loadStats();
        } catch (error) {
          output = `❌ เกิดข้อผิดพลาด: ${error}`;
        }
        break;
      case '4':
        setCurrentView('manage');
        output = '🔍 เปลี่ยนไปหน้าค้นหาและจัดการรูปภาพ...';
        break;
      case '5':
        output = '🗑️ ลบรูปตามหมวดหมู่:\n1) wedding\n2) corporate\n3) buffet\n4) cocktail\n5) fine-dining\nพิมพ์: 5-[หมวด] เช่น 5-wedding';
        break;
      case '6':
        setCurrentView('manage');
        output = '🎯 เปลี่ยนไปหน้าเลือกและลบรูปเฉพาะรายการ...';
        break;
      case '7':
        if (confirm('⚠️ อันตราย! ต้องการลบรูปทั้งหมดจริงหรอ?')) {
          if (confirm('🚨 แน่ใจนะ? ลบแล้วกู้คืนไม่ได้!')) {
            try {
              const response = await fetch('/api/admin/easy-commands', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'clear-all' }),
              });
              const result = await response.json();
              output = `💥 ${result.message || 'ลบรูปทั้งหมดสำเร็จ'}`;
              loadStats();
              loadImages();
            } catch (error) {
              output = `❌ เกิดข้อผิดพลาด: ${error}`;
            }
          } else {
            output = '✅ ยกเลิกการลบรูปทั้งหมด';
          }
        } else {
          output = '✅ ยกเลิกการลบรูปทั้งหมด';
        }
        break;
      case '0':
        setCurrentView('dashboard');
        output = '🚪 กลับไปหน้าแดชบอร์ด...';
        break;
      default:
        if (cmd.startsWith('5-')) {
          const category = cmd.substring(2);
          if (confirm(`🗑️ ต้องการลบรูปหมวด "${category}" ทั้งหมดใช่หรือไม่?`)) {
            try {
              const response = await fetch('/api/admin/easy-commands', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete-category', category }),
              });
              const result = await response.json();
              output = `🗑️ ${result.message || `ลบรูปหมวด ${category} สำเร็จ`}`;
              loadStats();
              loadImages();
            } catch (error) {
              output = `❌ เกิดข้อผิดพลาด: ${error}`;
            }
          } else {
            output = '✅ ยกเลิกการลบรูป';
          }
        } else {
          output = `❌ คำสั่ง "${cmd}" ไม่ถูกต้อง\nพิมพ์ตัวเลข 0-7 เท่านั้น`;
        }
        break;
    }

    setTerminalOutput(prev => [...prev, `> ${command}`, output, '']);
    setTerminalInput('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              🎯 Fuzio Admin Panel
            </h1>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCurrentView('terminal')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'terminal' 
                    ? 'bg-black text-green-400 font-mono' 
                    : 'bg-gray-800 text-green-300 hover:bg-gray-700 font-mono'
                }`}
              >
                💻 Terminal
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'dashboard' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🏠 แดชบอร์ด
              </button>
              <button
                onClick={() => setCurrentView('inquiries')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'inquiries' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📋 คำถาม ({inquiryStats.new})
              </button>
              <button
                onClick={() => setCurrentView('easy')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'easy' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ⚡ คำสั่งง่าย
              </button>
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
            {/* Terminal View */}
            {currentView === 'terminal' && (
              <div className="bg-black rounded-2xl p-8 font-mono text-green-400 shadow-2xl">
                {/* Terminal Header */}
                <div className="flex items-center justify-between mb-6 border-b border-green-800 pb-4">
                  <div className="flex items-center">
                    <div className="flex space-x-2 mr-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-green-300 font-bold">FUZIO CATERING ADMIN TERMINAL</span>
                  </div>
                  <span className="text-green-600 text-sm">v2.0.1</span>
                </div>

                {/* Welcome Banner */}
                <div className="mb-8 text-center">
                  <div className="text-green-300 text-lg font-bold mb-2">
                    🎯 ============ FUZIO CATERING ADMIN ============
                  </div>
                  <div className="text-green-500 text-sm">
                    Sistema de administración avanzado | Build: {new Date().toISOString().split('T')[0]}
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-center">
                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-400">{stats?.total || 0}</div>
                    <div className="text-xs text-green-600">รูปทั้งหมด</div>
                  </div>
                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-400">{inquiryStats.total}</div>
                    <div className="text-xs text-green-600">คำถามทั้งหมด</div>
                  </div>
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                    <div className="text-2xl font-bold text-red-400">{inquiryStats.new}</div>
                    <div className="text-xs text-red-600">คำถามใหม่</div>
                  </div>
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-400">Online</div>
                    <div className="text-xs text-blue-600">สถานะระบบ</div>
                  </div>
                </div>

                {/* Menu */}
                <div className="mb-8">
                  <div className="text-green-300 mb-4">เลือกคำสั่งที่ต้องการ:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="hover:bg-green-900/20 p-2 rounded cursor-pointer transition-colors" onClick={() => handleTerminalCommand('1')}>
                      <span className="text-yellow-400">1.</span> <span className="text-cyan-400">📊 ดูสถิติรูปภาพ</span>
                    </div>
                    <div className="hover:bg-green-900/20 p-2 rounded cursor-pointer transition-colors" onClick={() => handleTerminalCommand('2')}>
                      <span className="text-yellow-400">2.</span> <span className="text-cyan-400">📤 อัพโหลดรูปจากโฟลเดอร์</span>
                    </div>
                    <div className="hover:bg-green-900/20 p-2 rounded cursor-pointer transition-colors" onClick={() => handleTerminalCommand('3')}>
                      <span className="text-yellow-400">3.</span> <span className="text-cyan-400">⚡ เพิ่มประสิทธิภาพฐานข้อมูล</span>
                    </div>
                    <div className="hover:bg-green-900/20 p-2 rounded cursor-pointer transition-colors" onClick={() => handleTerminalCommand('4')}>
                      <span className="text-yellow-400">4.</span> <span className="text-cyan-400">🔍 ค้นหารูปภาพ</span>
                    </div>
                    <div className="hover:bg-green-900/20 p-2 rounded cursor-pointer transition-colors" onClick={() => handleTerminalCommand('5')}>
                      <span className="text-yellow-400">5.</span> <span className="text-cyan-400">🗑️ ลบรูปตามหมวดหมู่</span>
                    </div>
                    <div className="hover:bg-green-900/20 p-2 rounded cursor-pointer transition-colors" onClick={() => handleTerminalCommand('6')}>
                      <span className="text-yellow-400">6.</span> <span className="text-cyan-400">🎯 เลือกและลบรูปเฉพาะรายการ</span>
                    </div>
                    <div className="hover:bg-red-900/20 p-2 rounded cursor-pointer transition-colors" onClick={() => handleTerminalCommand('7')}>
                      <span className="text-yellow-400">7.</span> <span className="text-red-400">💥 ลบรูปทั้งหมด</span>
                    </div>
                    <div className="hover:bg-green-900/20 p-2 rounded cursor-pointer transition-colors" onClick={() => handleTerminalCommand('0')}>
                      <span className="text-yellow-400">0.</span> <span className="text-cyan-400">🚪 ออก</span>
                    </div>
                  </div>
                </div>

                {/* Terminal Output */}
                <div className="bg-gray-900 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto mb-4">
                  {terminalOutput.length === 0 ? (
                    <div className="text-green-600 text-sm">
                      <div>💻 Terminal พร้อมใช้งาน</div>
                      <div>📝 พิมพ์หมายเลขคำสั่ง 0-7 หรือคลิกเมนูข้างบน</div>
                      <div>📋 พิมพ์ "help" เพื่อดูความช่วยเหลือ</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {terminalOutput.map((line, index) => (
                        <div key={index} className={
                          line.startsWith('>') ? 'text-yellow-400' :
                          line.startsWith('❌') ? 'text-red-400' :
                          line.startsWith('✅') || line.startsWith('📊') || line.startsWith('📤') || line.startsWith('⚡') ? 'text-green-400' :
                          'text-green-300'
                        }>
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Command Input */}
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">fuzio@admin:~$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleTerminalCommand(terminalInput);
                      }
                    }}
                    className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono"
                    placeholder="ใส่หมายเลขคำสั่ง..."
                    autoFocus
                  />
                </div>

                {/* Quick Action Buttons */}
                <div className="mt-6 pt-4 border-t border-green-800">
                  <div className="text-green-600 text-sm mb-2">Quick Actions:</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleTerminalCommand('1')}
                      className="px-3 py-1 bg-green-900/30 border border-green-700 rounded text-green-400 text-sm hover:bg-green-900/50 transition-colors"
                    >
                      📊 Stats
                    </button>
                    <button
                      onClick={() => setCurrentView('inquiries')}
                      className="px-3 py-1 bg-purple-900/30 border border-purple-700 rounded text-purple-400 text-sm hover:bg-purple-900/50 transition-colors"
                    >
                      📋 Inquiries ({inquiryStats.new})
                    </button>
                    <button
                      onClick={() => setCurrentView('upload')}
                      className="px-3 py-1 bg-blue-900/30 border border-blue-700 rounded text-blue-400 text-sm hover:bg-blue-900/50 transition-colors"
                    >
                      📤 Upload
                    </button>
                    <button
                      onClick={() => setCurrentView('easy')}
                      className="px-3 py-1 bg-yellow-900/30 border border-yellow-700 rounded text-yellow-400 text-sm hover:bg-yellow-900/50 transition-colors"
                    >
                      ⚡ Easy Mode
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Dashboard View */}
            {currentView === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center hover:shadow-lg transition-shadow">
                    <div className="text-2xl font-bold text-blue-600">{stats?.total || 0}</div>
                    <div className="text-sm text-blue-800">รูปทั้งหมด</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center hover:shadow-lg transition-shadow">
                    <div className="text-2xl font-bold text-purple-600">{inquiryStats.total}</div>
                    <div className="text-sm text-purple-800">คำถามทั้งหมด</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center hover:shadow-lg transition-shadow">
                    <div className="text-2xl font-bold text-red-600">{inquiryStats.new}</div>
                    <div className="text-sm text-red-800">คำถามใหม่</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center hover:shadow-lg transition-shadow">
                    <div className="text-2xl font-bold text-green-600">{inquiryStats.contacted}</div>
                    <div className="text-sm text-green-800">ติดต่อแล้ว</div>
                  </div>
                </div>

                {/* Portfolio Categories */}
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">📸 รูปภาพตามประเภท</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-pink-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-pink-600">{stats?.byCategory?.wedding || 0}</div>
                      <div className="text-xs text-pink-800">งานแต่งงาน</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-blue-600">{stats?.byCategory?.corporate || 0}</div>
                      <div className="text-xs text-blue-800">งานบริษัท</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-orange-600">{stats?.byCategory?.buffet || 0}</div>
                      <div className="text-xs text-orange-800">บุฟเฟต์</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-yellow-600">{stats?.byCategory?.cocktail || 0}</div>
                      <div className="text-xs text-yellow-800">ค็อกเทล</div>
                    </div>
                  </div>
                </div>

                {/* Recent Inquiries */}
                <div className="bg-white border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">📋 คำถามล่าสุด</h3>
                    <button
                      onClick={() => setCurrentView('inquiries')}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      ดูทั้งหมด →
                    </button>
                  </div>
                  
                  {inquiries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📝</div>
                      <p>ยังไม่มีคำถามใหม่</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inquiries.slice(0, 5).map((inquiry) => (
                        <div key={inquiry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{inquiry.name}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                inquiry.status === 'new' ? 'bg-red-100 text-red-800' :
                                inquiry.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {inquiry.status === 'new' ? '🆕 ใหม่' :
                                 inquiry.status === 'contacted' ? '📞 ติดต่อแล้ว' : '✅ ปิด'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 truncate">{inquiry.message}</div>
                          </div>
                          <div className="flex space-x-2">
                            {inquiry.status === 'new' && (
                              <button
                                onClick={() => updateInquiryStatus(inquiry.id, 'contacted')}
                                className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                              >
                                📞
                              </button>
                            )}
                            {inquiry.status !== 'closed' && (
                              <button
                                onClick={() => updateInquiryStatus(inquiry.id, 'closed')}
                                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                              >
                                ✅
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">⚡ การดำเนินการด่วน</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => setCurrentView('upload')}
                      className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors"
                    >
                      <div className="text-2xl mb-2">📤</div>
                      <div className="font-medium text-orange-800">อัพโหลดรูป</div>
                    </button>
                    <button
                      onClick={() => setCurrentView('inquiries')}
                      className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors"
                    >
                      <div className="text-2xl mb-2">📋</div>
                      <div className="font-medium text-purple-800">ตอบคำถาม</div>
                    </button>
                    <button
                      onClick={() => setCurrentView('manage')}
                      className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors"
                    >
                      <div className="text-2xl mb-2">🗂️</div>
                      <div className="font-medium text-blue-800">จัดการรูป</div>
                    </button>
                    <button
                      onClick={() => setCurrentView('easy')}
                      className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors"
                    >
                      <div className="text-2xl mb-2">⚡</div>
                      <div className="font-medium text-green-800">คำสั่งง่าย</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Inquiries View */}
            {currentView === 'inquiries' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">📋 จัดการคำถามลูกค้า</h2>
                  <div className="text-sm text-gray-600">
                    ใหม่: {inquiryStats.new} | ติดต่อแล้ว: {inquiryStats.contacted} | ปิด: {inquiryStats.closed}
                  </div>
                </div>

                {inquiries.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">ยังไม่มีคำถามจากลูกค้า</h3>
                    <p className="text-gray-600">คำถามใหม่จะแสดงที่นี่</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inquiries.map((inquiry) => (
                      <div key={inquiry.id} className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="text-lg font-bold text-gray-900 mr-4">
                                👤 {inquiry.name}
                              </h3>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                inquiry.status === 'new' ? 'bg-red-100 text-red-800' :
                                inquiry.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {inquiry.status === 'new' ? '🆕 ใหม่' :
                                 inquiry.status === 'contacted' ? '📞 ติดต่อแล้ว' : '✅ ปิดแล้ว'}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                              <div className="flex items-center">
                                <span className="mr-2">📱</span>
                                <a href={`tel:${inquiry.phone}`} className="hover:text-purple-600 font-medium">
                                  {inquiry.phone}
                                </a>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2">📧</span>
                                <a href={`mailto:${inquiry.email}`} className="hover:text-purple-600 font-medium">
                                  {inquiry.email}
                                </a>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2">📅</span>
                                {new Date(inquiry.created_at).toLocaleDateString('th-TH')}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-800">{inquiry.message}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-700">อัปเดตสถานะ:</span>
                          {inquiry.status === 'new' && (
                            <button
                              onClick={() => updateInquiryStatus(inquiry.id, 'contacted')}
                              className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-medium hover:bg-yellow-600 transition-colors"
                            >
                              📞 ติดต่อแล้ว
                            </button>
                          )}
                          {inquiry.status !== 'closed' && (
                            <button
                              onClick={() => updateInquiryStatus(inquiry.id, 'closed')}
                              className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium hover:bg-green-600 transition-colors"
                            >
                              ✅ ปิดเรื่อง
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Easy Commands View */}
            {currentView === 'easy' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">🎯</div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">คำสั่งง่ายๆ สำหรับเด็ก</h2>
                  <p className="text-lg text-gray-600">กดปุ่มเดียวจบ ทำได้ง่ายๆ ไม่ต้องพิมพ์อะไรเลย!</p>
                </div>

                {/* Upload Commands */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 border-2 border-orange-200">
                  <div className="flex items-center mb-6">
                    <div className="text-4xl mr-4">📤</div>
                    <h3 className="text-2xl font-bold text-orange-800">อัพโหลดรูปภาพ</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/80 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="text-center">
                        <div className="text-5xl mb-4">🖼️</div>
                        <h4 className="text-xl font-bold text-gray-800 mb-2">เลือกรูปจากเครื่อง</h4>
                        <p className="text-sm text-gray-600 mb-4">เลือกรูปจากคอมพิวเตอร์แล้วอัพโหลดได้เลย</p>
                        <button
                          onClick={() => setCurrentView('upload')}
                          className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                        >
                          🚀 เริ่มอัพโหลด
                        </button>
                      </div>
                    </div>

                    <div className="bg-white/80 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="text-center">
                        <div className="text-5xl mb-4">🧹</div>
                        <h4 className="text-xl font-bold text-gray-800 mb-2">ลบรูปที่ซ้ำ</h4>
                        <p className="text-sm text-gray-600 mb-4">หารูปที่เหมือนกันแล้วลบออกอัตโนมัติ</p>
                        <button
                          onClick={async () => {
                            if (confirm('🧹 ต้องการลบรูปที่ซ้ำกันไหม?')) {
                              try {
                                const response = await fetch('/api/admin/easy-commands', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'remove-duplicates' }),
                                });
                                const result = await response.json();
                                alert(result.message);
                                loadStats();
                                loadImages();
                              } catch (error) {
                                alert('❌ เกิดข้อผิดพลาด: ' + error);
                              }
                            }
                          }}
                          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                        >
                          🧹 ลบรูปซ้ำ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Management Commands */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border-2 border-purple-200">
                  <div className="flex items-center mb-6">
                    <div className="text-4xl mr-4">🗂️</div>
                    <h3 className="text-2xl font-bold text-purple-800">จัดการรูปภาพ</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/80 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="text-center">
                        <div className="text-4xl mb-4">📊</div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2">ดูสถิติ</h4>
                        <p className="text-sm text-gray-600 mb-4">ดูจำนวนรูปทั้งหมด</p>
                        <button
                          onClick={() => {
                            alert(`📊 สถิติรูปภาพ:\n\n🖼️ รูปทั้งหมด: ${stats?.total || 0}\n💒 งานแต่งงาน: ${stats?.byCategory?.wedding || 0}\n🏢 งานบริษัท: ${stats?.byCategory?.corporate || 0}\n🍽️ บุฟเฟต์: ${stats?.byCategory?.buffet || 0}`);
                          }}
                          className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-teal-600 transition-all duration-300"
                        >
                          📊 ดูสถิติ
                        </button>
                      </div>
                    </div>

                    <div className="bg-white/80 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="text-center">
                        <div className="text-4xl mb-4">🗂️</div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2">จัดการรูป</h4>
                        <p className="text-sm text-gray-600 mb-4">แก้ไขหรือลบรูป</p>
                        <button
                          onClick={() => setCurrentView('manage')}
                          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
                        >
                          🗂️ จัดการ
                        </button>
                      </div>
                    </div>

                    <div className="bg-white/80 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="text-center">
                        <div className="text-4xl mb-4">🗑️</div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2">ลบทั้งหมด</h4>
                        <p className="text-sm text-gray-600 mb-4">ลบรูปทุกรูป (ระวัง!)</p>
                        <button
                          onClick={async () => {
                            if (confirm('⚠️ อันตราย! ต้องการลบรูปทั้งหมดจริงหรอ?')) {
                              if (confirm('🚨 แน่ใจนะ? ลบแล้วกู้คืนไม่ได้!')) {
                                try {
                                  const response = await fetch('/api/admin/easy-commands', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ action: 'clear-all' }),
                                  });
                                  const result = await response.json();
                                  alert(result.message);
                                  loadStats();
                                  loadImages();
                                } catch (error) {
                                  alert('❌ เกิดข้อผิดพลาด: ' + error);
                                }
                              }
                            }
                          }}
                          className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:from-red-600 hover:to-pink-600 transition-all duration-300"
                        >
                          🗑️ ลบทั้งหมด
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Management */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-200">
                  <div className="flex items-center mb-6">
                    <div className="text-4xl mr-4">👥</div>
                    <h3 className="text-2xl font-bold text-green-800">จัดการลูกค้า</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/80 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="text-center">
                        <div className="text-5xl mb-4">📋</div>
                        <h4 className="text-xl font-bold text-gray-800 mb-2">ดูคำถามลูกค้า</h4>
                        <p className="text-sm text-gray-600 mb-4">ดูข้อความที่ลูกค้าส่งมา ({inquiryStats.new} ใหม่)</p>
                        <button
                          onClick={() => setCurrentView('inquiries')}
                          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                        >
                          📋 ดูคำถาม
                        </button>
                      </div>
                    </div>

                    <div className="bg-white/80 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="text-center">
                        <div className="text-5xl mb-4">📞</div>
                        <h4 className="text-xl font-bold text-gray-800 mb-2">ติดต่อลูกค้า</h4>
                        <p className="text-sm text-gray-600 mb-4">โทรหรือส่งอีเมลหาลูกค้า</p>
                        <div className="space-y-2">
                          <a
                            href="tel:065-716-5037"
                            className="block w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
                          >
                            📞 โทร 065-716-5037
                          </a>
                          <a
                            href="mailto:info@fuziocatering.com"
                            className="block w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                          >
                            📧 ส่งอีเมล
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fun Stats */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 border-2 border-yellow-200">
                  <div className="flex items-center mb-6">
                    <div className="text-4xl mr-4">🎉</div>
                    <h3 className="text-2xl font-bold text-yellow-800">สถิติสนุกๆ</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/80 rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">🖼️</div>
                      <div className="text-2xl font-bold text-blue-600">{stats?.total || 0}</div>
                      <div className="text-sm text-blue-800">รูปทั้งหมด</div>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">📋</div>
                      <div className="text-2xl font-bold text-purple-600">{inquiryStats.total}</div>
                      <div className="text-sm text-purple-800">คำถามทั้งหมด</div>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">🆕</div>
                      <div className="text-2xl font-bold text-red-600">{inquiryStats.new}</div>
                      <div className="text-sm text-red-800">คำถามใหม่</div>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">✅</div>
                      <div className="text-2xl font-bold text-green-600">{inquiryStats.closed}</div>
                      <div className="text-sm text-green-800">เสร็จแล้ว</div>
                    </div>
                  </div>
                </div>

                {/* Help Section */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-8 border-2 border-indigo-200">
                  <div className="flex items-center mb-6">
                    <div className="text-4xl mr-4">❓</div>
                    <h3 className="text-2xl font-bold text-indigo-800">ช่วยเหลือ</h3>
                  </div>
                  
                  <div className="bg-white/80 rounded-2xl p-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">🎯 วิธีใช้งาน (เด็กๆ ทำได้!)</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">1️⃣</span>
                        <div>
                          <strong>อัพโหลดรูป:</strong> กดปุ่มสีส้ม "🚀 เริ่มอัพโหลด" → เลือกรูป → กด "อัพโหลดทั้งหมด"
                        </div>
                      </div>
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">2️⃣</span>
                        <div>
                          <strong>ดูคำถาม:</strong> กดปุ่มสีเขียว "📋 ดูคำถาม" → กดปุ่ม "📞" หรือ "✅" ตอบลูกค้า
                        </div>
                      </div>
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">3️⃣</span>
                        <div>
                          <strong>ลบรูปซ้ำ:</strong> กดปุ่มสีน้ำเงิน "🧹 ลบรูปซ้ำ" → กด "OK" → รอสักครู่
                        </div>
                      </div>
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">⚠️</span>
                        <div>
                          <strong>ระวัง:</strong> ปุ่ม "🗑️ ลบทั้งหมด" อันตราย! ใช้เมื่อจำเป็นจริงๆ
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                        onChange={(e) => setEditingImage({...editingImage, category: e.target.value as 'wedding' | 'corporate' | 'buffet' | 'cocktail' | 'fine-dining' | 'coffee-break' | 'snack-box'})}
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