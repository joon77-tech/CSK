import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, LogOut, KeyRound } from 'lucide-react';

import AdminAbout from '../components/admin/AdminAbout';
import AdminContact from '../components/admin/AdminContact';
import AdminInquiries from '../components/admin/AdminInquiries';
import AdminSettings from '../components/admin/AdminSettings';

interface Project {
  id: number;
  title: string;
  year: string;
  description: string;
  imageUrl: string;
  showOnHome: number;
}

import { getAdminToken, setAdminToken, removeAdminToken } from '../utils/storage';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ title: '', year: '', description: '', imageUrl: '', showOnHome: false });
  const [activeTab, setActiveTab] = useState<'projects' | 'about' | 'contact' | 'inquiries' | 'settings'>('projects');
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; onConfirm: () => void } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAdminToken();
      if (token && token !== 'null' && token !== 'undefined') {
        try {
          const res = await fetch('/api/admin/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            setIsLoggedIn(true);
            fetchProjects();
          } else {
            removeAdminToken();
            setLoading(false);
          }
        } catch (error) {
          console.error('Auth verification failed', error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setAdminToken(data.token);
        setIsLoggedIn(true);
        fetchProjects();
      } else {
        setLoginError(data.error || '비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      setLoginError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    removeAdminToken();
    setIsLoggedIn(false);
    setProjects([]);
    setPassword('');
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, message, onConfirm });
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Failed to fetch projects', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        year: project.year,
        description: project.description,
        imageUrl: project.imageUrl,
        showOnHome: project.showOnHome === 1,
      });
    } else {
      setEditingProject(null);
      setFormData({ title: '', year: '', description: '', imageUrl: '', showOnHome: false });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({ title: '', year: '', description: '', imageUrl: '', showOnHome: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAdminToken();
    try {
      if (editingProject) {
        await fetch(`/api/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData),
        });
      }
      fetchProjects();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save project', error);
    }
  };

  const handleDelete = async (id: number) => {
    showConfirm('정말로 이 프로젝트를 삭제하시겠습니까?', async () => {
      const token = getAdminToken();
      try {
        await fetch(`/api/projects/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchProjects();
      } catch (error) {
        console.error('Failed to delete project', error);
      }
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-medium tracking-tight uppercase mb-2">Admin Login</h1>
            <div className="w-8 h-0.5 bg-accent mx-auto"></div>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                placeholder="관리자 비밀번호를 입력하세요"
              />
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-black text-white py-3 rounded-sm font-medium uppercase tracking-widest hover:bg-black/90 transition-colors disabled:opacity-70"
            >
              {loginLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-4xl font-light tracking-tight mb-4 uppercase">Admin Dashboard</h1>
          <div className="w-12 h-0.5 bg-accent mb-8 md:mb-0"></div>
        </div>
        
        <div className="flex gap-4">
          {activeTab === 'projects' && (
            <button
              onClick={() => handleOpenModal()}
              className="bg-black text-white px-6 py-3 rounded-sm font-medium flex items-center gap-2 hover:bg-black/80 transition-colors"
            >
              <Plus size={18} /> 새 프로젝트 추가
            </button>
          )}
          <button
            onClick={handleLogout}
            className="border border-gray-200 text-gray-600 px-4 py-3 rounded-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
            title="로그아웃"
          >
            <LogOut size={18} />
          </button>
        </div>
      </motion.div>

      <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'projects' ? 'border-b-2 border-accent text-accent' : 'text-gray-500 hover:text-black'}`}
        >
          프로젝트 관리
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'about' ? 'border-b-2 border-accent text-accent' : 'text-gray-500 hover:text-black'}`}
        >
          About 페이지 관리
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'contact' ? 'border-b-2 border-accent text-accent' : 'text-gray-500 hover:text-black'}`}
        >
          Contact 페이지 관리
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'inquiries' ? 'border-b-2 border-accent text-accent' : 'text-gray-500 hover:text-black'}`}
        >
          문의 내역
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-4 px-2 font-medium transition-colors flex items-center gap-1 ${activeTab === 'settings' ? 'border-b-2 border-accent text-accent' : 'text-gray-500 hover:text-black'}`}
        >
          <KeyRound size={16} /> 설정
        </button>
      </div>

      {activeTab === 'projects' ? (
        <>
          <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm uppercase tracking-wider text-gray-500">
                <th className="p-4 font-medium">이미지</th>
                <th className="p-4 font-medium">프로젝트명</th>
                <th className="p-4 font-medium">연도</th>
                <th className="p-4 font-medium">홈 화면</th>
                <th className="p-4 font-medium">설명</th>
                <th className="p-4 font-medium text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="w-16 h-16 rounded-sm overflow-hidden bg-gray-100">
                      <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  </td>
                  <td className="p-4 font-medium">{project.title}</td>
                  <td className="p-4 text-gray-500">{project.year}</td>
                  <td className="p-4">
                    {project.showOnHome === 1 ? (
                      <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-xs rounded-sm font-medium">표시됨</span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-400 text-xs rounded-sm">숨김</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-500 text-sm max-w-xs truncate">{project.description}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleOpenModal(project)}
                        className="p-2 text-gray-400 hover:text-accent transition-colors"
                        title="수정"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    등록된 프로젝트가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-medium">
                {editingProject ? '프로젝트 수정' : '새 프로젝트 추가'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-black transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">프로젝트명</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                  placeholder="예: The Modern Villa"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">연도</label>
                <input
                  type="text"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                  placeholder="예: 2025"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이미지 URL</label>
                <div className="flex gap-4">
                  <input
                    type="url"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                    placeholder="https://..."
                  />
                  {formData.imageUrl && (
                    <div className="w-12 h-12 rounded-sm overflow-hidden border border-gray-200 shrink-0">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnHome}
                    onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                    className="w-5 h-5 text-accent border-gray-300 rounded focus:ring-accent"
                  />
                  <span className="text-sm font-medium text-gray-700">홈 화면 배경으로 사용</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-8">체크하면 메인 화면의 슬라이드쇼 배경으로 나타납니다.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">프로젝트 설명</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-none"
                  placeholder="프로젝트에 대한 간단한 설명을 입력하세요."
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-sm font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-black text-white rounded-sm font-medium hover:bg-black/80 transition-colors"
                >
                  저장하기
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
        </>
      ) : activeTab === 'about' ? (
        <AdminAbout />
      ) : activeTab === 'contact' ? (
        <AdminContact />
      ) : activeTab === 'inquiries' ? (
        <AdminInquiries />
      ) : (
        <AdminSettings />
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
    </div>
  );
}
