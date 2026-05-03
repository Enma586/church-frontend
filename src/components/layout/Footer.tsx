export function Footer() {
  return (
    <footer className="border-t py-3 text-center text-xs text-muted-foreground">
      RCC &copy; {new Date().getFullYear()} — Todos los derechos reservados.
    </footer>
  );
}