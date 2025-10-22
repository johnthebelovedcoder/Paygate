import React, { createContext, useContext, ReactNode } from 'react';
import i18n from '../i18n';
import { languages } from '../i18n';

interface LanguageContextType {
  currentLanguage: string;
  availableLanguages: { code: string; name: string; flag: string }[];
  changeLanguage: (lang: string) => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Initialize language from localStorage or default to 'en'
  const initialLanguage = localStorage.getItem('language') || 'en';
  i18n.changeLanguage(initialLanguage);

  const value: LanguageContextType = {
    currentLanguage: i18n.language,
    availableLanguages: languages,
    changeLanguage,
    t: (key: string, options?: any) => i18n.t(key, options),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};