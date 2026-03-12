import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface Member {
  id: number;
  name: string;
  role: string;
  description: string;
  image_url: string;
}

interface Category {
  id: number;
  name: string;
  is_representative: number;
  members: Member[];
}

interface AboutInfo {
  quote: string;
  description: string;
}

export default function About() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [aboutInfo, setAboutInfo] = useState<AboutInfo>({ quote: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/about'),
      fetch('/api/about/info')
    ])
      .then(async ([catRes, infoRes]) => {
        const catData = await catRes.json();
        const infoData = await infoRes.json();
        setCategories(catData);
        if (infoData) {
          setAboutInfo({ quote: infoData.quote, description: infoData.description });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

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
        className="mb-24 text-center max-w-3xl mx-auto"
      >
        <h1 className="text-4xl font-light tracking-tight mb-8 uppercase">About Us</h1>
        <div className="w-12 h-0.5 bg-accent mx-auto mb-12"></div>
        <p className="text-xl text-gray-600 font-light leading-relaxed">
          {aboutInfo.quote}
        </p>
        <p className="mt-6 text-gray-500 leading-relaxed whitespace-pre-line">
          {aboutInfo.description}
        </p>
      </motion.div>

      <div className="space-y-32">
        {categories.map((cat, catIndex) => {
          if (cat.members.length === 0) return null;

          if (cat.is_representative === 1) {
            return (
              <div key={cat.id}>
                <div className={
                  cat.members.length <= 3
                    ? "flex flex-wrap justify-center gap-12 lg:gap-16"
                    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16"
                }>
                  {cat.members.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={`flex flex-col ${
                        cat.members.length <= 3 
                          ? 'w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-2.666rem)]' 
                          : ''
                      }`}
                    >
                      <div className="relative aspect-[3/4] mb-8 overflow-hidden bg-gray-100">
                        <img
                          src={member.image_url}
                          alt={member.name}
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h3 className="text-2xl font-medium mb-2">{member.name}</h3>
                      <p className="text-accent text-sm uppercase tracking-widest mb-6">{member.role}</p>
                      <p className="text-gray-500 font-light leading-relaxed">
                        {member.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          } else {
            return (
              <div key={cat.id}>
                <h2 className="text-2xl font-medium mb-12 text-center">{cat.name}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                  {cat.members.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="flex flex-col text-center"
                    >
                      <div className="relative aspect-square mb-4 overflow-hidden bg-gray-100 rounded-full w-32 h-32 mx-auto">
                        <img
                          src={member.image_url}
                          alt={member.name}
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h3 className="text-lg font-medium mb-1">{member.name}</h3>
                      <p className="text-accent text-xs uppercase tracking-widest">{member.role}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
