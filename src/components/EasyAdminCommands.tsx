'use client';

import { useState } from 'react';

export default function EasyAdminCommands() {
  const [output, setOutput] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const runCommand = async (command: string, description: string) => {
    setLoading(true);
    setOutput([`🚀 กำลังรัน: ${description}...`]);

    try {
      const response = await fetch('/api/admin/easy-commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });

      const result = await response.json();
      
      if (result.success) {
        setOutput(result.output || [`✅ ${description} เสร็จสิ้น!`]);
      } else {
        setOutput([`❌ ข้อผิดพลาด: ${result.error}`]);
      }
    } catch (error) {
      setOutput([`❌ ข้อผิดพลาด: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    }

    setLoading(false);
  };

  const commands = [
    {
      id: 'upload',
      title: '📤 อัพโหลดรูปใหม่',
      description: 'อัพโหลดรูปจากโฟลเดอร์ public/image ทั้งหมด (ข้ามรูปซ้ำ)',
      color: 'bg-green-500 hover:bg-green-600',
      command: 'easy:upload'
    },
    {
      id: 'check-duplicates',
      title: '🔍 ตรวจสอบรูปซ้ำ',
      description: 'ดูรายการรูปที่ซ้ำในฐานข้อมูล (ไม่ลบ)',
      color: 'bg-blue-500 hover:bg-blue-600',
      command: 'easy:check-duplicates'
    },
    {
      id: 'remove-duplicates',
      title: '🗑️ ลบรูปซ้ำ',
      description: 'ลบรูปที่ซ้ำออกจากฐานข้อมูล (เก็บรูปแรกไว้)',
      color: 'bg-orange-500 hover:bg-orange-600',
      command: 'easy:remove-duplicates'
    },
    {
      id: 'reset',
      title: '💥 ล้างฐานข้อมูล',
      description: 'ลบข้อมูลรูปทั้งหมดออกจากฐานข้อมูล',
      color: 'bg-red-500 hover:bg-red-600',
      command: 'easy:reset',
      dangerous: true
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">⚡ คำสั่งง่ายๆ</h2>
        <p className="text-gray-600">
          จัดการรูปภาพแบบง่ายๆ ไม่ต้องใช้ Command Line
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {commands.map((cmd) => (
          <div key={cmd.id} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{cmd.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{cmd.description}</p>
            <button
              onClick={() => {
                if (cmd.dangerous) {
                  if (confirm('⚠️ คำเตือน: การล้างฐานข้อมูลจะลบรูปทั้งหมด ต้องการดำเนินการต่อไหม?')) {
                    runCommand(cmd.command, cmd.title);
                  }
                } else {
                  runCommand(cmd.command, cmd.title);
                }
              }}
              disabled={loading}
              className={`
                w-full px-4 py-2 text-white rounded-lg transition-colors
                ${cmd.color}
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {loading ? '⏳ กำลังทำงาน...' : cmd.title}
            </button>
          </div>
        ))}
      </div>

      {/* Output Terminal */}
      {output.length > 0 && (
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-400">📟 ผลลัพธ์:</span>
            <button
              onClick={() => setOutput([])}
              className="text-gray-400 hover:text-white"
            >
              ✕ ล้าง
            </button>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {output.map((line, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 วิธีใช้งาน:</h4>
        <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
          <li>ใส่รูป .jpg ในโฟลเดอร์ที่ต้องการ (01-weddings, 02-corporate-meetings, ฯลฯ)</li>
          <li>กดปุ่ม "📤 อัพโหลดรูปใหม่" เพื่ออัพโหลดเข้าฐานข้อมูล</li>
          <li>ถ้ามีรูปซ้ำ ใช้ "🗑️ ลบรูปซ้ำ" เพื่อจัดระเบียบ</li>
          <li>รูปจะแสดงในเว็บทันที!</li>
        </ol>
      </div>
    </div>
  );
}