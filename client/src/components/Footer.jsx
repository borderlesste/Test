import { Code2, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const socialLinks = [
    { icon: "📘", href: "https://facebook.com/borderlesstechno", label: "Facebook" },
    { icon: "🐦", href: "https://twitter.com/borderlesstechno", label: "Twitter" },
    { icon: "💼", href: "https://linkedin.com/company/borderless-techno", label: "LinkedIn" },
    { icon: "🐱", href: "https://github.com/borderlesstechno", label: "GitHub" }
  ];

  const quickLinks = [
    { name: "Inicio", href: "#inicio" },
    { name: "Servicios", href: "#servicios" },
    { name: "Nosotros", href: "#nosotros" },
    { name: "Contacto", href: "#contacto" }
  ];

  const services = [
    "Desarrollo Web",
    "Apps Móviles", 
    "Sistemas Backend",
    "Soluciones Cloud",
    "Ciberseguridad",
    "Automatización"
  ];

  return (
    <footer className="w-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-t border-white/20 dark:border-slate-700/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Code2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-base sm:text-xl font-bold text-gray-900 dark:text-white break-words">
                <span className="hidden sm:inline">BODERLESS TECHNO COMPANY</span>
                <span className="sm:hidden">BODERLESS</span>
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              Transformamos ideas en soluciones digitales innovadoras. 
              Tu partner tecnológico de confianza.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="group p-2 sm:p-3 backdrop-blur-xl bg-white/30 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/30 rounded-xl
                           hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:border-blue-500 hover:text-white hover:scale-110
                           transition-all duration-300 shadow-sm hover:shadow-lg flex-shrink-0"
                  aria-label={social.label}
                >
                  <span className="text-xl group-hover:animate-pulse">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Servicios</h3>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service}>
                  <span className="text-gray-600 dark:text-gray-300">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600 dark:text-gray-300 break-words">borderlesstechno7@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-300">+1 (717) 655-4737</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600 dark:text-gray-300">18 N 13th St. Harrisburg, Pennsylvania, 17103 United States</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 dark:border-slate-700/30 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm text-center md:text-left">
            © 2025 BODERLESS TECHNO COMPANY. Todos los derechos reservados.
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Link to="/privacy-policy" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs sm:text-sm transition-colors text-center">
              {t('footer.privacyPolicy')}
            </Link>
            <Link to="/terms-of-service" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs sm:text-sm transition-colors text-center">
              {t('footer.termsOfService')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;