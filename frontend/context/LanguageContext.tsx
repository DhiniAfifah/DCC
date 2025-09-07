'use client';

import React, { createContext, useContext, useState } from 'react';
import { getTranslation } from '@/utils/translations';

type Language = 'id' | 'en';

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string; // Function to get translations dynamically
}>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key, // Default fallback to key itself
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => getTranslation(key, language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);