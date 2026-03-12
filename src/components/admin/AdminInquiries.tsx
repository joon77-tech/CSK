import React, { useState, useEffect } from 'react';
import { Mail, Phone, User, Calendar, Trash2 } from 'lucide-react';
import { getAdminToken } from '../../utils/storage';

interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contacts');
      const data = await res.json();
      if (Array.isArray(data)) {
        setInquiries(data);
      } else {
        setInquiries([]);
      }
    } catch (err) {
      console.error('Failed to fetch inquiries', err);
      setError('문의 내역을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말로 이 문의 내역을 삭제하시겠습니까?')) return;
    
    const token = getAdminToken();
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setInquiries(inquiries.filter(i => i.id !== id));
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to delete inquiry', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">로딩 중...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium mb-6">문의 내역 관리</h2>
      
      {inquiries.length === 0 ? (
        <div className="bg-white p-12 text-center text-gray-500 border border-gray-100 rounded-sm">
          접수된 문의 내역이 없습니다.
        </div>
      ) : (
        <div className="grid gap-6">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 group relative">
              <button
                onClick={() => handleDelete(inquiry.id)}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="삭제"
              >
                <Trash2 size={18} />
              </button>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User size={14} />
                    <span className="font-medium text-gray-900">{inquiry.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail size={14} />
                    <span>{inquiry.email}</span>
                  </div>
                  {inquiry.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone size={14} />
                      <span>{inquiry.phone}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-end text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(inquiry.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-sm">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {inquiry.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
