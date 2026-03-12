import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [contactInfo, setContactInfo] = useState({
    contact_address: '서울특별시 강남구 테헤란로 123, 4층',
    contact_phone: '02-1234-5678',
    contact_email: 'info@cskarchitects.com',
  });

  useEffect(() => {
    fetch('/api/contact-info')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setContactInfo(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error('Failed to fetch contact info', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <h1 className="text-4xl font-light tracking-tight mb-4 uppercase">Contact</h1>
        <div className="w-12 h-0.5 bg-accent mx-auto"></div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-16">
        {/* Contact Info & Map */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl font-medium mb-8">오시는 길</h2>
          <div className="space-y-6 mb-12">
            <div className="flex items-start gap-4">
              <MapPin className="text-accent mt-1" size={20} />
              <div>
                <p className="font-medium">주소</p>
                <p className="text-gray-500 font-light">{contactInfo.contact_address}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="text-accent mt-1" size={20} />
              <div>
                <p className="font-medium">전화번호</p>
                <p className="text-gray-500 font-light">{contactInfo.contact_phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="text-accent mt-1" size={20} />
              <div>
                <p className="font-medium">이메일</p>
                <p className="text-gray-500 font-light">{contactInfo.contact_email}</p>
              </div>
            </div>
          </div>

          {/* Map Display */}
          <div className="w-full h-[400px] bg-gray-200 rounded-sm overflow-hidden">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(contactInfo.contact_address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              className="grayscale contrast-125 opacity-90"
            ></iframe>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gray-50 p-8 md:p-12 rounded-sm"
        >
          <h2 className="text-2xl font-medium mb-8">문의하기</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors bg-white"
                placeholder="홍길동"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors bg-white"
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors bg-white"
                placeholder="010-0000-0000"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                문의 내용
              </label>
              <textarea
                id="message"
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors bg-white resize-none"
                placeholder="프로젝트 의뢰 및 문의사항을 남겨주세요."
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-black text-white py-4 rounded-sm font-medium uppercase tracking-widest hover:bg-black/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {status === 'loading' ? '전송 중...' : (
                <>메시지 보내기 <Send size={16} /></>
              )}
            </button>

            {status === 'success' && (
              <p className="text-green-600 text-center text-sm mt-4">
                문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변 드리겠습니다.
              </p>
            )}
            {status === 'error' && (
              <p className="text-red-600 text-center text-sm mt-4">
                전송에 실패했습니다. 다시 시도해 주세요.
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
