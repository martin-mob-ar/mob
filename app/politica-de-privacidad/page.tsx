import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Política de privacidad - mob",
};

export default function PrivacidadPage() {
  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container flex items-center h-14 px-4">
            <Link href="/">
              <Image
                src="/assets/mob-logo-new.png"
                alt="mob"
                width={80}
                height={20}
                className="h-5 w-auto"
              />
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="container max-w-3xl mx-auto px-4 py-12 md:py-16">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Política de privacidad
          </h1>
          <p className="text-muted-foreground text-sm mb-10">
            Última actualización: marzo 2026
          </p>

          <div className="prose prose-sm max-w-none text-foreground/80 space-y-8">
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                1. Información que recopilamos
              </h2>
              <p className="leading-relaxed">
                En mob recopilamos información personal que el usuario proporciona voluntariamente al registrarse, verificar su identidad o utilizar nuestros servicios. Esto puede incluir nombre completo, documento de identidad, correo electrónico, número de teléfono, información laboral y financiera necesaria para la verificación de solvencia.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                2. Uso de la información
              </h2>
              <p className="leading-relaxed mb-3">
                Utilizamos la información recopilada para:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-foreground/70">
                <li>Verificar la identidad y solvencia de los usuarios</li>
                <li>Gestionar el proceso de garantía digital</li>
                <li>Facilitar la comunicación entre inquilinos, propietarios e inmobiliarias</li>
                <li>Mejorar nuestros servicios y la experiencia del usuario</li>
                <li>Enviar notificaciones relevantes sobre el servicio</li>
                <li>Cumplir con obligaciones legales y regulatorias</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                3. Protección de datos
              </h2>
              <p className="leading-relaxed">
                Implementamos medidas de seguridad técnicas y organizativas para proteger la información personal contra acceso no autorizado, alteración, divulgación o destrucción. Esto incluye cifrado de datos sensibles, controles de acceso y auditorías de seguridad periódicas.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                4. Compartir información
              </h2>
              <p className="leading-relaxed">
                No vendemos ni alquilamos información personal a terceros. Podemos compartir datos con inmobiliarias y propietarios en la medida necesaria para facilitar el proceso de alquiler, y con proveedores de servicios que nos asisten en la operación de la Plataforma, siempre bajo acuerdos de confidencialidad.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                5. Cookies y tecnologías similares
              </h2>
              <p className="leading-relaxed">
                Utilizamos cookies y tecnologías similares para mejorar la experiencia de navegación, analizar el uso de la Plataforma y personalizar el contenido. El usuario puede configurar su navegador para rechazar cookies, aunque esto podría afectar la funcionalidad del servicio.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                6. Derechos del usuario
              </h2>
              <p className="leading-relaxed mb-3">
                De acuerdo con la legislación vigente, el usuario tiene derecho a:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-foreground/70">
                <li>Acceder a sus datos personales</li>
                <li>Solicitar la rectificación de datos inexactos</li>
                <li>Solicitar la eliminación de sus datos</li>
                <li>Oponerse al tratamiento de sus datos</li>
                <li>Solicitar la portabilidad de sus datos</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                7. Retención de datos
              </h2>
              <p className="leading-relaxed">
                Conservamos la información personal durante el tiempo necesario para cumplir con los fines para los cuales fue recopilada, incluyendo obligaciones legales, contables o de reporte. Una vez finalizada la relación contractual, los datos serán eliminados o anonimizados en un plazo razonable.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                8. Menores de edad
              </h2>
              <p className="leading-relaxed">
                La Plataforma no está dirigida a menores de 18 años. No recopilamos intencionalmente información de menores. Si tomamos conocimiento de que un menor ha proporcionado datos personales, procederemos a eliminarlos.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                9. Modificaciones
              </h2>
              <p className="leading-relaxed">
                Nos reservamos el derecho de actualizar esta Política de Privacidad. Notificaremos los cambios significativos a través de la Plataforma o por correo electrónico. El uso continuado del servicio tras la notificación constituye la aceptación de la política actualizada.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                10. Contacto
              </h2>
              <p className="leading-relaxed">
                Para ejercer sus derechos o realizar consultas sobre nuestra Política de Privacidad, puede comunicarse con nosotros a través de{" "}
                <a
                  href="https://wa.me/5492236000055"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  WhatsApp
                </a>
                .
              </p>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
