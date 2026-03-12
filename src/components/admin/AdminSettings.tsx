import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { getAdminToken } from '../../utils/storage';

export default function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    const token = getAdminToken();

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || '비밀번호 변경에 실패했습니다.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
      <h2 className="text-xl font-medium mb-6">관리자 설정</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">비밀번호 변경</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            현재 비밀번호
          </label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            새 비밀번호
          </label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            새 비밀번호 확인
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded-sm hover:bg-black/90 transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            <Save size={16} />
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </div>
      </form>
    </div>
  );
}
