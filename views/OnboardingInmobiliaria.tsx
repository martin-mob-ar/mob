"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMockUser, leadStageConfig, LeadStage } from "@/contexts/MockUserContext";
import { 
  ArrowRight,
  ChevronLeft,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Key,
  Lock,
  CheckCircle2,
  Sparkles,
  Shield,
  DollarSign,
  Handshake,
  Calendar,
  MessageSquare
} from "lucide-react";
const mobLogo = "/assets/mob-logo-new.png";

interface FormData {
  // Step 1 - Contact
  fullName: string;
  email: string;
  phone: string;
  // Step 2 - Agency
  agencyName: string;
  location: string;
  // Step 3 - Tokko
  tokkoApiKey: string;
  // Step 4 - Account
  accountEmail: string;
  password: string;
}

const initialFormData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  agencyName: "",
  location: "",
  tokkoApiKey: "",
  accountEmail: "",
  password: "",
};

const OnboardingInmobiliaria = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isCompleted, setIsCompleted] = useState(false);
  const { setIsAgencyOnboarded } = useMockUser();
  const router = useRouter();

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      // Pre-fill account email from contact email
      if (currentStep === 1 && formData.email && !formData.accountEmail) {
        setFormData(prev => ({ ...prev, accountEmail: prev.email }));
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsAgencyOnboarded(true);
    setIsCompleted(true);
  };

  const handleGoToPanel = () => {
    router.push("/gestion-inmobiliaria");
  };

  const handleTalkToAdvisor = () => {
    window.open("https://wa.me/5492236000055", "_blank");
  };

  const handleExit = () => {
    router.push("/inmobiliarias");
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Completion screen
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="h-16 border-b border-border flex items-center px-6">
          <img src={mobLogo} alt="MOB" className="h-6" />
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-bold">Listo. Recibimos tu información.</h1>
              <p className="text-muted-foreground">
                En breve vas a poder acceder al panel y sumar tus propiedades.
              </p>
            </div>
            <div className="space-y-3 pt-4">
              <Button 
                onClick={handleGoToPanel}
                className="w-full rounded-full py-6 text-base font-semibold gap-2"
              >
                Entrar al panel
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={handleTalkToAdvisor}
                className="w-full rounded-full py-6 text-base gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Hablar con un asesor
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6">
        <img src={mobLogo} alt="MOB" className="h-6" />
        <button 
          onClick={handleExit}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Salir
        </button>
      </header>

      {/* Progress indicator */}
      <div className="px-6 pt-6">
        <div className="max-w-md mx-auto">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Paso {currentStep} de {totalSteps}
          </p>
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div 
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          {/* Step 1: Contact Details */}
          {currentStep === 1 && (
            <>
              <div className="text-center space-y-2">
                <div className="h-14 w-14 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold">¡Hola! ¿Quién sos?</h1>
                <p className="text-muted-foreground">Usamos estos datos solo para comunicarnos con vos.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre y apellido</Label>
                  <Input
                    id="fullName"
                    placeholder="Ej: Juan Pérez"
                    value={formData.fullName}
                    onChange={(e) => updateFormData("fullName", e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@inmobiliaria.com"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+54 9 11 1234-5678"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Agency Details */}
          {currentStep === 2 && (
            <>
              <div className="text-center space-y-2">
                <div className="h-14 w-14 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold">Contanos sobre tu inmobiliaria</h1>
                <p className="text-muted-foreground">Esto nos ayuda a contextualizar tus propiedades y operaciones.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agencyName">Nombre de la inmobiliaria</Label>
                  <Input
                    id="agencyName"
                    placeholder="Ej: Inmobiliaria García"
                    value={formData.agencyName}
                    onChange={(e) => updateFormData("agencyName", e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación (Ciudad / Provincia)</Label>
                  <Input
                    id="location"
                    placeholder="Ej: Mar del Plata, Buenos Aires"
                    value={formData.location}
                    onChange={(e) => updateFormData("location", e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 3: Tokko Broker Integration */}
          {currentStep === 3 && (
            <>
              <div className="text-center space-y-2">
                <div className="h-14 w-14 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                  <Key className="h-7 w-7 text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold">Conectá tus propiedades</h1>
                <p className="text-muted-foreground">
                  Conectando Tokko Broker podemos importar automáticamente tus propiedades y mantenerlas sincronizadas.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tokkoApiKey">API Key de Tokko Broker</Label>
                  <Input
                    id="tokkoApiKey"
                    placeholder="Ingresá tu API Key"
                    value={formData.tokkoApiKey}
                    onChange={(e) => updateFormData("tokkoApiKey", e.target.value)}
                    className="h-12 rounded-xl font-mono text-sm"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Podés cargar propiedades manualmente más adelante si lo preferís.
                </p>
              </div>
            </>
          )}

          {/* Step 4: Account Creation */}
          {currentStep === 4 && (
            <>
              <div className="text-center space-y-2">
                <div className="h-14 w-14 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                  <Lock className="h-7 w-7 text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold">Creá tu cuenta <span className="font-ubuntu">mob</span></h1>
                <p className="text-muted-foreground">Esta será tu cuenta para acceder al panel de inmobiliaria.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountEmail">Email</Label>
                  <Input
                    id="accountEmail"
                    type="email"
                    placeholder="juan@inmobiliaria.com"
                    value={formData.accountEmail}
                    onChange={(e) => updateFormData("accountEmail", e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Crear contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 5: Model Transparency */}
          {currentStep === 5 && (
            <>
              <div className="text-center space-y-2">
                <div className="h-14 w-14 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                  <Handshake className="h-7 w-7 text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold">Sumarte no te compromete</h1>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium">No hay costos fijos</p>
                </div>
                <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium"><span className="font-ubuntu">mob</span> cobra solo por operación cerrada</p>
                </div>
                <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium">Vos mantenés el control comercial</p>
                </div>
                <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium">Podés empezar cuando quieras</p>
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                <p className="text-sm text-center text-muted-foreground">
                  <span className="font-semibold text-foreground"><span className="font-ubuntu">mob</span> opera por operación cerrada.</span><br />
                  Completar este formulario no implica ningún compromiso.
                </p>
              </div>
            </>
          )}

          {/* Step 6: Final CTA */}
          {currentStep === 6 && (
            <>
              <div className="text-center space-y-2">
                <div className="h-14 w-14 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold">¡Casi listo!</h1>
                <p className="text-muted-foreground">
                  Al continuar, recibiremos tu información y podrás acceder al panel de inmobiliaria.
                </p>
              </div>

              <div className="space-y-3">
                {formData.agencyName && (
                  <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                    <Building2 className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Inmobiliaria</p>
                      <p className="font-medium">{formData.agencyName}</p>
                    </div>
                  </div>
                )}
                {formData.accountEmail && (
                  <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                    <Mail className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Cuenta</p>
                      <p className="font-medium">{formData.accountEmail}</p>
                    </div>
                  </div>
                )}
                {formData.location && (
                  <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                    <MapPin className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ubicación</p>
                      <p className="font-medium">{formData.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-border">
        <div className="max-w-md mx-auto flex gap-3">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Atrás
            </Button>
          )}
          
          {currentStep < totalSteps ? (
            <Button 
              onClick={handleNext}
              className="flex-1 rounded-full gap-2"
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleComplete}
              className="flex-1 rounded-full gap-2 animate-pulse-glow"
            >
              <Sparkles className="h-4 w-4" />
              Finalizar registro
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingInmobiliaria;
