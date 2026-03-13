"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  UserCheck,
  ShieldCheck,
  Calendar,
  FileText,
  PenTool,
} from "lucide-react";
import Image from "next/image";

/* ── Badge data ──
   Positions are % of the container — badges naturally
   hug the card on mobile and spread out on desktop. */
const tags = [
  {
    icon: UserCheck,
    label: "Interesados calificados",
    style: { top: "5%", left: "5%" } as React.CSSProperties,
    floatClass: "animate-float-a",
    entranceDelay: 0,
  },
  {
    icon: ShieldCheck,
    label: "Garantía aprobada",
    style: { top: "22%", right: "3%" } as React.CSSProperties,
    floatClass: "animate-float-b",
    floatDelay: "0.6s",
    entranceDelay: 0.08,
  },
  {
    icon: Calendar,
    label: "Coordinación de visitas",
    style: { top: "44%", left: "0%" } as React.CSSProperties,
    floatClass: "animate-float-c",
    entranceDelay: 0.16,
  },
  {
    icon: FileText,
    label: "Contratos digitales",
    style: { top: "62%", right: "2%" } as React.CSSProperties,
    floatClass: "animate-float-a",
    floatDelay: "1.2s",
    entranceDelay: 0.24,
  },
  {
    icon: PenTool,
    label: "Firma electrónica",
    style: {
      top: "82%",
      left: "50%",
      transform: "translateX(-50%)",
    } as React.CSSProperties,
    floatClass: "animate-float-b",
    floatDelay: "0.8s",
    entranceDelay: 0.32,
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

const HeroFloatingCards = () => {
  return (
    <div className="relative w-full min-h-[420px] lg:min-h-[480px] flex items-center justify-center overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, hsl(227 100% 66% / 0.06), transparent 70%)",
        }}
      />

      {/* Property card */}
      <motion.div
        className="relative z-[1] w-[300px] rounded-2xl bg-card border border-border/60 overflow-hidden"
        style={{
          boxShadow:
            "0 2px 8px -2px hsl(0 0% 0% / 0.06), 0 8px 32px -6px hsl(0 0% 0% / 0.1), 0 24px 56px -12px hsl(0 0% 0% / 0.08)",
        }}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease }}
      >
        <div className="aspect-[4/3] overflow-hidden bg-muted relative">
          <Image
            src="/assets/property-new-4.png"
            alt="Av Libertador al 3500"
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-display font-bold text-lg text-foreground">
            Av Libertador al 3500
          </h3>
          <p className="text-muted-foreground text-sm mt-0.5">Palermo</p>
          <p className="text-muted-foreground text-sm mt-2">
            2 dorm · 1 baño · 45 m²
          </p>
        </div>
      </motion.div>

      {/* Floating badges */}
      {tags.map((tag) => {
        const Icon = tag.icon;
        return (
          <div key={tag.label} className="absolute z-10" style={tag.style}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.4 + tag.entranceDelay,
                ease,
              }}
            >
              <div
                className={tag.floatClass}
                style={
                  tag.floatDelay
                    ? { animationDelay: tag.floatDelay }
                    : undefined
                }
              >
                <div
                  className="flex items-center gap-2.5 rounded-full border border-primary/15 bg-card/90 backdrop-blur-lg px-4 py-2.5 select-none whitespace-nowrap transition-all duration-300 hover:scale-[1.04] hover:border-primary/35 hover:bg-card"
                  style={{
                    boxShadow:
                      "0 1px 6px -1px hsl(227 100% 66% / 0.1), 0 2px 4px -1px hsl(0 0% 0% / 0.04)",
                  }}
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {tag.label}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

export default HeroFloatingCards;
