'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(0);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filter !== 'all' && { status: filter })
      });

      const response = await fetch(`/api/inquiries?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setInquiries(data.inquiries);
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [filter, page]);

  const updateStatus = async (id: string, status: 'new' | 'contacted' | 'closed') => {
    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setInquiries(prev => 
          prev.map(inquiry => 
            inquiry.id === id ? { ...inquiry, status } : inquiry
          )
        );
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getEventTypeDisplay = (eventType: string) => {
    const types: Record<string, string> = {
      wedding: '💒 งานแต่งงาน',
      merit: '🙏 งานบุญ',
      corporate: '🏢 งานบริษัท',
      birthday: '🎂 งานวันเกิด',
      graduation: '🎓 งานรับปริญญา',
      other: '✨ อื่นๆ'
    };
    return types[eventType] || eventType;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'new': return '🆕 ใหม่';
      case 'contacted': return '📞 ติดต่อแล้ว';
      case 'closed': return '✅ ปิดแล้ว';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-orange-600 hover:text-orange-700">
                ← กลับหน้า Admin
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">📋 คำถามจากลูกค้า</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { key: 'all', label: '📋 ทั้งหมด' },
                { key: 'new', label: '🆕 ใหม่' },
                { key: 'contacted', label: '📞 ติดต่อแล้ว' },
                { key: 'closed', label: '✅ ปิดแล้ว' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setFilter(tab.key);
                    setPage(0);
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    filter === tab.key
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-2 text-gray-600">กำลังโหลด...</span>
          </div>
        )}

        {/* Inquiries List */}
        {!loading && (
          <div className="space-y-6">
            {inquiries.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">ยังไม่มีคำถามจากลูกค้า</h3>
                <p className="text-gray-600">คำถามใหม่จะแสดงที่นี่</p>
              </div>
            ) : (
              inquiries.map((inquiry) => (
                <div key={inquiry.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-xl font-bold text-gray-900 mr-4">
                            👤 {inquiry.name}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                            {getStatusDisplay(inquiry.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <span className="mr-2">📱</span>
                            <a href={`tel:${inquiry.phone}`} className="hover:text-orange-600 font-medium">
                              {inquiry.phone}
                            </a>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">📧</span>
                            <a href={`mailto:${inquiry.email}`} className="hover:text-orange-600 font-medium">
                              {inquiry.email}
                            </a>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">📅</span>
                            {new Date(inquiry.created_at).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">ประเภทงาน:</span>
                        <span className="ml-2 text-sm">{getEventTypeDisplay(inquiry.event_type)}</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">💬 รายละเอียด:</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-800 whitespace-pre-wrap">{inquiry.message}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-700">อัปเดตสถานะ:</span>
                      <button
                        onClick={() => updateStatus(inquiry.id, 'contacted')}
                        disabled={inquiry.status === 'contacted'}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium hover:bg-yellow-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        📞 ติดต่อแล้ว
                      </button>
                      <button
                        onClick={() => updateStatus(inquiry.id, 'closed')}
                        disabled={inquiry.status === 'closed'}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ✅ ปิดเรื่อง
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}