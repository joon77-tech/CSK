import React, { useState, useEffect } from 'react';
import { Mail, Phone, User, Calendar, Trash2, CheckSquare, Square, X } from 'lucide-react';
import { motion } from 'motion/react';
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
  
  // Bulk delete state
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; onConfirm: () => void } | null>(null);
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; message: string } | null>(null);

  const showAlert = (message: string) => {
    setAlertDialog({ isOpen: true, message });
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, message, onConfirm });
  };

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
    showConfirm('정말로 이 문의 내역을 삭제하시겠습니까?', async () => {
      const token = getAdminToken();
      try {
        const res = await fetch(`/api/contacts/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setInquiries(inquiries.filter(i => i.id !== id));
        } else {
          const errorData = await res.json().catch(() => ({}));
          showAlert(`삭제에 실패했습니다: ${errorData.error || res.statusText}`);
        }
      } catch (err) {
        console.error('Failed to delete inquiry', err);
        showAlert('삭제 중 오류가 발생했습니다.');
      }
    });
  };

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedIds([]);
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === inquiries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(inquiries.map(i => i.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      showAlert('삭제할 문의 내역을 선택해주세요.');
      return;
    }

    showConfirm(`선택한 ${selectedIds.length}개의 문의 내역을 삭제하시겠습니까?`, async () => {
      const token = getAdminToken();
      try {
        const results = await Promise.all(
          selectedIds.map(id => 
            fetch(`/api/contacts/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            })
          )
        );

        const allOk = results.every(res => res.ok);
        if (allOk) {
          setInquiries(inquiries.filter(i => !selectedIds.includes(i.id)));
          setSelectedIds([]);
          setIsDeleteMode(false);
        } else {
          showAlert('일부 문의 내역 삭제에 실패했습니다. 다시 시도해주세요.');
          fetchInquiries();
        }
      } catch (err) {
        console.error('Failed to delete inquiries', err);
        showAlert('삭제 중 오류가 발생했습니다.');
      }
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">로딩 중...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-medium">문의 내역 관리</h2>
        
        <div className="flex items-center gap-2">
          {inquiries.length > 0 && (
            <>
              {isDeleteMode ? (
                <>
                  <button
                    onClick={toggleSelectAll}
                    className="text-sm bg-white border border-gray-200 px-3 py-2 rounded-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    {selectedIds.length === inquiries.length ? <CheckSquare size={16} /> : <Square size={16} />}
                    전체 선택
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="text-sm bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-sm hover:bg-red-100 transition-colors flex items-center gap-2 font-medium"
                  >
                    <Trash2 size={16} />
                    선택 삭제 ({selectedIds.length})
                  </button>
                  <button
                    onClick={toggleDeleteMode}
                    className="text-sm bg-white border border-gray-200 px-3 py-2 rounded-sm hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <X size={16} />
                    취소
                  </button>
                </>
              ) : (
                <button
                  onClick={toggleDeleteMode}
                  className="text-sm bg-white border border-gray-200 px-4 py-2 rounded-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  문의내역 삭제
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      {inquiries.length === 0 ? (
        <div className="bg-white p-12 text-center text-gray-500 border border-gray-100 rounded-sm">
          접수된 문의 내역이 없습니다.
        </div>
      ) : (
        <div className="grid gap-6">
          {inquiries.map((inquiry) => (
            <div 
              key={inquiry.id} 
              className={`bg-white p-6 rounded-sm shadow-sm border transition-all group relative ${
                isDeleteMode && selectedIds.includes(inquiry.id) 
                  ? 'border-red-200 bg-red-50/30' 
                  : 'border-gray-100'
              } ${isDeleteMode ? 'cursor-pointer hover:border-red-200' : ''}`}
              onClick={() => isDeleteMode && toggleSelection(inquiry.id)}
            >
              {!isDeleteMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(inquiry.id);
                  }}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="삭제"
                >
                  <Trash2 size={18} />
                </button>
              )}

              <div className="flex gap-4">
                {isDeleteMode && (
                  <div className="pt-1">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      selectedIds.includes(inquiry.id) ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'
                    }`}>
                      {selectedIds.includes(inquiry.id) && <CheckSquare size={14} className="text-white" />}
                    </div>
                  </div>
                )}
                
                <div className="flex-1">
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      {confirmDialog?.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">확인</h3>
              <p className="text-gray-600">{confirmDialog.message}</p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                확인
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Alert Modal */}
      {alertDialog?.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">알림</h3>
              <p className="text-gray-600">{alertDialog.message}</p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setAlertDialog(null)}
                className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-black/80 rounded-md transition-colors"
              >
                확인
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
