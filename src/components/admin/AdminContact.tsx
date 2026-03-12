import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { getAdminToken } from '../../utils/storage';

export default function AdminContact() {
  const [formData, setFormData] = useState({
    contact_address: '',
    contact_phone: '',
    contact_email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const res = await fetch('/api/contact-info');
      const data = await res.json();
      setFormData({
        contact_address: data.contact_address || '',
        contact_phone: data.contact_phone || '',
        contact_email: data.contact_email || '',
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch contact info', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const token = getAdminToken();
    try {
      const res = await fetch('/api/contact-info', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: '연락처 정보가 성공적으로 저장되었습니다.' });
      } else {
        setMessage({ type: 'error', text: '저장에 실패했습니다.' });
      }
    } catch (error) {
      console.error('Failed to save contact info', error);
      setMessage({ type: 'error', text: '저장 중 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">로딩 중...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
      <h2 className="text-xl font-medium mb-6">연락처 정보 관리</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            주소
          </label>
          <input
            type="text"
            required
            value={formData.contact_address}
            onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            placeholder="서울특별시 강남구 테헤란로 123, 4층"
          />
          <p className="text-xs text-gray-500 mt-2">
            이 주소는 Contact 페이지의 구글 지도 위치를 업데이트하는 데 사용됩니다.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            전화번호
          </label>
          <input
            type="text"
            required
            value={formData.contact_phone}
            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            placeholder="02-1234-5678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이메일
          </label>
          <input
            type="email"
            required
            value={formData.contact_email}
            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            placeholder="info@cskarchitects.com"
          />
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-6 py-2 rounded-sm hover:bg-black/90 transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            <Save size={16} />
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
