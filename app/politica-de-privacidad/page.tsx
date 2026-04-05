import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Politica de privacidad",
  description:
    "Politica de privacidad de Mob. Como protegemos tus datos personales, informacion de alquileres y documentacion de verificacion.",
  alternates: { canonical: "/politica-de-privacidad" },
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
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">
            Política de Privacidad
          </h1>
          <p className="text-lg text-foreground/70 mb-1">
            Mob – Plataforma tecnológica de alquileres
          </p>
          <p className="text-muted-foreground text-sm mb-10">
            Última actualización: 09/03/2026
          </p>

          <div className="prose prose-sm max-w-none text-foreground/80 space-y-8">
            {/* 1 */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                1. Nuestro compromiso con la privacidad
              </h2>
              <p className="leading-relaxed mb-3">
                La presente Política de Privacidad (en adelante, la &quot;Política de Privacidad&quot;) establece la forma en que Mob (en adelante, &quot;Mob&quot;, &quot;la Plataforma&quot; o &quot;nosotros&quot;), en su carácter de proveedor de servicios tecnológicos, recopila, utiliza, almacena y protege la información personal de los usuarios que acceden y utilizan el sitio web, aplicaciones y servicios digitales operados por Mob (en adelante, el &quot;Sitio&quot; o la &quot;Plataforma&quot;).
              </p>
              <p className="leading-relaxed mb-3">
                Mob opera como plataforma tecnológica que permite conectar interesados en alquilar propiedades con propietarios y/o inmobiliarias, así como facilitar procesos digitales relacionados con el alquiler.
              </p>
              <p className="leading-relaxed mb-2">
                La presente Política de Privacidad describe:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-foreground/70">
                <li>qué información recopilamos</li>
                <li>cómo utilizamos dicha información</li>
                <li>con quién podemos compartirla</li>
                <li>cómo protegemos los datos personales</li>
                <li>cuáles son los derechos de los usuarios sobre su información</li>
              </ul>
              <p className="leading-relaxed mt-3">
                Al utilizar la Plataforma, el usuario acepta los términos establecidos en esta Política de Privacidad.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                2. Recopilación y utilización de su información
              </h2>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                2.1 Información personal
              </h3>
              <p className="leading-relaxed mb-2">
                Mob podrá recopilar información personal que permita identificar a una persona física (en adelante, la &quot;Información Personal&quot;), incluyendo, entre otros:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-foreground/70 mb-4">
                <li>nombre y apellido</li>
                <li>dirección de correo electrónico</li>
                <li>número de teléfono</li>
                <li>datos de contacto</li>
                <li>información de perfil de usuario</li>
                <li>documentación de identidad</li>
                <li>información laboral o de ingresos</li>
                <li>información relacionada con propiedades publicadas o consultadas</li>
              </ul>
              <p className="leading-relaxed mb-4">
                Esta información podrá ser proporcionada voluntariamente por el usuario al utilizar la Plataforma.
              </p>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                2.2 Información proporcionada voluntariamente
              </h3>
              <p className="leading-relaxed mb-2">
                La Información Personal será recopilada cuando el usuario:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-foreground/70 mb-4">
                <li>se registre en la Plataforma</li>
                <li>cree un perfil de usuario</li>
                <li>publique o consulte propiedades</li>
                <li>solicite agendar visitas</li>
                <li>inicie procesos de reserva o alquiler</li>
                <li>cargue documentación o información adicional</li>
                <li>se comunique con otros usuarios o con Mob</li>
                <li>utilice funcionalidades de verificación o validación de perfil</li>
              </ul>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                2.3 Tratamiento automatizado
              </h3>
              <p className="leading-relaxed mb-4">
                La Información Personal podrá ser objeto de tratamiento automatizado, incluyendo el uso de herramientas tecnológicas y sistemas que pueden utilizar inteligencia artificial, algoritmos de análisis o sistemas de verificación automatizados, con el objetivo de mejorar la experiencia del usuario y optimizar el funcionamiento de la Plataforma.
              </p>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                2.4 Información sensible
              </h3>
              <p className="leading-relaxed">
                Mob no solicita ni recopila intencionalmente información sensible salvo cuando resulte estrictamente necesario para procesos de verificación de identidad o cumplimiento normativo, y siempre con el consentimiento del usuario.
              </p>
            </section>

            {/* 3 */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                3. Finalidad del uso de la información
              </h2>
              <p className="leading-relaxed mb-2">
                La Información Personal recopilada podrá ser utilizada para las siguientes finalidades:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-foreground/70 mb-3">
                <li>permitir el registro y uso de la Plataforma</li>
                <li>facilitar la interacción entre interesados, propietarios e inmobiliarias</li>
                <li>permitir la publicación y consulta de propiedades</li>
                <li>gestionar solicitudes de contacto o visitas</li>
                <li>permitir procesos digitales relacionados con alquileres</li>
                <li>verificar identidad o perfil de usuarios</li>
                <li>prevenir fraude o uso indebido de la Plataforma</li>
                <li>mejorar la seguridad de la Plataforma</li>
                <li>desarrollar, mejorar y optimizar los servicios ofrecidos</li>
                <li>realizar análisis estadísticos y estudios de uso de la plataforma</li>
                <li>enviar comunicaciones relacionadas con el servicio</li>
                <li>ofrecer nuevos productos, servicios o funcionalidades</li>
              </ul>
              <p className="leading-relaxed">
                Asimismo, la información podrá ser utilizada con fines comerciales, estadísticos o de mejora de producto, siempre respetando la normativa aplicable.
              </p>
            </section>

            {/* 4 */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                4. Información de verificación y perfil
              </h2>
              <p className="leading-relaxed mb-2">
                Con el objetivo de mejorar la confianza dentro de la Plataforma, Mob podrá solicitar a los usuarios información adicional para procesos de verificación, tales como:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-foreground/70 mb-3">
                <li>validación de identidad</li>
                <li>verificación de información de contacto</li>
                <li>verificación de perfil de usuario</li>
                <li>análisis de documentación o información declarada</li>
              </ul>
              <p className="leading-relaxed">
                Estos procesos tienen como finalidad reducir riesgos y mejorar la experiencia dentro de la Plataforma, pero no constituyen garantías absolutas sobre la identidad, solvencia o comportamiento de los usuarios.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                5. Comunicaciones electrónicas
              </h2>
              <p className="leading-relaxed mb-2">
                Mob podrá enviar comunicaciones electrónicas relacionadas con:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-foreground/70 mb-3">
                <li>el funcionamiento de la Plataforma</li>
                <li>actividades dentro de la cuenta del usuario</li>
                <li>solicitudes realizadas por el usuario</li>
                <li>novedades del servicio</li>
                <li>comunicaciones comerciales o promocionales</li>
              </ul>
              <p className="leading-relaxed">
                El usuario podrá optar por dejar de recibir comunicaciones promocionales en cualquier momento siguiendo las instrucciones indicadas en dichos mensajes.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                6. Cookies y tecnologías similares
              </h2>
              <p className="leading-relaxed mb-2">
                La Plataforma puede utilizar cookies, identificadores de dispositivo y tecnologías similares para:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-foreground/70 mb-3">
                <li>mejorar la experiencia de navegación</li>
                <li>recordar preferencias de usuario</li>
                <li>analizar comportamiento de uso</li>
                <li>optimizar el funcionamiento del sitio</li>
              </ul>
              <p className="leading-relaxed">
                El usuario puede configurar su navegador para rechazar o eliminar cookies, aunque esto podría afectar el funcionamiento de algunas funcionalidades de la Plataforma.
              </p>
            </section>

            {/* 7 */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                7. Compartiendo su información
              </h2>
              <p className="leading-relaxed mb-2">
                La Información Personal podrá ser compartida con terceros únicamente cuando resulte necesario para:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-foreground/70 mb-3">
                <li>permitir el funcionamiento de la Plataforma</li>
                <li>facilitar el contacto entre usuarios</li>
                <li>prestar servicios tecnológicos o de soporte</li>
                <li>cumplir obligaciones legales</li>
                <li>prevenir fraude o actividades ilícitas</li>
              </ul>
              <p className="leading-relaxed mb-2">
                Entre los posibles destinatarios se incluyen:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-foreground/70 mb-3">
                <li>propietarios o inmobiliarias que participan en la Plataforma</li>
                <li>proveedores tecnológicos o de infraestructura</li>
                <li>proveedores de servicios de verificación o seguridad</li>
                <li>proveedores de servicios de análisis de datos</li>
                <li>autoridades administrativas o judiciales cuando sea requerido por ley</li>
              </ul>
              <p className="leading-relaxed">
                Mob no vende Información Personal a terceros.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                8. Protección de la información
              </h2>
              <p className="leading-relaxed mb-2">
                Mob implementa medidas técnicas, administrativas y organizativas para proteger la Información Personal contra:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-foreground/70 mb-3">
                <li>accesos no autorizados</li>
                <li>pérdida o destrucción</li>
                <li>alteración o divulgación indebida</li>
              </ul>
              <p className="leading-relaxed mb-3">
                Estas medidas incluyen controles de acceso, cifrado, monitoreo de seguridad y procedimientos internos de protección de datos.
              </p>
              <p className="leading-relaxed">
                Sin perjuicio de ello, el usuario reconoce que ningún sistema de transmisión o almacenamiento de información es completamente seguro.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                9. Menores de edad
              </h2>
              <p className="leading-relaxed mb-2">
                La Plataforma está destinada a personas mayores de edad.
              </p>
              <p className="leading-relaxed mb-2">
                Mob no recopila intencionalmente información personal de menores.
              </p>
              <p className="leading-relaxed">
                Si se detecta que se ha recopilado información de un menor, dicha información podrá ser eliminada.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                10. Links externos
              </h2>
              <p className="leading-relaxed mb-2">
                La Plataforma puede contener enlaces a sitios web externos.
              </p>
              <p className="leading-relaxed mb-2">
                Mob no es responsable por las prácticas de privacidad ni el tratamiento de datos personales de dichos sitios.
              </p>
              <p className="leading-relaxed">
                Se recomienda revisar las políticas de privacidad de cada sitio externo.
              </p>
            </section>

            {/* 11 */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                11. Derechos del usuario
              </h2>
              <p className="leading-relaxed mb-2">
                De acuerdo con la legislación aplicable, el usuario podrá:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-foreground/70 mb-3">
                <li>acceder a su información personal</li>
                <li>solicitar la actualización o rectificación de datos</li>
                <li>solicitar la eliminación de su información</li>
                <li>revocar el consentimiento para determinados tratamientos</li>
              </ul>
              <p className="leading-relaxed">
                Las solicitudes podrán realizarse mediante los canales de contacto indicados al final de esta Política.
              </p>
            </section>

            {/* 12 */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                12. Cambios en la Política de Privacidad
              </h2>
              <p className="leading-relaxed mb-2">
                Mob podrá modificar esta Política de Privacidad en cualquier momento.
              </p>
              <p className="leading-relaxed">
                Las versiones actualizadas serán publicadas en la Plataforma, siendo responsabilidad del usuario revisarlas periódicamente.
              </p>
            </section>

            {/* 13 */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                13. Legislación aplicable
              </h2>
              <p className="leading-relaxed mb-2">
                La presente Política de Privacidad se rige por las leyes de la República Argentina, en particular por la Ley de Protección de Datos Personales y su normativa complementaria.
              </p>
              <p className="leading-relaxed">
                La Agencia de Acceso a la Información Pública es el órgano de control encargado de la aplicación de dicha normativa.
              </p>
            </section>

            {/* 14 */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                14. Contacto
              </h2>
              <p className="leading-relaxed">
                Para consultas, solicitudes o ejercicio de derechos relacionados con la presente Política de Privacidad, el usuario podrá contactarse con Mob a través de:{" "}
                <a
                  href="mailto:hola@mob.ar"
                  className="text-primary hover:underline font-medium"
                >
                  hola@mob.ar
                </a>
              </p>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
