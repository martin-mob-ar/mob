"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Send, ShieldCheck, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Link from "next/link";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
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
import { leadFormSchema, type LeadFormValues } from "@/lib/validations/lead";

const GUEST_STORAGE_KEY = "mob_guest_contact";

interface GuestContact {
  name: string;
  email: string;
  phone: string;
  country_code: string;
}

function getGuestContact(): GuestContact | null {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveGuestContact(data: GuestContact) {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded or private browsing — ignore
  }
}

const COUNTRY_CODES = [
  { value: "+54", label: "🇦🇷 +54" },
  { value: "+55", label: "🇧🇷 +55" },
  { value: "+56", label: "🇨🇱 +56" },
  { value: "+57", label: "🇨🇴 +57" },
  { value: "+598", label: "🇺🇾 +598" },
  { value: "+52", label: "🇲🇽 +52" },
  { value: "+1", label: "🇺🇸 +1" },
  { value: "+34", label: "🇪🇸 +34" },
];

function getDefaultMessage(type: "visita" | "reserva", address: string): string {
  if (type === "visita") {
    return `¡Hola! Quiero agendar una visita para la propiedad en ${address}.`;
  }
  return `¡Hola! Quiero reservar la propiedad en ${address}.`;
}

interface LeadFormProps {
  type: "visita" | "reserva";
  propertyId: number;
  propertyAddress: string;
  onClose: () => void;
  /** The inmobiliaria's contact phone — shown after submission for WhatsApp/call. Unrelated to the submitter's phone field. */
  inmobiliariaPhone?: string;
  /** The Mob plan the property is listed under. Controls verification requirements. */
  propertyPlan?: "basico" | "acompanado" | "experiencia";
  /** Whether the property was published by an inmobiliaria (true) or a propietario (false). */
  isInmobiliaria?: boolean;
}

export default function LeadForm({
  type,
  propertyId,
  propertyAddress,
  onClose,
  inmobiliariaPhone,
  propertyPlan = "basico",
  isInmobiliaria = false,
}: LeadFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isVerified = !!user?.isVerified;
  const requiresVerification =
    (propertyPlan === "acompanado" || propertyPlan === "experiencia") &&
    !isVerified;

  const defaults = useMemo(() => {
    if (user) {
      return {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        country_code: user.phoneCountryCode || "+54",
      };
    }
    const guest = getGuestContact();
    return {
      name: guest?.name || "",
      email: guest?.email || "",
      phone: guest?.phone || "",
      country_code: guest?.country_code || "+54",
    };
  }, [user]);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (user) {
      if (user.name && !form.getValues("name")) form.setValue("name", user.name);
      if (user.email && !form.getValues("email")) form.setValue("email", user.email);
      if (user.phone && !form.getValues("phone")) {
        form.setValue("phone", user.phone);
      }
      if (user.phoneCountryCode) form.setValue("country_code", user.phoneCountryCode);
    }
  }, [user, form]);

  async function handleSubmit() {
    const valid = await form.trigger();
    if (!valid) return;

    const values = form.getValues();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          type,
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
          country_code: values.country_code,
          message: getDefaultMessage(type, propertyAddress),
          source: "web",
          submitterUserId: user?.publicUserId || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al enviar la consulta");
      }

      if (!user) {
        saveGuestContact({
          name: values.name,
          email: values.email,
          phone: values.phone || "",
          country_code: values.country_code,
        });
      }

      toast.success("¡Consulta enviada!", {
        description: "Nos pondremos en contacto pronto.",
        position: "bottom-right",
      });
      setSubmitted(true);
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al enviar la consulta",
        { position: "bottom-right" }
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const title = type === "visita" ? "Agendar visita" : "Reservar";
  const publisherLabel = isInmobiliaria ? "la inmobiliaria" : "el propietario";

  // ── Blocking state: plan requires verification but user is not verified ──
  if (requiresVerification) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>

        <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-3 text-center">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-sm">Esta propiedad es solo para inquilinos verificados</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Al verificar tu perfil, los propietarios e inmobiliarias ven que sos
              un candidato calificado y de confianza, lo que aumenta mucho tus
              posibilidades de conseguir la propiedad que buscás.
            </p>
          </div>
          <Link href="/verificacion" className="block">
            <Button className="w-full h-9 rounded-xl font-semibold text-sm">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Verificarme gratis
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Post-submission state ──
  if (submitted) {
    // Unverified user: show verification CTA
    if (!isVerified) {
      return (
        <div className="text-center py-4 space-y-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">¡Consulta enviada!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Verificate para que {publisherLabel} pueda conocer tu perfil y priorizarte.
            </p>
          </div>
          <Link href="/verificacion" className="block">
            <Button className="w-full rounded-xl h-10 font-semibold text-sm">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Verificarme para contactar a {publisherLabel}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSubmitted(false);
              onClose();
            }}
          >
            Volver
          </Button>
        </div>
      );
    }

    // Verified user: current success state with WhatsApp/call options
    return (
      <div className="text-center py-4 space-y-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Send className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm">¡Consulta enviada!</p>
          <p className="text-xs text-muted-foreground mt-1">
            Te contactaremos a la brevedad.
          </p>
        </div>
        {inmobiliariaPhone && (
          <div className="space-y-2 pt-1">
            <a
              href={`https://wa.me/${inmobiliariaPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full rounded-xl h-10 font-semibold text-sm">
                Hablar por WhatsApp
              </Button>
            </a>
            <a href={`tel:${inmobiliariaPhone}`} className="block">
              <Button
                variant="outline"
                className="w-full rounded-xl h-10 font-medium text-sm"
              >
                Llamar por teléfono
              </Button>
            </a>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSubmitted(false);
            onClose();
          }}
        >
          Volver
        </Button>
      </div>
    );
  }

  // ── Normal form ──
  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-3"
        >
          {/* Name + Email */}
          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tu nombre"
                      className="h-9 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      className="h-9 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* Country code + Phone */}
          <div className="space-y-1">
            <Label className="text-xs">Teléfono</Label>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="country_code"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRY_CODES.map((code) => (
                          <SelectItem key={code.value} value={code.value}>
                            {code.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
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
                        placeholder="11 1234 5678"
                        className="h-9 text-sm"
                        {...field}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\D/g, "");
                          field.onChange(cleaned);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 rounded-xl font-semibold text-sm"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Enviando..." : "Enviar"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
