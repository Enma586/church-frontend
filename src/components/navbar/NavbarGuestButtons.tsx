import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NavbarGuestButtons() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/login">Iniciar sesión</Link>
      </Button>
      <Button size="sm" asChild>
        <Link to="/register">Registrarse</Link>
      </Button>
    </div>
  );
}