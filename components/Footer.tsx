import Link from "next/link";
import Image from "next/image";
const mobLogo = "/assets/mob-logo-new.png";
const navLinks = [{
  path: "/",
  label: "Inicio"
}, {
  path: "/buscar",
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
            <p className="text-muted-foreground text-sm max-w-sm">La infraestructura digital del alquiler. Procesos claros, seguros y 100% online para inquilinos, inmobiliarias y propietarios</p>
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
                <Link href="/blog" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/calculadora-ipc" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Calculadora IPC
                </Link>
              </li>
              <li>
                <Link href="/calculadora-creditos-hipotecarios" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
            © {new Date().getFullYear()} <span className="font-ubuntu">mob</span>. Todos los derechos reservados.
          </p>
          <p className="text-muted-foreground text-xs">
            Hecho con ❤️ para simplificar el alquiler
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;