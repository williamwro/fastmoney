
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleTheme} 
      aria-label="Alternar tema"
      className="w-auto px-3 gap-2"
    >
      {theme === 'light' ? (
        <>
          <Moon className="h-[1.2rem] w-[1.2rem]" />
          <span className="hidden sm:inline">Modo Escuro</span>
        </>
      ) : (
        <>
          <Sun className="h-[1.2rem] w-[1.2rem]" />
          <span className="hidden sm:inline">Modo Claro</span>
        </>
      )}
    </Button>
  );
};

export default ThemeToggle;
