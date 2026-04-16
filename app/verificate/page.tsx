"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { MessageCircle, Search, PenLine, Home, BadgeCheck } from "lucide-react";
import Header from "@/components/Header";
import { GarantiaTooltip } from "@/components/GarantiaTooltip";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  verificateFormSchema,
  type VerificateFormValues,
} from "@/lib/validations/verificate";
import { COUNTRY_CODES } from "@/lib/constants/country-codes";

export default function VerificatePage() {
  const { user, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Query params from property detail page (optional, stored for future truora call)
  const propertyId = searchParams.get("propertyId");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  // When true the user is entering from the /certificado landing page. We route
  // them through a certificate-specific Truora template + tailored confirmation copy.
  const fromCertificado = searchParams.get("certificado") === "true";

  const form = useForm<VerificateFormValues>({
    resolver: zodResolver(verificateFormSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      country_code: user?.phoneCountryCode || "+54",
    },
  });

  async function onSubmit(values: VerificateFormValues) {
    setIsSubmitting(true);
    try {
      // Save name + phone to users table via existing profile endpoint
      const res = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          telefono: values.phone,
          telefono_country_code: values.country_code,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al guardar perfil");
      }

      // Refresh auth context to pick up new name/phone
      await refreshUser();

      // Fire-and-forget: trigger Truora outbound WhatsApp
      fetch("/api/truora/outbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: values.phone,
          country_code: values.country_code,
          name: values.name,
          propertyId,
          date,
          time,
          accountType: user?.accountType,
          certificado: fromCertificado,
        }),
      }).catch(() => {}); // Don't block UX on failure

      setSubmitted(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al enviar",
        { position: "bottom-right" }
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Post-submission success state
  if (submitted) {
    const submittedName = form.getValues("name");
    const submittedPhone = form.getValues("phone");
    const submittedCode = form.getValues("country_code");

    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full text-center space-y-6">
            <div className={`h-14 w-14 rounded-full flex items-center justify-center mx-auto ${fromCertificado ? 'bg-primary/10' : 'bg-green-100'}`}>
              {fromCertificado ? (
                <BadgeCheck className="h-7 w-7 text-primary" />
              ) : (
                <MessageCircle className="h-7 w-7 text-green-600" />
              )}
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-bold text-foreground">
                ¡Listo, {submittedName}!
              </h1>
              {fromCertificado ? (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ya te mandamos un mensaje por WhatsApp al{" "}
                  <span className="font-semibold text-foreground">
                    {submittedCode} {submittedPhone}
                  </span>{" "}
                  para que puedas verificarte y obtener tu{" "}
                  <span className="font-semibold text-foreground">
                    certificado de inquilino calificado
                  </span>
                  .
                </p>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  En breve te contactaremos por WhatsApp al{" "}
                  <span className="font-semibold text-foreground">
                    {submittedCode} {submittedPhone}
                  </span>{" "}
                  para completar tu verificación.
                </p>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {fromCertificado
                ? "Completá los pasos y al terminar vas a recibir el link de tu certificado. Si no recibís el mensaje, verificá que tu número sea correcto."
                : "Si no recibís el mensaje, verificá que tu número de teléfono sea correcto."}
            </p>

            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => setSubmitted(false)}
                className="w-full h-12 rounded-xl text-sm font-medium border-2 hover:bg-secondary transition-colors"
              >
                <PenLine className="h-4 w-4 mr-2" />
                Corregir mis datos
              </Button>

              {propertyId && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/propiedad/${propertyId}`)}
                  className="w-full h-12 rounded-xl text-sm font-medium border-2 hover:bg-secondary transition-colors"
                >
                  Volver a la propiedad
                </Button>
              )}

              {fromCertificado ? (
                <Button
                  onClick={() => router.push("/alquileres")}
                  className="w-full h-12 rounded-xl text-sm font-semibold"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Mientras tanto, explorá propiedades
                </Button>
              ) : user?.accountType === 2 ? (
                <Button
                  onClick={() => router.push("/gestion-inmobiliaria/propiedades")}
                  className="w-full h-12 rounded-xl text-sm font-semibold"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ir a mis propiedades
                </Button>
              ) : (
                <Button
                  onClick={() => router.push("/alquileres")}
                  className="w-full h-12 rounded-xl text-sm font-semibold"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Seguir explorando propiedades
                </Button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-6">
          {/* Heading */}
          <div className="space-y-3">
            <h1 className="font-display text-3xl font-bold text-foreground">
              {fromCertificado
                ? 'Generá tu certificado de inquilino'
                : `Verificate como ${user?.accountType === 2 ? 'propietario verificado' : 'inquilino calificado'}`}
            </h1>
            {fromCertificado ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                Completá la verificación para obtener tu{" "}
                <span className="font-semibold text-foreground">
                  certificado de inquilino calificado
                </span>
                , un link público con QR que podés compartir o llevar a
                cualquier inmobiliaria.
              </p>
            ) : user?.accountType === 2 ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                Completá tu verificación para que tus inquilinos puedan{" "}
                <span className="font-semibold text-foreground">
                  confiar en vos
                </span>{" "}
                y agilizar el proceso de alquiler.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                Completá tu verificación para poder{" "}
                <span className="font-semibold text-foreground">
                  agendar tu visita
                </span>{" "}
                y acceder a una{" "}
                <GarantiaTooltip className="font-semibold text-foreground cursor-help">
                  garantía con 50% de descuento
                </GarantiaTooltip>
                .
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Toma 2 minutos, te mandamos un WhatsApp, respondés tus datos y
              listo!
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label>Nombre</Label>
                    <FormControl>
                      <Input
                        placeholder="Tu nombre completo"
                        autoComplete="name"
                        className="h-12 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone: country code + number */}
              <div className="space-y-1.5">
                <Label>Teléfono</Label>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="country_code"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl text-sm w-[110px]">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COUNTRY_CODES.map((code) => (
                              <SelectItem
                                key={code.value}
                                value={code.value}
                              >
                                {code.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-0 flex-1">
                        <FormControl>
                          <Input
                            type="tel"
                            inputMode="numeric"
                            placeholder="Ej: 1126373290"
                            autoComplete="tel-national"
                            className="h-12 rounded-xl"
                            {...field}
                            onChange={(e) => {
                              const cleaned = e.target.value.replace(
                                /\D/g,
                                ""
                              );
                              field.onChange(cleaned);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Sin 0 y sin 15. Ej: 1126373290</p>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl font-semibold text-base"
              >
                {isSubmitting ? "Enviando..." : "Recibir WhatsApp"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
