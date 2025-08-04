'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={theme === 'light' ? 'outline' : 'ghost'}
        size="icon"
        onClick={() => setTheme('light')}
        className="h-8 w-8"
        title="Tema claro"
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Tema claro</span>
      </Button>
      <Button
        variant={theme === 'dark' ? 'outline' : 'ghost'}
        size="icon"
        onClick={() => setTheme('dark')}
        className="h-8 w-8"
        title="Tema escuro"
      >
        <Moon className="h-4 w-4" />
        <span className="sr-only">Tema escuro</span>
      </Button>
      <Button
        variant={theme === 'system' ? 'outline' : 'ghost'}
        size="icon"
        onClick={() => setTheme('system')}
        className="h-8 w-8"
        title="Tema do sistema"
      >
        <Monitor className="h-4 w-4" />
        <span className="sr-only">Tema do sistema</span>
      </Button>
    </div>
  );
}
