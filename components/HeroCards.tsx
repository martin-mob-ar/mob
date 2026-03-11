"use client";

import Image from "next/image";

const heroProperties = [
  {
    address: "Av Libertador al 3500",
    neighborhood: "Palermo",
    specs: "2 amb · 1 baño · 42m²",
    image: "/assets/landing-hero/1.png",
  },
  {
    address: "Av Cabildo al 2450",
    neighborhood: "Belgrano",
    specs: "3 amb · 2 baños · 60m²",
    image: "/assets/landing-hero/2.webp",
  },
  {
    address: "Av Callao al 1852",
    neighborhood: "Recoleta",
    specs: "2 amb · 1 baño · 37m²",
    image: "/assets/landing-hero/3.png",
  },
  {
    address: "Segurola 4280",
    neighborhood: "Villa Devoto",
    specs: "2 amb · 1 baño · 52m²",
    image: "/assets/landing-hero/4.png",
  },
];

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

const HeroCards = () => {
  return (
    <div className="relative w-full h-full">
      {heroProperties.map((property, i) => {
        const layout = cardLayout[i];

        return (
          <div
            key={property.address}
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
                className="bg-card rounded-xl border border-border/50 shadow-lg overflow-hidden transition-transform duration-300 hover:scale-[1.03]"
                style={{
                  transform: `rotate(${layout.rotate}deg) scale(${layout.scale})`,
                }}
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={property.image}
                    alt={property.address}
                    fill
                    className="object-cover"
                    sizes="200px"
                    priority={i <= 1}
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-foreground truncate">{property.address}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{property.neighborhood}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{property.specs}</p>
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
