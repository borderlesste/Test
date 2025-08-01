import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';

function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/projects');
      
      if (response.data.success) {
        setProjects(response.data.data);
      } else {
        setError('Error al cargar los proyectos');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(project => project.categoria === selectedCategory);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'web', label: 'Desarrollo Web' },
    { id: 'app', label: 'Aplicaciones' },
    { id: 'system', label: 'Sistemas' },
    { id: 'api', label: 'APIs' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-light to-light/80 dark:from-dark to-dark/80">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-light to-light/80 dark:from-dark to-dark/80">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
            Error al cargar proyectos
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <button 
            onClick={fetchProjects}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-light to-light/80 dark:from-dark to-dark/80">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-dark dark:text-light mb-6">
            Nuestro <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Portafolio</span>
          </h1>
          <p className="text-xl text-dark/70 dark:text-light/70 max-w-3xl mx-auto leading-relaxed">
            Descubre los proyectos que hemos desarrollado con pasión y dedicación. Cada uno representa nuestra
            experiencia en desarrollo web, aplicaciones móviles y soluciones tecnológicas innovadoras.
          </p>
        </div>
      </section>

      {/* Filter Categories */}
      <section className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                    : 'bg-white dark:bg-dark/50 text-dark dark:text-light hover:bg-primary/10 dark:hover:bg-secondary/10'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-2xl font-bold text-dark dark:text-light mb-2">
                No hay proyectos en esta categoría
              </h3>
              <p className="text-dark/60 dark:text-light/60">
                Selecciona otra categoría para ver más proyectos
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Componente para las tarjetas de proyecto
function ProjectCard({ project }) {
  return (
    <div className="group bg-white dark:bg-dark/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-200 dark:border-secondary/20">
      {/* Project Image */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={project.imagen} 
          alt={project.nombre}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-primary/90 text-white text-sm font-medium rounded-full">
            {getCategoryLabel(project.categoria)}
          </span>
        </div>
      </div>

      {/* Project Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-dark dark:text-light mb-3 group-hover:text-primary transition-colors">
          {project.nombre}
        </h3>
        <p className="text-dark/70 dark:text-light/70 mb-4 line-clamp-3">
          {project.descripcion}
        </p>
        
        {/* Technologies */}
        {project.tecnologias && project.tecnologias.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tecnologias.map((tech, index) => (
              <span key={index} className="px-3 py-1 bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-secondary/80 text-sm rounded-full">
                {tech}
              </span>
            ))}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          {project.demo && (
            <a 
              href={project.demo} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-3 px-4 rounded-lg font-medium text-center transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            >
              Ver Demo
            </a>
          )}
          {project.url && project.url !== '#' && (
            <a 
              href={project.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 bg-white dark:bg-dark border-2 border-primary text-primary py-3 px-4 rounded-lg font-medium text-center transition-all duration-300 hover:bg-primary hover:text-white"
            >
              Ver Código
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

ProjectCard.propTypes = {
  project: PropTypes.shape({
    imagen: PropTypes.string,
    nombre: PropTypes.string,
    categoria: PropTypes.string,
    descripcion: PropTypes.string,
    tecnologias: PropTypes.arrayOf(PropTypes.string),
    demo: PropTypes.string,
    url: PropTypes.string
  }).isRequired
};

// Función helper para obtener el label de la categoría
function getCategoryLabel(categoria) {
  const labels = {
    'web': 'Web',
    'app': 'App',
    'system': 'Sistema',
    'api': 'API'
  };
  return labels[categoria] || 'Proyecto';
}

export default Portfolio;