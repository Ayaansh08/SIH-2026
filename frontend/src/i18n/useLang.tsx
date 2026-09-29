import React, { createContext, useContext, useState } from 'react';
import { DICTIONARY, type Lang, type DictKey } from './dict';

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey, params?: Record<string, string | number>) => string;
}

const LangContext = createContext<LangContextType | null>(null);

const STORAGE_KEY = 'pravahx:citizen_lang';

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang;
      if (saved === 'en' || saved === 'hi') return saved;
    }
    return 'en';
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLang);
    }
  };

  const t = (key: DictKey, params?: Record<string, string | number>): string => {
    const langDict = DICTIONARY[lang] || DICTIONARY.en;
    let template = langDict[key] || DICTIONARY.en[key] || (key as string);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return template;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error('useLang must be used within a LangProvider');
  }
  return ctx;
}
