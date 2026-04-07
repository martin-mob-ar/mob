import Link from "next/link";
import Image from "next/image";
const mobLogo = "/assets/mob-logo-new.png";
const navLinks = [{
  path: "/",
  label: "Inicio"
}, {
  path: "/alquileres",
  label: "Buscar propiedades"
}, {
  path: "/subir-propiedad",
  label: "Publicar propiedad"
}];
const Footer = ({ className }: { className?: string }) => {
  return <footer className={`border-t border-border bg-secondary/30 py-12 mt-12 ${className ?? ""}`}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-2">
            <Image src={mobLogo} alt="MOB" width={112} height={28} className="h-7 w-auto mb-4" />
            <p className="text-muted-foreground text-sm max-w-sm">Alquileres online con aprobación de garantías y calificación financiera para inquilinos, ofreciendo más seguridad a inmobiliarias y propietarios.</p>
          </div>
          
          {/* Navigation */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Navegación</h4>
            <ul className="space-y-2">
              {navLinks.map(link => <li key={link.path}>
                  <Link href={link.path} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>)}
            </ul>
          </div>
          
          {/* Recursos */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Recursos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/calculadora-ipc" target="_blank" rel="noopener noreferrer" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Calculadora IPC
                </Link>
                <Link href="/calculadora-ipc" className="md:hidden text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Calculadora IPC
                </Link>
              </li>
              <li>
                <Link href="/calculadora-creditos-hipotecarios" target="_blank" rel="noopener noreferrer" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Calculadora créditos hipotecarios
                </Link>
                <Link href="/calculadora-creditos-hipotecarios" className="md:hidden text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Calculadora créditos hipotecarios
                </Link>
              </li>
              <li>
                <a href="https://tally.so/r/5Bk4y6" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sumar mi inmobiliaria
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terminos-y-condiciones" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/politica-de-privacidad" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos-de-servicio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Términos de servicio
                </Link>
              </li>
              <li>
                <a href="https://wa.me/5492236000055" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Comunicate con nosotros por WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Mob Systems LLC. Todos los derechos reservados.
          </p>
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-4">
              <a href="https://wa.me/5492236000055" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="https://instagram.com/mob.alquileres" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://x.com/mob_alquileres" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="X">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;