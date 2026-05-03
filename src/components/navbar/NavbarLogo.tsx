import { Link } from 'react-router-dom';

export function NavbarLogo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
      <span>RCC</span>
    </Link>
  );
}