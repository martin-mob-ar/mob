"use client";

import { Globe, ShieldCheck, Fingerprint, Building2, FileSignature } from "lucide-react";

/**
 * Simple pill badges like inspo hero/3.png — icon + single text.
 * Positioned absolutely around the cards on desktop.
 * Each badge has a subtle floating animation with staggered timing.
 */
const badges = [
  {
    text: "100% Online",
    icon: Globe,
    position: "top-[-2%] left-[36%]",
    floatDuration: "3s",
    floatDelay: "0s",
  },
  {
    text: "Sin aval",
    icon: ShieldCheck,
    position: "top-[30%] right-[-4%]",
    floatDuration: "3.4s",
    floatDelay: "0.8s",
  },
  {
    text: "Firma digital",
    icon: FileSignature,
    position: "bottom-[16%] left-[-4%]",
    floatDuration: "3.2s",
    floatDelay: "0.4s",
  },
  {
    text: "Inquilino Verificado",
    icon: Fingerprint,
    position: "bottom-[6%] right-[16%]",
    floatDuration: "3.6s",
    floatDelay: "1.2s",
  },
];

const HeroBadges = () => {
  return (
    <>
      {/* Desktop: Floating pill badges */}
      <div className="hidden lg:block">
        {badges.map((badge, i) => (
          <div
            key={badge.text}
            className={`absolute ${badge.position} opacity-0 animate-fade-in z-40`}
            style={{
              animationDelay: `${600 + i * 180}ms`,
              animationFillMode: "forwards",
            }}
          >
            <div
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-background border border-border/60 shadow-md text-sm font-medium text-foreground whitespace-nowrap animate-badge-float"
              style={{
                animationDuration: badge.floatDuration,
                animationDelay: badge.floatDelay,
              }}
            >
              <badge.icon className="h-4 w-4 text-primary shrink-0" strokeWidth={1.8} />
              {badge.text}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: Horizontal wrap row */}
      <div className="lg:hidden flex gap-2 flex-wrap justify-center">
        {badges.map((badge) => (
          <div
            key={badge.text}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border/60 shadow-sm text-xs font-medium text-foreground whitespace-nowrap"
          >
            <badge.icon className="h-3.5 w-3.5 text-primary" />
            {badge.text}
          </div>
        ))}
      </div>
    </>
  );
};

export default HeroBadges;
