"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function VerificationRequiredDialog() {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <Shield className="h-7 w-7 text-amber-600" />
          </div>
          <DialogTitle className="text-xl">
            Tu propiedad fue creada
          </DialogTitle>
          <DialogDescription className="text-base">
            Para que otros usuarios puedan verla en las búsquedas, necesitás
            verificar tu identidad. Es rápido y solo se hace una vez.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex flex-col gap-3">
          <Button
            onClick={() => {
              setOpen(false);
              router.push("/perfil");
            }}
            className="gap-2 rounded-full"
          >
            Verificar mi identidad
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="rounded-full text-muted-foreground"
          >
            Ahora no (propiedad no visible hasta verificarse)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
