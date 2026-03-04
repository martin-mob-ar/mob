import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Términos y condiciones | Mob",
};

export default function TerminosPage() {
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
            Términos y condiciones
          </h1>
          <p className="text-muted-foreground text-sm mb-10">
            Última actualización: marzo 2026
          </p>

          <div className="prose prose-sm max-w-none text-foreground/80 space-y-8">
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                1. Aceptación de los términos
              </h2>
              <p className="leading-relaxed">
                Al acceder y utilizar la plataforma mob (en adelante, &quot;la Plataforma&quot;), el usuario acepta estos Términos y Condiciones en su totalidad. Si no está de acuerdo con alguno de los puntos, le solicitamos que no utilice nuestros servicios.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                2. Descripción del servicio
              </h2>
              <p className="leading-relaxed">
                mob es una plataforma digital que facilita el proceso de alquiler de propiedades, conectando inquilinos verificados con inmobiliarias y propietarios. Nuestros servicios incluyen la búsqueda de propiedades, verificación de identidad, gestión de garantías digitales, agenda de visitas y reservas online.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                3. Registro y cuenta de usuario
              </h2>
              <p className="leading-relaxed">
                Para acceder a determinadas funcionalidades de la Plataforma, el usuario deberá crear una cuenta proporcionando información veraz, completa y actualizada. El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que se realicen bajo su cuenta.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                4. Verificación de identidad
              </h2>
              <p className="leading-relaxed">
                mob realiza un proceso de verificación de identidad y solvencia para inquilinos. Este proceso es obligatorio para acceder a la funcionalidad de reserva y garantía digital. La información proporcionada será tratada conforme a nuestra Política de Privacidad.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                5. Garantía digital
              </h2>
              <p className="leading-relaxed">
                mob ofrece un servicio de garantía digital sujeto a aprobación. Las condiciones, costos y cobertura de la garantía serán informados al usuario previo a su contratación. mob se reserva el derecho de aprobar o rechazar solicitudes de garantía según sus criterios de evaluación.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                6. Publicaciones y contenido
              </h2>
              <p className="leading-relaxed">
                Las inmobiliarias y propietarios que publiquen propiedades en la Plataforma son responsables de la veracidad y exactitud de la información proporcionada, incluyendo precios, fotos, descripciones y disponibilidad. mob se reserva el derecho de moderar, editar o eliminar publicaciones que no cumplan con nuestras políticas.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                7. Limitación de responsabilidad
              </h2>
              <p className="leading-relaxed">
                mob actúa como intermediario tecnológico y no es parte en las relaciones contractuales de alquiler entre propietarios/inmobiliarias e inquilinos. No garantizamos la disponibilidad ininterrumpida del servicio ni nos hacemos responsables por daños indirectos derivados del uso de la Plataforma.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                8. Propiedad intelectual
              </h2>
              <p className="leading-relaxed">
                Todo el contenido de la Plataforma, incluyendo pero no limitado a textos, gráficos, logos, íconos, imágenes y software, es propiedad de mob o de sus licenciantes y está protegido por las leyes de propiedad intelectual aplicables.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                9. Modificaciones
              </h2>
              <p className="leading-relaxed">
                mob se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigencia a partir de su publicación en la Plataforma. El uso continuado del servicio tras la publicación de cambios constituye la aceptación de los mismos.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                10. Contacto
              </h2>
              <p className="leading-relaxed">
                Para consultas sobre estos Términos y Condiciones, puede comunicarse con nosotros a través de{" "}
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
