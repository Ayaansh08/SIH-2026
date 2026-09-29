import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'night' | 'paper';

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const THEME_STORAGE_KEY = 'pravahx:theme';

export const ThemeProvider: React.FC<{
  defaultTheme?: Theme;
  children: React.ReactNode;
}> = ({ defaultTheme = 'night', children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
      if (saved === 'night' || saved === 'paper') {
        return saved;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'paper';
      }
    }
    return defaultTheme;
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'night' ? 'paper' : 'night');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`inline-flex border border-current bg-transparent shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setTheme('night')}
        className={`min-h-[32px] px-2.5 py-1 font-mono text-xs font-bold transition-colors ${
          theme === 'night'
            ? 'bg-ink text-paper'
            : 'text-current hover:bg-black/10'
        }`}
        aria-label="Night Theme"
      >
        NIGHT
      </button>
      <button
        type="button"
        onClick={() => setTheme('paper')}
        className={`min-h-[32px] px-2.5 py-1 font-mono text-xs font-bold transition-colors border-l border-current ${
          theme === 'paper'
            ? 'bg-ink text-paper'
            : 'text-current hover:bg-black/10'
        }`}
        aria-label="Paper Theme"
      >
        PAPER
      </button>
    </div>
  );
};
