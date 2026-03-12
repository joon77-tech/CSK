import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Project {
  id: number;
  title: string;
  year: string;
  description: string;
  imageUrl: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          console.error('Expected array of projects, got:', data);
          setProjects([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch projects', err);
        setProjects([]);
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
        className="mb-16 text-center"
      >
        <h1 className="text-4xl font-light tracking-tight mb-4 uppercase">Projects</h1>
        <div className="w-12 h-0.5 bg-accent mx-auto"></div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
          >
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center text-white p-6 text-center">
              <h3 className="text-2xl font-medium mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                {project.title}
              </h3>
              <p className="text-accent font-mono text-sm mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                {project.year}
              </p>
              <p className="text-sm font-light text-gray-300 line-clamp-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                {project.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
