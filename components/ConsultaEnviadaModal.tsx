"use client";

import Link from "next/link";
import {
  CheckCircle,
  Globe,
  BadgeCheck,
  Calendar,
  Percent,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const BENEFITS = [
  { icon: Globe, label: "Proceso 100% online" },
  { icon: BadgeCheck, label: "Dueños verificados" },
  { icon: Calendar, label: "Agenda de visitas online" },
  { icon: Percent, label: "Acceso a garantía 50% off" },
] as const;

interface ConsultaEnviadaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ConsultaEnviadaModal({
  open,
  onOpenChange,
}: ConsultaEnviadaModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 overflow-hidden max-w-sm">
        {/* ── Header with gradient background ── */}
        <div className="relative bg-gradient-to-b from-primary/8 to-transparent px-6 pt-8 pb-4 text-center">
          {/* Decorative ring behind the icon */}
          <div className="mx-auto mb-4 relative h-16 w-16">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping-slow" />
            <div className="relative h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </div>

          <DialogTitle className="font-display text-xl font-bold tracking-tight">
            ¡Consulta enviada!
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Enviamos tu consulta a la inmobiliaria.
            <br />
            Se pondrán en contacto con vos.
          </p>
        </div>

        {/* ── Benefits section ── */}
        <div className="px-6 pb-6 pt-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Te invitamos a conocer más de{" "}
            <span className="font-ubuntu text-primary font-bold normal-case tracking-normal">
              mob
            </span>
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {BENEFITS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-xl bg-secondary/50 px-3 py-2.5"
              >
                <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-medium leading-tight">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link href="/alquileres" className="block mt-5">
            <Button className="w-full rounded-xl h-11 font-semibold text-sm gap-2">
              Ver más propiedades
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
