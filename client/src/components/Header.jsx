import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { useLanguage } from '../context/LanguageContext';
import useClickOutside from '../hooks/useClickOutside';
import Button from './Button';

import PropTypes from 'prop-types';

function Header({ companyName = "Borderless Techno Company" }) {
  const { user, logout } = useApi();
  const { t, currentLanguage, supportedLanguages, changeLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  
  const menuRef = useClickOutside(() => {
    setMenuOpen(false);
  });

  const langMenuRef = useClickOutside(() => {
    setLangMenuOpen(false);
  });

  // Eliminamos la lógica de tema local, ahora usa ThemeContext

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  // Enlaces públicos (siempre visibles)
  const publicLinks = [
    { to: '/', label: t('nav.home'), icon: '🏠' },
    { to: '/servicios', label: t('nav.services'), icon: '⚙️' },
    { to: '/portafolio', label: t('nav.portfolio'), icon: '💼' },
    { to: '/nosotros', label: t('nav.about'), icon: '👥' },
    //{ to: '/solicitud', label: 'Solicitud', icon: '📋' },
  ];

  // Enlaces mínimos para usuarios autenticados (solo panel personal)
  const getPrivateLinks = () => {
    if (!user) return [];
    
    const links = [];
    
    // Solo un enlace al panel correspondiente según el rol
    if (user.rol === 'admin') {
      links.push({ to: '/admin/dashboard', label: t('nav.dashboard'), icon: '📊' });
    } else {
      links.push({ to: '/panel-cliente', label: t('nav.myPanel'), icon: '📊' });
    }
    
    return links;
  };

  // Enlaces de autenticación
  const getAuthLinks = () => {
    if (user) {
      return [
        { 
          action: 'logout', 
          label: t('nav.logout'), 
          icon: '🚪',
          user: user.nombre || user.email 
        }
      ];
    }
    return [
      { to: '/login', label: t('nav.login'), icon: '🔐' },
    ];
  };

  const allLinks = [...publicLinks, ...getPrivateLinks()];
  const authLinks = getAuthLinks();
//min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center
  return (
    <header className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-white/20 dark:border-slate-700/30 transition-all duration-300 fixed top-0 left-0 right-0 z-50 shadow-sm" role="banner">
      <nav className="container mx-auto px-4 py-3" aria-label="Main navigation">
        <div className="flex items-center justify-between gap-4 min-h-[60px]">
          {/* Logo */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {companyName}
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2 flex-1 justify-center">
            {allLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/30 dark:hover:bg-slate-800/60 ${
                    isActive 
                      ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                <span className="hidden xl:inline mr-2">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* User Section & Controls */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Desktop Auth Links */}
            <div className="hidden lg:flex items-center space-x-3">
              {authLinks.map(link => (
                link.action === 'logout' ? (
                  <div key="user-menu" className="flex items-center space-x-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {(link.user?.charAt(0) || 'U').toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {link.user}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {user?.rol === 'admin' ? t('roles.admin') : t('roles.client')}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      icon={<span className="hidden xl:inline mr-2">{link.icon}</span>}
                    >
                      {link.label}
                    </Button>
                  </div>
                ) : (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        link.to === '/register'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                          : isActive
                            ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <span className="hidden xl:inline mr-2">{link.icon}</span>
                    {link.label}
                  </NavLink>
                )
              ))}
            </div>

            {/* Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="p-2 rounded-lg bg-white/30 dark:bg-slate-800/60 hover:bg-white/50 dark:hover:bg-slate-800/80 transition-colors duration-200 backdrop-blur-sm flex items-center space-x-1"
                aria-label={t('accessibility.selectLanguage')}
                aria-expanded={langMenuOpen}
              >
                <span className="text-lg">{supportedLanguages[currentLanguage]?.flag}</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 text-gray-700 dark:text-gray-300 ${langMenuOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 rounded-xl border border-white/20 dark:border-slate-700/30 shadow-lg z-50 animate-slideInLeft">
                  {Object.values(supportedLanguages).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors duration-200 flex items-center space-x-3 ${
                        currentLanguage === lang.code
                          ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-slate-700/40'
                      } ${
                        lang.code === Object.values(supportedLanguages)[0].code ? 'rounded-t-xl' : ''
                      } ${
                        lang.code === Object.values(supportedLanguages)[Object.values(supportedLanguages).length - 1].code ? 'rounded-b-xl' : ''
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>


            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg bg-white/30 dark:bg-slate-800/60 hover:bg-white/50 dark:hover:bg-slate-800/80 transition-colors duration-200 backdrop-blur-sm"
              aria-label={t('accessibility.openMenu')}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg 
                className={`w-6 h-6 transition-transform duration-200 text-gray-700 dark:text-gray-300`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div 
            ref={menuRef}
            className="lg:hidden mt-4 p-4 backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 rounded-xl border border-white/20 dark:border-slate-700/30 shadow-lg animate-slideInLeft"
          >
            {/* User Info Mobile */}
            {user && (
              <div className="mb-4 p-3 bg-white/40 dark:bg-slate-700/40 rounded-lg backdrop-blur-sm">
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.nombre || user.email}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.rol === 'admin' ? t('roles.admin') : t('roles.client')}
                </p>
              </div>
            )}

            {/* Navigation Links Mobile */}
            <div className="space-y-1 mb-4">
              {allLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive 
                        ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-slate-700/40'
                    }`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="mr-3">{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Auth Links Mobile */}
            <div className="border-t border-white/20 dark:border-slate-700/30 pt-4 space-y-1">
              {authLinks.map(link => (
                link.action === 'logout' ? (
                  <Button
                    key="logout"
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    icon={<span className="mr-3">{link.icon}</span>}
                  >
                    {link.label}
                  </Button>
                ) : (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        link.to === '/register'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                          : isActive
                            ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-slate-700/40'
                      }`
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="mr-3">{link.icon}</span>
                    {link.label}
                  </NavLink>
                )
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;

Header.propTypes = {
  companyName: PropTypes.string,
};