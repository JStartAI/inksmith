import { useState, useEffect } from 'react';

export function useTheme() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('inksmith_theme') === 'dark';
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('inksmith_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('inksmith_theme', 'light');
    }
  }, [dark]);

  const toggle = () => setDark(d => !d);

  return { dark, toggle };
}