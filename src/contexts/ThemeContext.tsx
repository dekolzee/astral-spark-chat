
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  card: string;
  border: string;
}

export interface ThemeConfig {
  mode: 'dark' | 'light';
  colors: ThemeColors;
  font: 'inter' | 'cyber';
}

interface ThemeContextType {
  theme: ThemeConfig;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
}

const defaultTheme: ThemeConfig = {
  mode: 'dark',
  colors: {
    primary: '263 70% 50%',
    secondary: '180 62% 55%',
    accent: '315 100% 75%',
    background: '220 23% 5%',
    foreground: '220 14% 96%',
    card: '220 23% 8%',
    border: '220 23% 15%',
  },
  font: 'inter',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('chatbot-theme');
    return saved ? JSON.parse(saved) : defaultTheme;
  });

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  useEffect(() => {
    localStorage.setItem('chatbot-theme', JSON.stringify(theme));
    
    // Apply theme to document
    const root = document.documentElement;
    
    // Toggle light/dark mode
    if (theme.mode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }

    // Apply custom colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Apply font
    root.classList.toggle('font-cyber', theme.font === 'cyber');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
