"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FileText, PenLine, Shield, UserCheck } from "lucide-react";

const heroTags = [
  { icon: UserCheck, label: "Verificación de inquilino (KYC + financiero)" },
  { icon: Shield, label: "Garantía de alquiler aprobada por Hoggax" },
  { icon: FileText, label: "Contrato listo para firmar" },
  { icon: PenLine, label: "Firma electrónica integrada" },
];

const tallyUrl = "https://tally.so/r/5Bk4y6";
const whatsappUrl = "https://wa.me/5492236000055";

const HeroV4 = () => {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="flex items-center px-0 pb-9 pt-0 md:px-12 md:py-24 lg:px-16 xl:px-24">
          <div className="max-w-xl space-y-8">
            <div className="lg:hidden">
              <Image
                src="/assets/inmobiliario.png"
                alt="Asesor inmobiliario cerrando alquileres con mob"
                width={800}
                height={480}
                className="h-[240px] w-full object-cover"
                priority
              />
            </div>

            <div className="space-y-[26px] px-6 md:space-y-8 md:px-0">
              <h1 className="font-display text-[1.56rem] font-extrabold leading-tight text-foreground md:text-[2rem] lg:text-[1.85rem] xl:text-[2.5rem]">
                <span className="block whitespace-nowrap">Cerrá alquileres más rápido</span>
                <span className="block text-primary">y con más seguridad</span>
              </h1>

              <p className="max-w-lg text-[0.95rem] text-muted-foreground md:text-xl">
                Validamos y calificamos al inquilino, gestionamos la garantía, armamos el
                contrato y ofrecemos firma electrónica.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {heroTags.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 rounded-full px-6 text-sm font-semibold sm:w-auto"
                  asChild
                >
                  <a
                    href={tallyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Sumá tu inmobiliaria gratis
                  </a>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full px-6 text-sm font-medium sm:w-auto"
                  asChild
                >
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Hablá con nuestro equipo
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative hidden min-h-[560px] lg:block">
          <Image
            src="/assets/inmobiliario.png"
            alt="Asesor inmobiliario cerrando alquileres con mob"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default HeroV4;
