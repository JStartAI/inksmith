import { useState, useEffect } from 'react';

export function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('inksmith_theme');
    return saved ? saved === 'dark' : true; // dark by default
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