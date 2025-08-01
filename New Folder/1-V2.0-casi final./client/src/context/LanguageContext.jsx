import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const SUPPORTED_LANGUAGES = {
  es: { code: 'es', name: 'Español', flag: '🇪🇸' },
  en: { code: 'en', name: 'English', flag: '🇺🇸' },
  fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
  pt: { code: 'pt', name: 'Português', flag: '🇧🇷' }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('es');
  const [translations, setTranslations] = useState({});

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await import(`../translations/${currentLanguage}.js`);
        setTranslations(response.default);
      } catch (error) {
        console.error(`Error loading translations for ${currentLanguage}:`, error);
        // Fallback to Spanish if translation fails
        if (currentLanguage !== 'es') {
          try {
            const fallback = await import('../translations/es.js');
            setTranslations(fallback.default);
          } catch (fallbackError) {
            console.error('Error loading fallback translations:', fallbackError);
          }
        }
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && SUPPORTED_LANGUAGES[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (languageCode) => {
    if (SUPPORTED_LANGUAGES[languageCode]) {
      setCurrentLanguage(languageCode);
      localStorage.setItem('language', languageCode);
    }
  };

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    if (value === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    
    // Replace parameters in translation
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match;
      });
    }
    
    return value;
  };

  const value = {
    currentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    changeLanguage,
    t,
    isLoading: Object.keys(translations).length === 0
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};