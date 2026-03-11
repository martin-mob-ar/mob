"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import PropertyCard, { Property } from "./PropertyCard";

interface PropertySectionProps {
  title: string;
  properties: Property[];
  showAll?: boolean;
  href?: string;
}

const PropertySection = ({
  title,
  properties,
  showAll = true,
  href = "/buscar",
}: PropertySectionProps) => {
  const displayProperties = properties.slice(0, 12);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="py-[18px]">
      <div className="container">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
          {/* Left: Title + "ver todas" arrow */}
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-foreground text-xl">
              {title}
            </h2>
            {showAll && (
              <Link
                href={href}
                className="flex items-center justify-center h-7 w-7 rounded-full border border-foreground/20 text-foreground hover:bg-foreground/5 transition-colors"
                aria-label="Ver todas"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {/* Right: Carousel navigation arrows (desktop only) */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="flex items-center justify-center h-8 w-8 rounded-full border border-border text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-default transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="flex items-center justify-center h-8 w-8 rounded-full border border-border text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-default transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden -my-4 -mx-4 sm:-mx-2 md:mx-0" ref={emblaRef}>
          <div className="flex gap-4 py-4 px-4 sm:px-2 md:px-0">
            {displayProperties.map((property) => (
              <div
                key={property.id}
                className="min-w-0 shrink-0 basis-[43%] sm:basis-[calc(33.333%-11px)] md:basis-[calc(25%-12px)] lg:basis-[calc(20%-13px)] xl:basis-[calc(16.666%-14px)]"
              >
                <PropertyCard property={property} context="home" />
              </div>
            ))}

            {/* "Ver todas" card at the end */}
            {showAll && (
              <div className="min-w-0 shrink-0 basis-[43%] sm:basis-[calc(33.333%-11px)] md:basis-[calc(25%-12px)] lg:basis-[calc(20%-13px)] xl:basis-[calc(16.666%-14px)]">
                <Link
                  href={href}
                  className="card-mob-hover h-full flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-accent/30 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-center h-12 w-12 rounded-full border-2 border-foreground/20">
                    <ArrowRight className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="font-display font-semibold text-sm text-foreground">
                    Ver todas
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertySection;
