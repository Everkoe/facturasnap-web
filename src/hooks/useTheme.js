import { useState, useEffect } from 'react';

export const useTheme = () => {
  // Inicializamos el estado basándonos únicamente en lo que el usuario guardó manualmente
  // Ignoramos completamente el esquema de colores del sistema operativo (prefers-color-scheme)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    // Si no hay nada guardado, por defecto usamos 'light'
    return saved || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Aplicamos o removemos la clase dark basándonos estrictamente en el estado
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Guardamos la preferencia manual del usuario
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
};
