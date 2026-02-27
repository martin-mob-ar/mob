"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
    return `¡Hola! Quiero agendar una visita para la propiedad en ${address} que vi en mob.`;
  }
  return `¡Hola! Quiero reservar la propiedad en ${address} que vi en mob.`;
}

interface LeadFormProps {
  type: "visita" | "reserva";
  propertyId: number;
  propertyAddress: string;
  onClose: () => void;
}

export default function LeadForm({
  type,
  propertyId,
  propertyAddress,
  onClose,
}: LeadFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const defaults = useMemo(() => {
    const phone = user?.phoneArea && user?.phone
      ? `${user.phoneArea}-${user.phone}`
      : user?.phone || "";
    return {
      name: user?.name || "",
      email: user?.email || "",
      phone,
      country_code: user?.phoneCountryCode || "+54",
    };
  }, [user?.name, user?.email, user?.phone, user?.phoneArea, user?.phoneCountryCode]);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (user) {
      if (user.name && !form.getValues("name")) form.setValue("name", user.name);
      if (user.email && !form.getValues("email")) form.setValue("email", user.email);
      if ((user.phoneArea || user.phone) && !form.getValues("phone")) {
        const phone = user.phoneArea && user.phone
          ? `${user.phoneArea}-${user.phone}`
          : user.phone;
        form.setValue("phone", phone);
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
          phone: values.phone?.replace(/-/g, "") || undefined,
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

  if (submitted) {
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

  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
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
                        placeholder="11-1234-5678"
                        className="h-9 text-sm"
                        {...field}
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
