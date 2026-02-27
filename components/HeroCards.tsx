"use client";

import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { Property } from "@/components/PropertyCard";

interface HeroCardsProps {
  properties: Property[];
}

/**
 * 4 property cards in a natural scattered cluster — two loose pairs
 * with organic overlap, varying heights, and subtle rotations.
 * Each card has a subtle independent floating animation.
 */
const cardLayout = [
  // Left-back: peeks behind the left-front card
  {
    top: 30,
    left: "0%",
    z: 10,
    rotate: -4,
    scale: 0.93,
    width: 195,
    floatDuration: "3.2s",
    floatDelay: "0s",
  },
  // Left-front: prominent, overlaps left-back
  {
    top: 150,
    left: "14%",
    z: 30,
    rotate: 2,
    scale: 1,
    width: 195,
    floatDuration: "3.6s",
    floatDelay: "0.6s",
  },
  // Right-back: upper right, partially behind right-front
  {
    top: 0,
    left: "50%",
    z: 15,
    rotate: -2,
    scale: 0.9,
    width: 190,
    floatDuration: "3.4s",
    floatDelay: "1.2s",
  },
  // Right-front: lower right, overlaps right-back
  {
    top: 170,
    left: "56%",
    z: 25,
    rotate: 5,
    scale: 0.96,
    width: 190,
    floatDuration: "3.8s",
    floatDelay: "0.3s",
  },
];

const HeroCards = ({ properties }: HeroCardsProps) => {
  const showcase = properties.slice(0, 4);

  if (showcase.length === 0) return null;

  return (
    <div className="relative w-full h-full">
      {showcase.map((property, i) => {
        const layout = cardLayout[i] ?? cardLayout[0];
        const images = property.images?.length ? property.images : [property.image];

        return (
          <div
            key={property.id}
            className="absolute opacity-0 animate-fade-in"
            style={{
              top: `${layout.top}px`,
              left: layout.left,
              zIndex: layout.z,
              width: `${layout.width}px`,
              animationDelay: `${300 + i * 150}ms`,
              animationFillMode: "forwards",
            }}
          >
            {/* Float wrapper — separate from rotate/scale so both can coexist */}
            <div
              className="animate-badge-float"
              style={{
                animationDuration: layout.floatDuration,
                animationDelay: layout.floatDelay,
              }}
            >
              <div
                className="bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden transition-transform duration-300 hover:scale-[1.03]"
                style={{
                  transform: `rotate(${layout.rotate}deg) scale(${layout.scale})`,
                }}
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={images[0]}
                    alt={property.address}
                    fill
                    className="object-cover"
                    sizes="200px"
                    priority={i <= 1}
                  />
                  {property.verified && (
                    <div className="absolute bottom-2 left-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/90 backdrop-blur-sm text-[10px] font-semibold text-primary border border-border/50 shadow-sm">
                        <CheckCircle className="h-3 w-3" />
                        Verificada
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-foreground">
                    ${property.price?.toLocaleString("es-AR")}
                    <span className="text-[10px] font-normal text-muted-foreground ml-1">/mes</span>
                  </p>
                  <p className="text-xs font-medium text-foreground truncate mt-1">{property.address}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{property.neighborhood}</p>
                  {(property.rooms || property.surface) && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {property.rooms ? `${property.rooms} amb.` : ""}
                      {property.rooms && property.surface ? " · " : ""}
                      {property.surface ? `${property.surface}m²` : ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HeroCards;
