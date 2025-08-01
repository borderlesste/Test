import { useState } from 'react';

const services = [
  {
    nombre: "Desarrollo Web",
    descripcion: "Sitios web modernos, responsivos y optimizados para tu negocio.",
    icono: "🌐",
    tecnologias: ["React", "Next.js", "Node.js", "TypeScript", "Tailwind CSS"],
    caracteristicas: [
      "Diseño responsive y mobile-first",
      "Optimización SEO avanzada",
      "Velocidad de carga optimizada",
      "Integración con CMS",
      "Análisis y métricas"
    ],
    tiempoEntrega: "3-6 semanas",
    precio: "Desde $1,500",
    casos: [
      "Sitios web corporativos",
      "Landing pages",
      "Portafolios profesionales",
      "Blogs y sitios de contenido"
    ]
  },
  {
    nombre: "Aplicaciones a Medida",
    descripcion: "Soluciones personalizadas para automatizar y potenciar tus procesos.",
    icono: "⚙️",
    tecnologias: ["React", "Node.js", "PostgreSQL", "Docker", "AWS"],
    caracteristicas: [
      "Diseño centrado en el usuario",
      "Arquitectura escalable",
      "Integración con sistemas existentes",
      "Dashboards y reportes",
      "API robustas"
    ],
    tiempoEntrega: "6-12 semanas",
    precio: "Desde $3,500",
    casos: [
      "Sistemas de gestión",
      "Plataformas de trabajo",
      "Automatización de procesos",
      "Herramientas internas"
    ]
  },
  {
    nombre: "E-commerce",
    descripcion: "Tiendas online seguras, escalables y fáciles de administrar.",
    icono: "🛒",
    tecnologias: ["Shopify", "WooCommerce", "Stripe", "PayPal", "AWS"],
    caracteristicas: [
      "Gestión de inventario avanzada",
      "Múltiples métodos de pago",
      "Seguridad PCI compliant",
      "Integración con logística",
      "Analytics de ventas"
    ],
    tiempoEntrega: "4-8 semanas",
    precio: "Desde $2,500",
    casos: [
      "Tiendas online completas",
      "Marketplaces B2B",
      "Plataformas de suscripción",
      "Catálogos digitales"
    ]
  },
  {
    nombre: "Integraciones y APIs",
    descripcion: "Conecta tus sistemas y plataformas de forma eficiente.",
    icono: "🔗",
    tecnologias: ["REST API", "GraphQL", "Webhooks", "OAuth", "JSON"],
    caracteristicas: [
      "Sincronización en tiempo real",
      "Manejo de grandes volúmenes",
      "Autenticación segura",
      "Documentación completa",
      "Monitoreo y logging"
    ],
    tiempoEntrega: "2-4 semanas",
    precio: "Desde $1,000",
    casos: [
      "Integración con CRM",
      "Conexión con ERPs",
      "APIs de terceros",
      "Automatización de datos"
    ]
  },
  {
    nombre: "Soporte y Mantenimiento",
    descripcion: "Acompañamiento técnico y mejoras continuas para tu proyecto.",
    icono: "🛠️",
    tecnologias: ["Monitoreo 24/7", "Backup automático", "Actualizaciones", "Seguridad"],
    caracteristicas: [
      "Soporte técnico prioritario",
      "Actualizaciones regulares",
      "Copias de seguridad automáticas",
      "Monitoreo de rendimiento",
      "Mejoras y optimizaciones"
    ],
    tiempoEntrega: "Servicio continuo",
    precio: "Desde $200/mes",
    casos: [
      "Mantenimiento preventivo",
      "Soporte técnico",
      "Actualizaciones de seguridad",
      "Optimización de rendimiento"
    ]
  },
  {
    nombre: "Consultoría Digital",
    descripcion: "Estrategias y asesoramiento para acelerar tu transformación digital.",
    icono: "💡",
    tecnologias: ["Análisis de procesos", "Arquitectura de sistemas", "Estrategia digital"],
    caracteristicas: [
      "Análisis de necesidades",
      "Estrategia tecnológica",
      "Roadmap de implementación",
      "Capacitación de equipos",
      "Seguimiento y mejora"
    ],
    tiempoEntrega: "2-6 semanas",
    precio: "Desde $800",
    casos: [
      "Auditoría tecnológica",
      "Estrategia digital",
      "Migración a la nube",
      "Optimización de procesos"
    ]
  },
];

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);

  return (
    <section className="min-h-screen py-16 px-4 md:px-0 relative overflow-hidden">
      {/* Fondo con gradiente y elementos decorativos */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"></div>
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-br from-slate-200/15 to-blue-200/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/4 right-10 w-36 h-36 bg-gradient-to-br from-blue-200/15 to-cyan-200/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Título principal */}
        <div className="text-center mb-16">
          <div className="inline-block backdrop-blur-xl bg-white/30 dark:bg-slate-800/30 rounded-2xl border border-white/20 dark:border-slate-700/20 px-8 py-4">
            <h2 className="text-4xl font-light text-slate-800 dark:text-slate-200 mb-2">Nuestros Servicios</h2>
            <div className="w-20 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto rounded-full"></div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-6 max-w-2xl mx-auto">
            Transformamos ideas en soluciones digitales innovadoras que impulsan tu negocio hacia el futuro.
          </p>
        </div>

        {/* Grid de servicios */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {services.map((service, idx) => (
            <div 
              key={idx} 
              className="backdrop-blur-xl bg-white/30 dark:bg-slate-800/30 rounded-2xl border border-white/20 dark:border-slate-700/20 shadow-2xl p-8 hover:transform hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedService(service)}
            >
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">{service.icono}</div>
                <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-2">{service.nombre}</h3>
                <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto rounded-full"></div>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                {service.descripcion}
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">Tiempo:</span>
                  <span className="text-slate-600 dark:text-slate-400 text-sm">{service.tiempoEntrega}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">Precio:</span>
                  <span className="text-slate-600 dark:text-slate-400 text-sm">{service.precio}</span>
                </div>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-2">
                {service.tecnologias.slice(0, 3).map((tech, techIdx) => (
                  <span 
                    key={techIdx} 
                    className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-slate-700 dark:text-slate-300 rounded-full text-xs border border-blue-200/20 dark:border-slate-600/20"
                  >
                    {tech}
                  </span>
                ))}
                {service.tecnologias.length > 3 && (
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-slate-700 dark:text-slate-300 rounded-full text-xs border border-blue-200/20 dark:border-slate-600/20">
                    +{service.tecnologias.length - 3}
                  </span>
                )}
              </div>
              
              <div className="mt-6 text-center">
                <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  Ver más detalles →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sección de proceso de trabajo */}
        <div className="backdrop-blur-xl bg-white/30 dark:bg-slate-800/30 rounded-2xl border border-white/20 dark:border-slate-700/20 shadow-2xl p-8 mb-16">
          <h3 className="text-2xl font-light text-slate-800 dark:text-slate-200 mb-8 text-center">
            ¿Cómo trabajamos contigo?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white text-xl">💬</span>
              </div>
              <h4 className="text-slate-800 dark:text-slate-200 font-medium mb-2">Consulta inicial</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Analizamos tus necesidades y objetivos para crear una propuesta personalizada.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white text-xl">🎨</span>
              </div>
              <h4 className="text-slate-800 dark:text-slate-200 font-medium mb-2">Diseño y planificación</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Creamos prototipos y definimos la arquitectura de tu solución.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white text-xl">⚡</span>
              </div>
              <h4 className="text-slate-800 dark:text-slate-200 font-medium mb-2">Desarrollo ágil</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Desarrollamos con metodologías ágiles con entregas y feedback constante.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white text-xl">🚀</span>
              </div>
              <h4 className="text-slate-800 dark:text-slate-200 font-medium mb-2">Lanzamiento y soporte</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Desplegamos tu solución y te acompañamos en su crecimiento.</p>
            </div>
          </div>
        </div>

        {/* Sección de tecnologías */}
        <div className="backdrop-blur-xl bg-white/30 dark:bg-slate-800/30 rounded-2xl border border-white/20 dark:border-slate-700/20 shadow-2xl p-8">
          <h3 className="text-2xl font-light text-slate-800 dark:text-slate-200 mb-8 text-center">
            Tecnologías que dominamos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-slate-800 dark:text-slate-200 font-medium mb-4">Frontend</h4>
              <div className="flex flex-wrap gap-2">
                {["React", "Next.js", "Vue.js", "TypeScript", "Tailwind CSS", "Figma"].map((tech, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-slate-700 dark:text-slate-300 rounded-full text-sm border border-blue-200/20 dark:border-slate-600/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-slate-800 dark:text-slate-200 font-medium mb-4">Backend</h4>
              <div className="flex flex-wrap gap-2">
                {["Node.js", "Python", "PostgreSQL", "MongoDB", "Docker", "AWS"].map((tech, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-slate-700 dark:text-slate-300 rounded-full text-sm border border-blue-200/20 dark:border-slate-600/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-slate-800 dark:text-slate-200 font-medium mb-4">DevOps & Cloud</h4>
              <div className="flex flex-wrap gap-2">
                {["AWS", "Digital Ocean", "Vercel", "GitHub Actions", "Docker", "Kubernetes"].map((tech, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-slate-700 dark:text-slate-300 rounded-full text-sm border border-blue-200/20 dark:border-slate-600/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para detalles del servicio */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/30 dark:bg-slate-800/30 rounded-2xl border border-white/20 dark:border-slate-700/20 shadow-2xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{selectedService.icono}</div>
                <div>
                  <h3 className="text-2xl font-medium text-slate-800 dark:text-slate-200">{selectedService.nombre}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{selectedService.descripcion}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedService(null)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-slate-800 dark:text-slate-200 font-medium mb-4">Características principales</h4>
                <ul className="space-y-2">
                  {selectedService.caracteristicas.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-slate-600 dark:text-slate-400 text-sm">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-slate-800 dark:text-slate-200 font-medium mb-4">Casos de uso</h4>
                <ul className="space-y-2">
                  {selectedService.casos.map((caso, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-slate-600 dark:text-slate-400 text-sm">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{caso}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-slate-800 dark:text-slate-200 font-medium mb-4">Tecnologías utilizadas</h4>
              <div className="flex flex-wrap gap-2">
                {selectedService.tecnologias.map((tech, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-slate-700 dark:text-slate-300 rounded-full text-sm border border-blue-200/20 dark:border-slate-600/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-2xl font-light text-slate-800 dark:text-slate-200 mb-2">{selectedService.tiempoEntrega}</div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">Tiempo estimado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-slate-800 dark:text-slate-200 mb-2">{selectedService.precio}</div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">Inversión inicial</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Services;
// End of file
// --- boderles-1/public/src/pages/Services.jsx