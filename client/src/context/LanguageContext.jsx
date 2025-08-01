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
  const [isLoading, setIsLoading] = useState(true);

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true);
        console.log(`Loading translations for language: ${currentLanguage}`);
        const response = await import(`../translations/${currentLanguage}.js`);
        console.log('Translations loaded:', response.default ? 'Success' : 'Failed - no default export');
        setTranslations(response.default || {});
      } catch (error) {
        console.error(`Error loading translations for ${currentLanguage}:`, error);
        // Fallback to Spanish if translation fails
        if (currentLanguage !== 'es') {
          try {
            console.log('Loading fallback translations (Spanish)');
            const fallback = await import('../translations/es.js');
            setTranslations(fallback.default || {});
          } catch (fallbackError) {
            console.error('Error loading fallback translations:', fallbackError);
            setTranslations({});
          }
        } else {
          setTranslations({});
        }
      } finally {
        setIsLoading(false);
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
    // Return key if translations are still loading
    if (isLoading) {
      return key;
    }
    
    // If no translations loaded, show key
    if (Object.keys(translations).length === 0) {
      console.warn(`No translations loaded for key: ${key}`);
      return key;
    }
    
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    if (value === undefined) {
      console.warn(`Translation key not found: ${key}`, 'Available translations:', Object.keys(translations));
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
    isLoading
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