import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

export function NavbarThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Cambiar tema">
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}