import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [homeProjects, setHomeProjects] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const filtered = data.filter((p: any) => p.showOnHome === 1);
          if (filtered.length > 0) {
            setHomeProjects(filtered);
          } else {
            setHomeProjects([{ id: 'default', imageUrl: 'https://picsum.photos/seed/architecture1/1920/1080' }]);
          }
        } else {
          console.error('Expected array of projects, got:', data);
          setHomeProjects([{ id: 'default', imageUrl: 'https://picsum.photos/seed/architecture1/1920/1080' }]);
        }
      })
      .catch(err => {
        console.error(err);
        setHomeProjects([{ id: 'default', imageUrl: 'https://picsum.photos/seed/architecture1/1920/1080' }]);
      });
  }, []);

  useEffect(() => {
    if (homeProjects.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % homeProjects.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [homeProjects.length]);

  return (
    <div className="w-full h-[calc(100vh-80px)]">
      {/* Hero Section */}
      <section 
        className="relative h-full w-full flex items-end justify-start overflow-hidden cursor-pointer"
        onClick={() => navigate('/projects')}
      >
        <div className="absolute inset-0 z-0">
          <AnimatePresence>
            {homeProjects.length > 0 && (
              <motion.img
                key={homeProjects[currentIndex].id}
                src={homeProjects[currentIndex].imageUrl}
                alt="Background"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
        </div>

        <div className="relative z-20 text-white p-8 md:p-12 w-full max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {homeProjects.length > 0 && homeProjects[currentIndex].title && (
              <motion.div
                key={homeProjects[currentIndex].id + "-text"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-2xl"
              >
                <h2 className="text-2xl md:text-4xl font-light tracking-tight mb-2">
                  {homeProjects[currentIndex].title}
                </h2>
                <div className="flex items-center gap-4 text-sm md:text-base text-gray-300 font-light">
                  <span className="text-accent font-mono">{homeProjects[currentIndex].year}</span>
                  {homeProjects[currentIndex].description && (
                    <>
                      <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                      <span className="line-clamp-2">{homeProjects[currentIndex].description}</span>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
