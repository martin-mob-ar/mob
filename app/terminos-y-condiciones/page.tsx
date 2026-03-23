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
            {/* Intro */}
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Términos y Condiciones Generales de Uso
              </h2>
              <div className="space-y-4">
                <p className="leading-relaxed">
                  Esta sección establece los términos y condiciones generales de uso (en adelante, las &quot;<strong>Condiciones Generales</strong>&quot;) aplicables al acceso y utilización del sitio web, aplicaciones, herramientas, integraciones, interfaces y demás servicios digitales operados por <strong>Mob</strong> (en adelante, &quot;<strong>Mob</strong>&quot;, la &quot;<strong>Plataforma</strong>&quot; o el &quot;<strong>Sitio</strong>&quot;), así como a los servicios tecnológicos puestos a disposición de los usuarios a través de la Plataforma (en adelante, los &quot;<strong>Servicios</strong>&quot;).
                </p>
                <p className="leading-relaxed">
                  Por favor lea estas Condiciones Generales antes de utilizar la Plataforma y/o contratar cualquiera de los Servicios ofrecidos por Mob. Si usted no está de acuerdo con estas Condiciones Generales, deberá abstenerse de utilizar la Plataforma y de contratar o utilizar cualquiera de los Servicios.
                </p>
                <p className="leading-relaxed">
                  La utilización de la Plataforma por parte del usuario implicará la aceptación plena, libre, expresa e informada de estas Condiciones Generales.
                </p>
                <p className="leading-relaxed">
                  En adelante, los términos &quot;<strong>Usted</strong>&quot;, &quot;<strong>Usuario</strong>&quot; o &quot;<strong>Usuarios</strong>&quot; harán referencia a toda persona humana o jurídica que acceda, navegue, se registre, interactúe o utilice la Plataforma por cualquier motivo, incluyendo sin limitación interesados/inquilinos, propietarios, inmobiliarias, anunciantes, visitantes y/o terceros vinculados a un proceso de alquiler.
                </p>
              </div>
            </section>

            {/* 1. ACCESO A LA PLATAFORMA */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                1. Acceso a la Plataforma
              </h2>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                1.1 Acceso a la Plataforma
              </h3>
              <p className="leading-relaxed mb-3">
                El acceso general a ciertas secciones de la Plataforma puede no requerir registro previo. Sin perjuicio de ello, el uso de determinadas funcionalidades y/o la contratación de determinados Servicios podrá requerir:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>registro previo del Usuario;</li>
                <li>validación de identidad;</li>
                <li>aceptación de condiciones particulares;</li>
                <li>provisión de información adicional;</li>
                <li>y/o el pago de un precio o comisión, según corresponda.</li>
              </ul>
              <p className="leading-relaxed mb-4">
                Mob se reserva el derecho de habilitar, restringir, modificar o discontinuar funcionalidades, flujos, productos, accesos o modalidades de registro en cualquier momento.
              </p>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                1.2 Naturaleza tecnológica del servicio
              </h3>
              <p className="leading-relaxed mb-3">
                Mob es una plataforma tecnológica que provee herramientas digitales para organizar, estructurar y facilitar procesos vinculados con alquileres, incluyendo, entre otros:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>publicación y visualización de propiedades;</li>
                <li>recepción y organización de consultas e interesados;</li>
                <li>herramientas de verificación y precalificación;</li>
                <li>gestión de documentación;</li>
                <li>agendas de visitas;</li>
                <li>flujos de reserva;</li>
                <li>contratos digitales;</li>
                <li>seguimiento operativo;</li>
                <li>paneles de supervisión;</li>
                <li>herramientas de pagos;</li>
                <li>tickets e incidencias;</li>
                <li>y funciones relacionadas.</li>
              </ul>
              <p className="leading-relaxed mb-3">
                Mob no es inmobiliaria, no es corredor inmobiliario, no presta corretaje, no administra inmuebles en carácter fiduciario o mandatario, no representa a propietarios ni a inquilinos, y no participa como parte en contratos de alquiler.
              </p>
              <p className="leading-relaxed mb-4">
                Mob actúa exclusivamente como proveedor de infraestructura tecnológica y herramientas de software.
              </p>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                1.3 Utilización de la Plataforma
              </h3>
              <p className="leading-relaxed mb-3">
                El Usuario se obliga a utilizar la Plataforma y los Servicios de conformidad con:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>estas Condiciones Generales;</li>
                <li>la legislación aplicable;</li>
                <li>la moral y buenas costumbres;</li>
                <li>los principios de buena fe;</li>
                <li>y el uso razonable de una plataforma tecnológica de alquileres.</li>
              </ul>
              <p className="leading-relaxed">
                El Usuario se obliga a abstenerse de utilizar la Plataforma con fines ilícitos, fraudulentos, engañosos, abusivos, lesivos de derechos de terceros o que de cualquier modo puedan dañar, sobrecargar, inutilizar o afectar el normal funcionamiento de la Plataforma.
              </p>
            </section>

            {/* 2. CONTENIDO DE LA PLATAFORMA */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                2. Contenido de la Plataforma
              </h2>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                2.1 Propiedad intelectual
              </h3>
              <p className="leading-relaxed mb-4">
                Todos los contenidos de la Plataforma, incluyendo sin limitación textos, interfaces, diseños, logos, marcas, software, bases de datos, arquitectura funcional, código, animaciones, imágenes, composiciones visuales, flujos, documentación, modelos de interfaz y cualquier otro material (en adelante, el &quot;Contenido&quot;), son de propiedad de Mob y/o de sus licenciantes, afiliadas, proveedores o terceros autorizados, y se encuentran protegidos por la normativa aplicable en materia de propiedad intelectual e industrial.
              </p>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                2.2 Uso del Contenido
              </h3>
              <p className="leading-relaxed mb-4">
                El Usuario no podrá copiar, reproducir, distribuir, adaptar, modificar, descompilar, hacer ingeniería inversa, comercializar o explotar de cualquier forma el Contenido sin autorización previa y por escrito de Mob.
              </p>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                2.3 Información publicada por Usuarios
              </h3>
              <p className="leading-relaxed mb-3">
                Parte del contenido visible en la Plataforma puede ser cargado, declarado o publicado por otros Usuarios, incluyendo propietarios, inmobiliarias o interesados. Dicha información no es elaborada por Mob, salvo que se indique expresamente.
              </p>
              <p className="leading-relaxed">
                Mob no garantiza la exactitud, integridad, actualización, legitimidad o veracidad del contenido provisto por Usuarios.
              </p>
            </section>

            {/* 3. USO PERMITIDO */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                3. Uso permitido de la Plataforma
              </h2>
              <p className="leading-relaxed mb-3">
                La Plataforma podrá ser utilizada exclusivamente para fines lícitos y compatibles con su naturaleza, incluyendo:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>buscar propiedades;</li>
                <li>publicar propiedades;</li>
                <li>gestionar consultas;</li>
                <li>verificar perfiles;</li>
                <li>coordinar visitas;</li>
                <li>reservar propiedades;</li>
                <li>cargar documentación;</li>
                <li>firmar contratos;</li>
                <li>gestionar procesos digitales vinculados con alquileres;</li>
                <li>supervisar operaciones;</li>
                <li>y demás fines permitidos por Mob.</li>
              </ul>
            </section>

            {/* 4. USOS PROHIBIDOS */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                4. Usos prohibidos
              </h2>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                4.1 Reglas generales
              </h3>
              <p className="leading-relaxed mb-3">
                Queda prohibido utilizar la Plataforma:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>para violar la legislación aplicable;</li>
                <li>para infringir derechos de terceros;</li>
                <li>para publicar información falsa, incompleta o engañosa;</li>
                <li>para suplantar identidades;</li>
                <li>para cargar inmuebles sin autorización o sin derecho suficiente;</li>
                <li>para realizar publicaciones fraudulentas;</li>
                <li>para enviar spam;</li>
                <li>para extraer datos masivamente;</li>
                <li>para interferir con el funcionamiento de la Plataforma;</li>
                <li>para afectar la privacidad o seguridad de otros Usuarios;</li>
                <li>para eludir controles técnicos o de seguridad;</li>
                <li>o para cualquier fin incompatible con estas Condiciones Generales.</li>
              </ul>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                4.2 Seguridad de la Plataforma
              </h3>
              <p className="leading-relaxed mb-3">
                Los Usuarios tienen prohibido violar o intentar violar la seguridad de la Plataforma, incluyendo sin limitarse a:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>acceder a datos no autorizados;</li>
                <li>intentar ingresar a cuentas de terceros;</li>
                <li>testear vulnerabilidades sin autorización;</li>
                <li>interferir o intentar interferir con el servicio;</li>
                <li>introducir malware, virus, bots o herramientas de scraping;</li>
                <li>falsificar encabezados, IPs o mecanismos de identificación;</li>
                <li>y cualquier conducta destinada a comprometer la seguridad o integridad del sistema.</li>
              </ul>
              <p className="leading-relaxed mb-4">
                Mob podrá investigar cualquier conducta sospechosa y adoptar medidas, incluyendo la suspensión preventiva o definitiva de cuentas, sin perjuicio de las acciones legales que correspondan.
              </p>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                4.3 Publicaciones prohibidas
              </h3>
              <p className="leading-relaxed mb-3">
                Está prohibido publicar:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>propiedades inexistentes;</li>
                <li>propiedades respecto de las cuales no se tenga autorización;</li>
                <li>datos incompletos, falsos o engañosos;</li>
                <li>precios intencionalmente distorsionados;</li>
                <li>contenido discriminatorio, ofensivo, ilícito o violatorio de derechos;</li>
                <li>datos personales de terceros sin autorización;</li>
                <li>información que induzca a error a otros Usuarios;</li>
                <li>o publicaciones destinadas a fines distintos del alquiler permitido por la Plataforma.</li>
              </ul>
            </section>

            {/* 5. REGISTRO Y CUENTA */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                5. Registro y cuenta de Usuario
              </h2>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                5.1 Registro
              </h3>
              <p className="leading-relaxed mb-4">
                Para acceder a determinadas funcionalidades, el Usuario deberá registrarse y crear una cuenta, proporcionando información veraz, completa y actualizada.
              </p>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                5.2 Credenciales
              </h3>
              <p className="leading-relaxed mb-3">
                El Usuario será responsable por la confidencialidad de sus credenciales de acceso y por toda actividad que ocurra en su cuenta.
              </p>
              <p className="leading-relaxed mb-4">
                El Usuario se obliga a notificar de inmediato cualquier uso no autorizado de su cuenta.
              </p>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                5.3 Exactitud de la información
              </h3>
              <p className="leading-relaxed">
                El Usuario garantiza que toda la información proporcionada a Mob es verdadera, suficiente y actualizada.
              </p>
            </section>

            {/* 6. CANALES DE COMUNICACIÓN */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                6. Canales de comunicación disponibles
              </h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  La Plataforma puede ofrecer canales de comunicación entre Usuarios, incluyendo chats, mensajes, formularios, flujos automatizados, mensajes por WhatsApp u otros medios integrados (en adelante, los &quot;Canales&quot;).
                </p>
                <p className="leading-relaxed">
                  El contenido de los mensajes, documentación e intercambios entre Usuarios es de exclusiva responsabilidad de quienes los emiten.
                </p>
                <p className="leading-relaxed">
                  Mob podrá facilitar dichos Canales, pero no garantiza la veracidad, exactitud o legalidad de las manifestaciones realizadas por los Usuarios, ni participa en las negociaciones, ofertas, aceptaciones o contratos que eventualmente se celebren entre ellos.
                </p>
                <p className="leading-relaxed">
                  Mob podrá, a su exclusivo criterio, suspender o restringir el uso de Canales ante usos abusivos, ilícitos o contrarios a estas Condiciones Generales.
                </p>
              </div>
            </section>

            {/* 7. VERIFICACIÓN, PRECALIFICACIÓN Y SCORING */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                7. Verificación, precalificación y scoring
              </h2>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                7.1 Herramientas tecnológicas de validación
              </h3>
              <p className="leading-relaxed mb-3">
                Mob podrá implementar herramientas tecnológicas de:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>validación de identidad;</li>
                <li>análisis documental;</li>
                <li>verificación de consistencia de datos;</li>
                <li>scoring o precalificación;</li>
                <li>validaciones automatizadas;</li>
                <li>revisión de información provista por el Usuario;</li>
                <li>e integraciones con terceros.</li>
              </ul>
              <p className="leading-relaxed mb-4">
                Estas herramientas tienen carácter informativo, operativo y tecnológico, y no constituyen certificación, garantía ni recomendación.
              </p>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                7.2 Carácter no concluyente
              </h3>
              <p className="leading-relaxed mb-3">
                Cualquier &quot;verificación&quot;, &quot;perfil validado&quot;, &quot;precalificación&quot;, &quot;score&quot;, &quot;nivel&quot;, &quot;garantía aprobada&quot;, &quot;dueño verificado&quot;, &quot;inmobiliaria verificada&quot;, &quot;interesado verificado&quot; u otra denominación similar visible en la Plataforma:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>se basa en criterios internos y/o información declarada y/o provista por terceros;</li>
                <li>puede ser automatizada total o parcialmente;</li>
                <li>no implica respaldo absoluto;</li>
                <li>no garantiza identidad, solvencia, legitimidad, titularidad, cumplimiento, comportamiento futuro ni inexistencia de fraude.</li>
              </ul>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                7.3 Aceptación del sistema
              </h3>
              <p className="leading-relaxed mb-4">
                Los Usuarios aceptan que Mob podrá crear, modificar, actualizar, suspender o discontinuar sistemas de scoring, niveles, badges, etiquetas, estados o calificaciones sin derecho a reclamo, compensación o indemnización.
              </p>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                7.4 Exención de responsabilidad
              </h3>
              <p className="leading-relaxed">
                Los Usuarios aceptan que Mob no tendrá responsabilidad alguna por los resultados, efectos, percepciones o consecuencias derivadas de cualquier scoring, badge, verificación o calificación publicada en la Plataforma, en tanto dichos sistemas constituyen herramientas tecnológicas referenciales.
              </p>
            </section>

            {/* 8. RELACIÓN ENTRE USUARIOS */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                8. Relación entre Usuarios
              </h2>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                8.1 Contacto preliminar
              </h3>
              <p className="leading-relaxed mb-3">
                Las interacciones entre Usuarios dentro de la Plataforma constituyen únicamente un acercamiento preliminar.
              </p>
              <p className="leading-relaxed mb-3">
                Ninguna conversación, mensaje, visualización, click, solicitud, aplicación, reserva o interacción a través de la Plataforma implicará por sí sola:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>oferta vinculante;</li>
                <li>aceptación contractual;</li>
                <li>contrato de alquiler;</li>
                <li>obligación de contratar;</li>
                <li>ni obligación alguna para Mob.</li>
              </ul>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                8.2 Ausencia de intermediación
              </h3>
              <p className="leading-relaxed mb-4">
                Mob no intermedia jurídicamente entre las partes, no negocia contratos, no fija condiciones, no representa intereses de ninguna de las partes y no asume responsabilidad por el contenido, legitimidad, legalidad o ejecución de los acuerdos a los que arriben los Usuarios.
              </p>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                8.3 Decisiones de alquiler
              </h3>
              <p className="leading-relaxed mb-3">
                Toda decisión de:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>aceptar o rechazar interesados;</li>
                <li>seleccionar un inquilino;</li>
                <li>avanzar o no con una reserva;</li>
                <li>celebrar un contrato;</li>
                <li>aprobar condiciones;</li>
                <li>concretar o no la operación;</li>
              </ul>
              <p className="leading-relaxed">
                corresponde exclusivamente al propietario y/o a la inmobiliaria, según corresponda. Mob no decide adjudicaciones.
              </p>
            </section>

            {/* 9. PUBLICACIONES DE PROPIEDADES */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                9. Publicaciones de propiedades
              </h2>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                9.1 Responsabilidad del anunciante
              </h3>
              <p className="leading-relaxed mb-3">
                Todo Usuario que publique una propiedad declara y garantiza bajo su exclusiva responsabilidad que:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>tiene derecho suficiente para publicarla;</li>
                <li>la información es veraz, completa y actualizada;</li>
                <li>la propiedad existe;</li>
                <li>y que la publicación no infringe derechos de terceros.</li>
              </ul>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                9.2 Propiedades de dueño directo y etapa beta
              </h3>
              <p className="leading-relaxed mb-3">
                En ciertos casos, especialmente en modalidades de dueño directo o funcionalidades en etapa beta, Mob podrá no validar la titularidad, veracidad o legitimidad de la propiedad publicada.
              </p>
              <p className="leading-relaxed mb-4">
                El Usuario acepta que dichas publicaciones pueden estar sujetas a menor nivel de validación y que cualquier decisión de contacto, visita, reserva o contratación se realiza bajo su exclusiva responsabilidad.
              </p>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                9.3 Remoción de publicaciones
              </h3>
              <p className="leading-relaxed mb-3">
                Mob podrá rechazar, limitar, suspender, ocultar o eliminar publicaciones a su exclusivo criterio, en especial cuando:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>resulten sospechosas;</li>
                <li>contengan errores o inconsistencias;</li>
                <li>generen reportes de fraude;</li>
                <li>infrinjan estas Condiciones Generales;</li>
                <li>o afecten la integridad de la Plataforma.</li>
              </ul>
            </section>

            {/* 10. PAGOS, RESERVAS Y CONTRATOS */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                10. Pagos, reservas y contratos
              </h2>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                10.1 Herramientas digitales
              </h3>
              <p className="leading-relaxed mb-3">
                Mob podrá facilitar herramientas tecnológicas para gestionar:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>pagos;</li>
                <li>reservas;</li>
                <li>contratos;</li>
                <li>firmas electrónicas;</li>
                <li>documentación;</li>
                <li>y estados de proceso.</li>
              </ul>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                10.2 Rol de Mob
              </h3>
              <p className="leading-relaxed mb-3">
                La provisión de dichas herramientas no convierte a Mob en parte contractual, ni implica:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>prestación de servicios inmobiliarios;</li>
                <li>actuación como escribano, abogado, corredor, administrador o garante;</li>
                <li>certificación legal;</li>
                <li>custodia fiduciaria de fondos;</li>
                <li>ni garantía de cumplimiento.</li>
              </ul>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                10.3 Obligaciones entre partes
              </h3>
              <p className="leading-relaxed mb-3">
                Los pagos, contratos y demás obligaciones derivadas de una operación son exclusiva responsabilidad de los Usuarios involucrados.
              </p>
              <p className="leading-relaxed mb-3">
                Mob no será responsable por:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>incumplimientos de pago;</li>
                <li>conflictos contractuales;</li>
                <li>rechazos de reservas;</li>
                <li>defectos del inmueble;</li>
                <li>mora;</li>
                <li>desalojos;</li>
                <li>daños;</li>
                <li>controversias jurídicas;</li>
                <li>o cualquier consecuencia derivada de la relación entre Usuarios.</li>
              </ul>
            </section>

            {/* 11. DATOS PERSONALES */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                11. Datos personales
              </h2>
              <p className="leading-relaxed mb-3">
                Mob trata datos personales conforme su Política de Privacidad, que forma parte integrante de estas Condiciones Generales.
              </p>
              <p className="leading-relaxed">
                El Usuario declara conocer y aceptar dicha Política.
              </p>
            </section>

            {/* 12. MENORES DE EDAD */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                12. Menores de edad
              </h2>
              <p className="leading-relaxed mb-3">
                La Plataforma no está destinada a personas que carezcan de capacidad legal para contratar conforme la legislación aplicable.
              </p>
              <p className="leading-relaxed">
                En caso de menores o incapaces, su utilización requerirá la intervención y autorización de sus representantes legales, quienes asumirán plena responsabilidad por los actos realizados.
              </p>
            </section>

            {/* 13. RESPONSABILIDAD DEL USUARIO */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                13. Responsabilidad del Usuario
              </h2>
              <p className="leading-relaxed mb-3">
                El Usuario declara y acepta que utiliza la Plataforma, sus contenidos y Servicios bajo su exclusiva responsabilidad y riesgo.
              </p>
              <p className="leading-relaxed">
                Si el Usuario detecta publicaciones, perfiles, interacciones o comportamientos que considere engañosos, falsos, fraudulentos, ilegítimos o contrarios a estas Condiciones Generales, deberá reportarlos a Mob mediante los canales habilitados.
              </p>
            </section>

            {/* 14. EXCLUSIÓN DE GARANTÍAS */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                14. Exclusión de garantías y limitación de responsabilidad
              </h2>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                14.1 Sin garantía de identidad ni legitimidad
              </h3>
              <p className="leading-relaxed mb-4">
                Mob no puede confirmar ni garantiza que cada Usuario sea quien dice ser, ni tiene obligación general de hacerlo.
              </p>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                14.2 Sin garantía de disponibilidad
              </h3>
              <p className="leading-relaxed mb-4">
                Mob no garantiza la disponibilidad continua, permanente, libre de errores o ininterrumpida de la Plataforma o de sus Servicios.
              </p>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                14.3 Sin garantía sobre publicaciones o transacciones
              </h3>
              <p className="leading-relaxed mb-3">
                Mob no garantiza:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>la existencia, disponibilidad o estado de las propiedades;</li>
                <li>la identidad, solvencia o legitimidad de anunciantes o interesados;</li>
                <li>la exactitud o actualización de los datos publicados;</li>
                <li>la concreción de operaciones;</li>
                <li>la validez jurídica de documentos generados por Usuarios;</li>
                <li>ni la ausencia de fraude.</li>
              </ul>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                14.4 Sitio &quot;tal cual&quot;
              </h3>
              <p className="leading-relaxed mb-4">
                La Plataforma y los Servicios se suministran &quot;tal cual&quot; y &quot;según disponibilidad&quot;, sin garantías de ningún tipo, expresas ni implícitas.
              </p>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                14.5 Daños excluidos
              </h3>
              <p className="leading-relaxed mb-4">
                En ningún caso Mob será responsable por daños directos, indirectos, incidentales, especiales, pérdida de chance, lucro cesante, pérdida de datos, afectación reputacional ni cualquier otro perjuicio derivado del uso o imposibilidad de uso de la Plataforma.
              </p>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                14.6 Relaciones ajenas a Mob
              </h3>
              <p className="leading-relaxed">
                El Usuario reconoce y acepta que Mob solo proporciona un espacio tecnológico para facilitar interacción y organización de procesos, siendo un tercero ajeno a cualquier negociación, acuerdo, reserva, pago, contrato o relación jurídica que eventualmente se entable entre los Usuarios.
              </p>
            </section>

            {/* 15. VÍNCULOS A OTROS SITIOS */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                15. Vínculos a otros sitios y terceros
              </h2>
              <p className="leading-relaxed mb-3">
                La Plataforma puede contener enlaces, integraciones o referencias a servicios de terceros.
              </p>
              <p className="leading-relaxed mb-3">
                Mob no es responsable por los contenidos, prácticas, disponibilidad, exactitud o políticas de privacidad de dichos terceros.
              </p>
              <p className="leading-relaxed">
                El acceso a ellos será bajo riesgo exclusivo del Usuario.
              </p>
            </section>

            {/* 16. CESIÓN */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                16. Cesión o uso comercial no autorizado
              </h2>
              <p className="leading-relaxed mb-3">
                El Usuario se obliga a no ceder sus derechos u obligaciones bajo estas Condiciones Generales ni a realizar un uso comercial no autorizado de la Plataforma.
              </p>
              <p className="leading-relaxed">
                Mob podrá ceder estas Condiciones Generales o transferir sus derechos y obligaciones sin necesidad de autorización previa del Usuario.
              </p>
            </section>

            {/* 17. SUSPENSIÓN */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                17. Suspensión, restricción y cancelación
              </h2>
              <p className="leading-relaxed mb-3">
                Mob podrá, a su exclusivo criterio y sin necesidad de preaviso:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>suspender temporalmente una cuenta;</li>
                <li>restringir funcionalidades;</li>
                <li>eliminar publicaciones;</li>
                <li>bloquear accesos;</li>
                <li>cancelar cuentas;</li>
                <li>o dar de baja Usuarios;</li>
              </ul>
              <p className="leading-relaxed mb-3">
                cuando considere que se han infringido estas Condiciones Generales, que existe riesgo para la Plataforma o terceros, o por razones operativas, de seguridad, reputacionales, legales o comerciales.
              </p>
              <p className="leading-relaxed">
                Ello no generará derecho a reembolso o indemnización, salvo disposición expresa en contrario.
              </p>
            </section>

            {/* 18. INDEMNIDAD */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                18. Indemnidad
              </h2>
              <p className="leading-relaxed mb-3">
                El Usuario se obliga a mantener indemne a Mob, sus directores, empleados, representantes, afiliadas y proveedores, frente a todo reclamo, acción, sanción, pérdida, daño, costo o gasto (incluyendo honorarios legales razonables) derivado de:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>su uso indebido de la Plataforma;</li>
                <li>el incumplimiento de estas Condiciones Generales;</li>
                <li>la publicación de contenido ilícito o falso;</li>
                <li>la infracción de derechos de terceros;</li>
                <li>y/o cualquier relación o conflicto entablado con otros Usuarios.</li>
              </ul>
            </section>

            {/* 19. MODIFICACIONES */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                19. Modificaciones
              </h2>
              <p className="leading-relaxed mb-3">
                Mob podrá modificar total o parcialmente estas Condiciones Generales en cualquier momento.
              </p>
              <p className="leading-relaxed mb-3">
                Las versiones actualizadas serán publicadas en la Plataforma y entrarán en vigencia desde su publicación, salvo que se indique otra fecha.
              </p>
              <p className="leading-relaxed">
                La continuación en el uso de la Plataforma implicará aceptación de las nuevas condiciones.
              </p>
            </section>

            {/* 20. GENERAL */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                20. General
              </h2>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                20.1 Integración contractual
              </h3>
              <p className="leading-relaxed mb-3">
                Forman parte integrante de estas Condiciones Generales:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>la Política de Privacidad;</li>
                <li>los términos particulares que correspondan a cada Servicio;</li>
                <li>los términos específicos de funcionalidades beta, publicaciones de dueño directo, formularios, verificaciones, reservas, pagos o contratos, cuando existan.</li>
              </ul>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                20.2 Nulidad parcial
              </h3>
              <p className="leading-relaxed mb-4">
                Si alguna disposición de estas Condiciones Generales fuera declarada inválida o inaplicable, ello no afectará la validez de las restantes.
              </p>

              <h3 className="font-display text-base font-medium text-foreground mb-2">
                20.3 Duración
              </h3>
              <p className="leading-relaxed">
                La prestación de los Servicios por parte de Mob tiene duración indeterminada. Mob podrá suspender, restringir o dar por terminados los Servicios en cualquier momento.
              </p>
            </section>

            {/* 21. LEY APLICABLE */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                21. Ley aplicable y jurisdicción
              </h2>
              <p className="leading-relaxed mb-3">
                Estas Condiciones Generales se regirán por las leyes de la República Argentina.
              </p>
              <p className="leading-relaxed">
                Toda controversia derivada de su interpretación, validez, ejecución o cumplimiento será sometida a la jurisdicción de los tribunales ordinarios con competencia en la Ciudad Autónoma de Buenos Aires, salvo disposición legal imperativa en contrario.
              </p>
            </section>

            {/* 22. CONDUCTA DE LOS USUARIOS Y ACTOS DE TERCEROS */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                22. Conducta de los Usuarios y actos de terceros
              </h2>
              <div className="space-y-4">
                <p className="leading-relaxed">
                  Los Usuarios reconocen y aceptan que Mob es una plataforma tecnológica que facilita herramientas digitales para la interacción entre personas interesadas en procesos vinculados con alquileres, pero no controla ni supervisa de manera permanente la conducta de los Usuarios fuera de la Plataforma.
                </p>
                <p className="leading-relaxed">
                  En consecuencia, Mob no será responsable por los actos, omisiones, conductas, declaraciones, comportamientos o acciones de los Usuarios, incluyendo, sin limitación:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>conductas ilícitas o delictivas;</li>
                  <li>fraudes;</li>
                  <li>engaños;</li>
                  <li>daños a personas o bienes;</li>
                  <li>conflictos personales o comerciales;</li>
                  <li>incumplimientos contractuales;</li>
                  <li>o cualquier otro hecho ocurrido entre Usuarios dentro o fuera de la Plataforma.</li>
                </ul>
                <p className="leading-relaxed">
                  Toda interacción, visita, encuentro, negociación, firma de contrato o relación que los Usuarios decidan realizar entre sí se lleva a cabo bajo su exclusiva responsabilidad y riesgo.
                </p>
                <p className="leading-relaxed">
                  Los Usuarios aceptan que Mob no tiene control sobre el comportamiento futuro de los Usuarios, ni puede garantizar la buena fe, solvencia, honestidad, seguridad o legalidad de sus acciones.
                </p>
                <p className="leading-relaxed">
                  En consecuencia, Mob no será responsable por daños personales, daños materiales, perjuicios económicos, actos ilícitos o hechos delictivos que pudieran producirse entre Usuarios, aun cuando dichos Usuarios hayan tomado contacto inicialmente a través de la Plataforma.
                </p>
                <p className="leading-relaxed">
                  Se recomienda a los Usuarios adoptar las medidas de precaución razonables al interactuar con terceros, realizar visitas a inmuebles o celebrar acuerdos.
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
