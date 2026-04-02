"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const founders = [
  {
    name: "Inaki Valencia",
    role: "Cofundador",
    photo: "/assets/propietarios/foto_perfil.png",
    bio: "Vengo de familia inmobiliaria, donde trabajé a los 16 años",
    credentials: ["Lic. en Negocios Digitales - UdeSA", "Ex Cofundador de Roomix.ai"],
    email: "inaki@mob.ar",
    linkedin: "https://www.linkedin.com/in/inaki-valencia/",
    whatsapp: "https://wa.me/5492236000055",
  },
  {
    name: "Martin Quijano",
    role: "Cofundador",
    photo: "/assets/propietarios/foto_perfil_martin.png",
    bio: "Programo desde los 15. También vengo de familia inmobiliaria",
    credentials: ["Lic. en Negocios Digitales - UdeSA", "Ex Cofundador de Tuni.com.ar"],
    email: "martin@mob.ar",
    linkedin: "https://www.linkedin.com/in/martin-quijano-/",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const AboutV3 = () => {
  return (
    <section className="py-8 md:py-10 bg-background">
      <div className="container">
        <motion.div
          className="text-center mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold text-foreground">
            Quiénes somos
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {founders.map((founder, i) => (
            <motion.div
              key={founder.name}
              className="text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
            >
              <div className="rounded-[1.25rem] overflow-hidden bg-accent/40 mb-3 shadow-sm">
                <Image
                  src={founder.photo}
                  alt={founder.name}
                  width={400}
                  height={405}
                  className="w-full aspect-[4/4.05] object-cover"
                />
              </div>

              <h3 className="font-display text-lg md:text-xl font-extrabold text-foreground leading-tight">
                {founder.name}
              </h3>
              <p className="font-display text-lg md:text-xl font-extrabold text-foreground leading-tight mb-3">
                {founder.role}
              </p>

              <p className="font-display max-w-[15rem] mx-auto text-[13px] md:text-sm leading-[1.45] text-foreground/90 mb-4">
                {founder.bio}
              </p>

              <div className="font-display space-y-0.5 text-[13px] md:text-sm leading-[1.35] text-foreground">
                {founder.credentials.map((item) => (
                  <p key={item}>{item}</p>
                ))}
                {(founder.email || founder.linkedin) && (
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {founder.email && <span>{founder.email}</span>}
                    {founder.email && founder.linkedin && <span>|</span>}
                    {founder.linkedin && (
                      <a
                        href={founder.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-foreground hover:text-primary transition-colors"
                        aria-label={`LinkedIn de ${founder.name}`}
                      >
                        <Image
                          src="/assets/propietarios/linkedin_icon.png"
                          alt="LinkedIn"
                          width={16}
                          height={16}
                          className="h-4 w-4 object-contain"
                        />
                      </a>
                    )}
                  </div>
                )}
                {founder.whatsapp && (
                  <p>
                    <a
                      href={founder.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      Si tenes dudas, acá esta mi WhatsApp
                    </a>
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="max-w-3xl mx-auto text-center mt-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h3 className="font-display text-lg md:text-xl font-bold text-foreground mb-5">
            Con el apoyo de:
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-11">
            <Image src="/assets/propietarios/hoggax_negro.png" alt="Hoggax" width={200} height={52} className="h-11 md:h-[52px] w-auto object-contain opacity-85" />
            <Image src="/assets/propietarios/udesa.png" alt="UdeSA" width={200} height={60} className="h-[52px] md:h-[60px] w-auto object-contain opacity-85" />
            <Image src="/assets/propietarios/centroudesa.png" alt="Centro de Entrepreneurship UdeSA" width={200} height={60} className="h-[52px] md:h-[60px] w-auto object-contain opacity-85" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutV3;
