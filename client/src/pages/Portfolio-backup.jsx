import { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';

// Constants - Ensure all values are properly initialized
const INITIAL_STATE = Object.freeze({
  projects: [],
  loading: true,
  error: null
});

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'web', label: 'Desarrollo Web' },
  { id: 'app', label: 'Aplicaciones' },
  { id: 'system', label: 'Sistemas' },
  { id: 'api', label: 'APIs' }
];

const DEFAULT_PROJECT_IMAGE = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80';

function Portfolio() {
  console.log('🚀 Portfolio component loaded - Updated Version 2.0');
  
  // State initialization with safe defaults
  const [state, setState] = useState(INITIAL_STATE);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Destructure state for cleaner access
  const { projects, loading, error } = state;

  // Memoized filtered projects to prevent unnecessary re-calculations
  const filteredProjects = useMemo(() => {
    console.log('🔍 Filtering projects:', { projects, selectedCategory });
    
    // Double-check projects is always an array
    if (!Array.isArray(projects)) {
      console.warn('⚠️ Projects is not an array:', projects);
      return [];
    }
    
    const safeProjects = projects;
    
    if (selectedCategory === 'all') {
      return safeProjects;
    }
    
    const filtered = safeProjects.filter(project => 
      project && typeof project === 'object' && project.categoria === selectedCategory
    );
    
    console.log('✅ Filtered projects:', filtered);
    return filtered;
  }, [projects, selectedCategory]);

  // Validate and normalize project data
  const validateProject = useCallback((project) => {
    if (!project || typeof project !== 'object') {
      return null;
    }

    return {
      id: project.id || Math.random().toString(36).substr(2, 9),
      nombre: project.nombre || 'Sin título',
      descripcion: project.descripcion || 'Sin descripción disponible',
      categoria: project.categoria || 'web',
      imagen: project.imagen || DEFAULT_PROJECT_IMAGE,
      tecnologias: Array.isArray(project.tecnologias) ? project.tecnologias : [],
      demo: typeof project.demo === 'string' ? project.demo : null,
      url: typeof project.url === 'string' && project.url !== '#' ? project.url : null
    };
  }, []);

  // API fetch function with comprehensive error handling
  const fetchProjects = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await api.get('/api/projects');
      
      // Validate response structure
      if (!response || !response.data) {
        throw new Error('Invalid response structure');
      }

      let projectsData = [];

      // Handle different API response structures
      if (response.data.success && Array.isArray(response.data.data)) {
        projectsData = response.data.data;
      } else if (Array.isArray(response.data.projects)) {
        projectsData = response.data.projects;
      } else if (Array.isArray(response.data)) {
        projectsData = response.data;
      } else {
        console.warn('Unexpected API response structure:', response.data);
        projectsData = [];
      }

      // Validate and normalize each project
      const validatedProjects = projectsData
        .map(validateProject)
        .filter(Boolean); // Remove null/invalid projects

      setState(prev => ({
        ...prev,
        projects: validatedProjects,
        loading: false,
        error: null
      }));

    } catch (error) {
      console.error('Error fetching projects:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al conectar con el servidor';
      
      setState(prev => ({
        ...prev,
        projects: [],
        loading: false,
        error: errorMessage
      }));
    }
  }, [validateProject]);

  // Effect to fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Handler for category selection
  const handleCategoryChange = useCallback((categoryId) => {
    if (typeof categoryId === 'string' && CATEGORIES.some(cat => cat.id === categoryId)) {
      setSelectedCategory(categoryId);
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-light to-light/80 dark:from-dark to-dark/80">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-light to-light/80 dark:from-dark to-dark/80">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
            Error al cargar proyectos
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button 
            onClick={fetchProjects}
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cargando...' : 'Reintentar'}
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
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                    : 'bg-white dark:bg-dark/50 text-dark dark:text-light hover:bg-primary/10 dark:hover:bg-secondary/10'
                }`}
                aria-pressed={selectedCategory === category.id}
                aria-label={`Filtrar por ${category.label}`}
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
          {!Array.isArray(filteredProjects) || filteredProjects.length === 0 ? (
            <EmptyState 
              selectedCategory={selectedCategory} 
              totalProjects={Array.isArray(projects) ? projects.length : 0}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <ProjectCard 
                  key={project.id || Math.random().toString(36)} 
                  project={project} 
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Empty state component
function EmptyState({ selectedCategory, totalProjects }) {
  const categoryLabel = CATEGORIES.find(cat => cat.id === selectedCategory)?.label || 'esta categoría';
  
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📂</div>
      <h3 className="text-2xl font-bold text-dark dark:text-light mb-2">
        {totalProjects === 0 
          ? 'No hay proyectos disponibles' 
          : `No hay proyectos en ${categoryLabel.toLowerCase()}`
        }
      </h3>
      <p className="text-dark/60 dark:text-light/60">
        {totalProjects === 0 
          ? 'Los proyectos se cargarán pronto' 
          : 'Selecciona otra categoría para ver más proyectos'
        }
      </p>
    </div>
  );
}

EmptyState.propTypes = {
  selectedCategory: PropTypes.string.isRequired,
  totalProjects: PropTypes.number.isRequired
};

// Enhanced ProjectCard component with better error handling
function ProjectCard({ project }) {
  // Early return if project is invalid
  if (!project || typeof project !== 'object') {
    console.warn('Invalid project data:', project);
    return null;
  }

  // Destructure with safe defaults
  const {
    id = 'unknown',
    nombre = 'Sin título',
    descripcion = 'Sin descripción disponible',
    categoria = 'web',
    imagen = DEFAULT_PROJECT_IMAGE,
    tecnologias = [],
    demo = null,
    url = null
  } = project;
  // Safe image handler
  const handleImageError = useCallback((e) => {
    if (e.target.src !== DEFAULT_PROJECT_IMAGE) {
      e.target.src = DEFAULT_PROJECT_IMAGE;
    }
  }, []);

  return (
    <article className="group bg-white dark:bg-dark/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-200 dark:border-secondary/20">
      {/* Project Image */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={imagen} 
          alt={`Proyecto: ${nombre}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={handleImageError}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-primary/90 text-white text-sm font-medium rounded-full">
            {getCategoryLabel(categoria)}
          </span>
        </div>
      </div>

      {/* Project Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-dark dark:text-light mb-3 group-hover:text-primary transition-colors">
          {nombre}
        </h3>
        <p className="text-dark/70 dark:text-light/70 mb-4 line-clamp-3">
          {descripcion}
        </p>
        
        {/* Technologies */}
        {Array.isArray(tecnologias) && tecnologias.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tecnologias.map((tech, index) => (
              <span 
                key={`${id}-tech-${index}`}
                className="px-3 py-1 bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-secondary/80 text-sm rounded-full"
              >
                {String(tech)}
              </span>
            ))}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          {demo && (
            <a 
              href={demo} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-3 px-4 rounded-lg font-medium text-center transition-all duration-300 hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label={`Ver demo de ${nombre}`}
            >
              Ver Demo
            </a>
          )}
          {url && (
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 bg-white dark:bg-dark border-2 border-primary text-primary py-3 px-4 rounded-lg font-medium text-center transition-all duration-300 hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label={`Ver código de ${nombre}`}
            >
              Ver Código
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    imagen: PropTypes.string,
    nombre: PropTypes.string,
    categoria: PropTypes.string,
    descripcion: PropTypes.string,
    tecnologias: PropTypes.arrayOf(PropTypes.string),
    demo: PropTypes.string,
    url: PropTypes.string
  }).isRequired
};

// Enhanced function to get category label with safe fallback
function getCategoryLabel(categoria) {
  const labels = {
    'web': 'Web',
    'app': 'App',
    'system': 'Sistema',
    'api': 'API'
  };
  
  // Ensure categoria is a string and exists in labels
  if (typeof categoria === 'string' && labels[categoria]) {
    return labels[categoria];
  }
  
  return 'Proyecto';
}

export default Portfolio;