"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  FileText, 
  CreditCard, 
  Headphones,
  ChevronRight,
  MapPin,
  Calendar,
  CheckCircle2,
  Settings
} from "lucide-react";
const mobLogo = "/assets/mob-logo-new.png";

const PostVenta = () => {
  const router = useRouter();

  const menuItems = [
    { 
      icon: Home, 
      title: "Mi alquiler", 
      description: "Información del contrato y propiedad",
      href: "#"
    },
    { 
      icon: CreditCard, 
      title: "Pagos", 
      description: "Historial y próximos vencimientos",
      href: "#"
    },
    { 
      icon: Headphones, 
      title: "Tickets", 
      description: "Solicitudes y reclamos",
      href: "#"
    },
    { 
      icon: FileText, 
      title: "Documentos", 
      description: "Contrato, recibos y más",
      href: "#"
    },
    { 
      icon: Settings, 
      title: "Configuración", 
      description: "Preferencias de cuenta",
      href: "#"
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0">
        <img src={mobLogo} alt="MOB" className="h-6" />
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Ir al inicio
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Welcome Header */}
          <div className="text-center space-y-2 pb-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <Home className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">
              Tu alquiler está activo
            </h1>
            <p className="text-muted-foreground">
              Gestioná todo desde acá
            </p>
          </div>

          {/* Property Summary Card */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="aspect-[21/9] relative">
              <img 
                src="/placeholder.svg" 
                alt="Tu propiedad"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-primary text-primary-foreground shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Contrato activo
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-foreground">Depto de 2 ambientes en Palermo</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Av. Santa Fe 3200, Palermo
                </p>
              </div>
              <div className="flex items-center gap-4 pt-2 border-t border-border text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Inicio:</span>
                  <span className="font-medium">15 Feb 2025</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-primary">$450.000</p>
              <p className="text-sm text-muted-foreground">Próximo pago</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">28</p>
              <p className="text-sm text-muted-foreground">Días restantes</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:bg-secondary/50 transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>

          {/* Help Card */}
          <div className="bg-primary/5 rounded-xl border border-primary/10 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Headphones className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">¿Necesitás ayuda?</p>
                <p className="text-sm text-muted-foreground">Estamos para asistirte</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full">
                Contactar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostVenta;
