import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { getAdminToken } from '../../utils/storage';

interface Member {
  id: number;
  category_id: number;
  name: string;
  role: string;
  description: string;
  image_url: string;
  order_index: number;
}

interface Category {
  id: number;
  name: string;
  is_representative: number;
  order_index: number;
  members: Member[];
}

interface AboutInfo {
  quote: string;
  description: string;
}

export default function AdminAbout() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [aboutInfo, setAboutInfo] = useState<AboutInfo>({ quote: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Modals state
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catIsRep, setCatIsRep] = useState(false);

  const [isMemModalOpen, setIsMemModalOpen] = useState(false);
  const [editingMem, setEditingMem] = useState<Member | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [memData, setMemData] = useState({ name: '', role: '', description: '', image_url: '' });

  // Delete mode state
  const [deleteModeCatId, setDeleteModeCatId] = useState<number | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; onConfirm: () => void } | null>(null);
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; message: string } | null>(null);

  const showAlert = (message: string) => {
    setAlertDialog({ isOpen: true, message });
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, message, onConfirm });
  };

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const [catRes, infoRes] = await Promise.all([
        fetch('/api/about'),
        fetch('/api/about/info')
      ]);
      const catData = await catRes.json();
      const infoData = await infoRes.json();
      setCategories(catData);
      if (infoData) {
        setAboutInfo({ quote: infoData.quote, description: infoData.description });
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch about data', error);
      setLoading(false);
    }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingInfo(true);
    const token = getAdminToken();
    try {
      await fetch('/api/about/info', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(aboutInfo),
      });
      showAlert('회사 소개가 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save about info', error);
      showAlert('저장에 실패했습니다.');
    } finally {
      setIsSavingInfo(false);
    }
  };

  // Category Handlers
  const handleOpenCatModal = (cat?: Category) => {
    if (cat) {
      setEditingCat(cat);
      setCatName(cat.name);
      setCatIsRep(cat.is_representative === 1);
    } else {
      setEditingCat(null);
      setCatName('');
      setCatIsRep(false);
    }
    setIsCatModalOpen(true);
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAdminToken();
    try {
      if (editingCat) {
        await fetch(`/api/about/categories/${editingCat.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: catName, is_representative: catIsRep ? 1 : 0, order_index: editingCat.order_index }),
        });
      } else {
        await fetch('/api/about/categories', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: catName, is_representative: catIsRep ? 1 : 0, order_index: categories.length }),
        });
      }
      fetchAboutData();
      setIsCatModalOpen(false);
    } catch (error) {
      console.error('Failed to save category', error);
    }
  };

  const handleDeleteCat = async (id: number) => {
    showConfirm('이 카테고리와 포함된 모든 구성원을 삭제하시겠습니까?', async () => {
      const token = getAdminToken();
      try {
        await fetch(`/api/about/categories/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchAboutData();
      } catch (error) {
        console.error('Failed to delete category', error);
      }
    });
  };

  // Member Handlers
  const handleOpenMemModal = (catId: number, mem?: Member) => {
    setSelectedCatId(catId);
    if (mem) {
      setEditingMem(mem);
      setMemData({
        name: mem.name,
        role: mem.role,
        description: mem.description || '',
        image_url: mem.image_url,
      });
    } else {
      setEditingMem(null);
      setMemData({ name: '', role: '', description: '', image_url: '' });
    }
    setIsMemModalOpen(true);
  };

  const handleSaveMem = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAdminToken();
    try {
      if (editingMem) {
        await fetch(`/api/about/members/${editingMem.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ...memData, order_index: editingMem.order_index }),
        });
      } else {
        const cat = categories.find(c => c.id === selectedCatId);
        const order_index = cat ? cat.members.length : 0;
        await fetch('/api/about/members', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ...memData, category_id: selectedCatId, order_index }),
        });
      }
      fetchAboutData();
      setIsMemModalOpen(false);
    } catch (error) {
      console.error('Failed to save member', error);
    }
  };

  const toggleDeleteMode = (catId: number) => {
    if (deleteModeCatId === catId) {
      setDeleteModeCatId(null);
      setSelectedMembers([]);
    } else {
      setDeleteModeCatId(catId);
      setSelectedMembers([]);
    }
  };

  const toggleMemberSelection = (memId: number) => {
    setSelectedMembers(prev =>
      prev.includes(memId) ? prev.filter(id => id !== memId) : [...prev, memId]
    );
  };

  const handleDeleteSelectedMembers = async () => {
    if (selectedMembers.length === 0) {
      showAlert('삭제할 구성원을 선택해주세요.');
      return;
    }
    showConfirm(`선택한 ${selectedMembers.length}명의 구성원을 삭제하시겠습니까?`, async () => {
      const token = getAdminToken();
      try {
        await Promise.all(
          selectedMembers.map(id =>
            fetch(`/api/about/members/${id}`, { 
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            })
          )
        );
        fetchAboutData();
        setDeleteModeCatId(null);
        setSelectedMembers([]);
      } catch (error) {
        console.error('Failed to delete members', error);
        showAlert('일부 구성원 삭제에 실패했습니다.');
      }
    });
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="space-y-12">
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-100">
          <h3 className="font-medium text-lg">회사 소개글 관리</h3>
        </div>
        <form onSubmit={handleSaveInfo} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">대표 문구 (인용구)</label>
            <input
              type="text"
              required
              value={aboutInfo.quote}
              onChange={(e) => setAboutInfo({ ...aboutInfo, quote: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-accent/50 focus:border-accent"
              placeholder='"건축은 단순한 구조물이 아닌, 사람의 삶을 담는 그릇입니다."'
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상세 소개글</label>
            <textarea
              required
              rows={5}
              value={aboutInfo.description}
              onChange={(e) => setAboutInfo({ ...aboutInfo, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"
              placeholder="회사에 대한 상세한 소개를 입력하세요."
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingInfo}
              className="px-6 py-3 bg-black text-white rounded-sm font-medium hover:bg-black/80 transition-colors disabled:opacity-50"
            >
              {isSavingInfo ? '저장 중...' : '소개글 저장'}
            </button>
          </div>
        </form>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-light">구성원 카테고리 관리</h2>
        <button
          onClick={() => handleOpenCatModal()}
          className="bg-black text-white px-4 py-2 rounded-sm font-medium flex items-center gap-2 hover:bg-black/80 transition-colors text-sm"
        >
          <Plus size={16} /> 새 카테고리 추가
        </button>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-medium text-lg flex items-center gap-2">
              {cat.name}
              {cat.is_representative === 1 && (
                <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-sm">기본 (회사 대표)</span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {deleteModeCatId === cat.id ? (
                <>
                  <button
                    onClick={() => setDeleteModeCatId(null)}
                    className="text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-sm hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleDeleteSelectedMembers}
                    className="text-sm bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-sm hover:bg-red-100 transition-colors"
                  >
                    선택 삭제 ({selectedMembers.length})
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleOpenMemModal(cat.id)}
                    className="text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-sm hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> 구성원 추가
                  </button>
                  <button
                    onClick={() => toggleDeleteMode(cat.id)}
                    className="text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-sm hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={14} /> 구성원 삭제
                  </button>
                  <button onClick={() => handleOpenCatModal(cat)} className="p-1.5 text-gray-400 hover:text-accent transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteCat(cat.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="p-4">
            {cat.members.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">등록된 구성원이 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.members.map((mem) => (
                  <div
                    key={mem.id}
                    className={`border rounded-sm p-4 flex gap-4 items-start transition-colors ${
                      deleteModeCatId === cat.id && selectedMembers.includes(mem.id)
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-100'
                    } ${deleteModeCatId === cat.id ? 'cursor-pointer hover:border-red-300' : ''}`}
                    onClick={() => {
                      if (deleteModeCatId === cat.id) {
                        toggleMemberSelection(mem.id);
                      }
                    }}
                  >
                    {deleteModeCatId === cat.id && (
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(mem.id)}
                          onChange={() => {}}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                        />
                      </div>
                    )}
                    <img src={mem.image_url} alt={mem.name} className="w-16 h-16 object-cover rounded-sm bg-gray-100 shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{mem.name}</h4>
                      <p className="text-sm text-accent truncate mb-1">{mem.role}</p>
                      {cat.is_representative === 1 && mem.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">{mem.description}</p>
                      )}
                    </div>
                    {deleteModeCatId !== cat.id && (
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); handleOpenMemModal(cat.id, mem); }} className="text-gray-400 hover:text-accent">
                          <Edit2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-sm w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-medium">{editingCat ? '카테고리 수정' : '새 카테고리 추가'}</h2>
              <button onClick={() => setIsCatModalOpen(false)} className="text-gray-400 hover:text-black"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveCat} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">카테고리명</label>
                <input type="text" required value={catName} onChange={(e) => setCatName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-accent/50 focus:border-accent" placeholder="예: 디자이너" />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={catIsRep} onChange={(e) => setCatIsRep(e.target.checked)} className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent" />
                  <span className="text-sm font-medium text-gray-700">대표 카테고리 (크게 표시, 설명 포함)</span>
                </label>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsCatModalOpen(false)} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-sm font-medium">취소</button>
                <button type="submit" className="px-6 py-2 bg-black text-white rounded-sm font-medium hover:bg-black/80">저장</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Member Modal */}
      {isMemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-sm w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-medium">{editingMem ? '구성원 수정' : '새 구성원 추가'}</h2>
              <button onClick={() => setIsMemModalOpen(false)} className="text-gray-400 hover:text-black"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveMem} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                  <input type="text" required value={memData.name} onChange={(e) => setMemData({ ...memData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:ring-2 focus:ring-accent/50 focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">직책</label>
                  <input type="text" required value={memData.role} onChange={(e) => setMemData({ ...memData, role: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:ring-2 focus:ring-accent/50 focus:border-accent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">사진 URL</label>
                <div className="flex gap-4">
                  <input type="url" required value={memData.image_url} onChange={(e) => setMemData({ ...memData, image_url: e.target.value })} className="flex-1 px-4 py-2 border border-gray-200 rounded-sm focus:ring-2 focus:ring-accent/50 focus:border-accent" />
                  {memData.image_url && (
                    <img src={memData.image_url} alt="Preview" className="w-10 h-10 object-cover rounded-sm border border-gray-200" referrerPolicy="no-referrer" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  )}
                </div>
              </div>
              {categories.find(c => c.id === selectedCatId)?.is_representative === 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">소개글</label>
                  <textarea required rows={3} value={memData.description} onChange={(e) => setMemData({ ...memData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"></textarea>
                </div>
              )}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsMemModalOpen(false)} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-sm font-medium">취소</button>
                <button type="submit" className="px-6 py-2 bg-black text-white rounded-sm font-medium hover:bg-black/80">저장</button>
              </div>
            </form>
          </motion.div>
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
