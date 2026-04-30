"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { Heart, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { useIsMobile } from "@/hooks/use-mobile";
import { getPropertyUrl } from "@/lib/utils/property-url";
import { formatAddress } from "@/lib/utils";
import { PublisherBadge } from "@/components/PublisherBadge";
import type { PublisherType, BadgeContext } from "@/lib/publisher";

export interface Property {
  id: string;
  slug?: string;
  image: string;
  images?: string[];
  address: string;
  neighborhood: string;
  description: string;
  price: number;
  rentPrice?: number;
  expensas?: number;
  currency?: string;
  type: "inmobiliaria" | "dueno";
  rooms?: number;
  dormitorios?: number;
  surface?: number;
  bathrooms?: number;
  parking?: number;
  age?: number | null;
  verified?: boolean;
  propertyType?: string;
  publisherType?: PublisherType;
  previousPrice?: number;
  discountPct?: number;
  priceChangedAt?: string;
}

interface PropertyCardProps {
  property: Property;
  showDetails?: boolean;
  compactVerified?: boolean;
  context?: BadgeContext;
}

const PropertyCard = ({ property, showDetails = false, compactVerified = false, context = "search" }: PropertyCardProps) => {
  const images = property.images?.length ? property.images : [property.image];
  const totalSlides = images.length;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { rate } = useExchangeRate();
  const isMobile = useIsMobile();
  const router = useRouter();


  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(Number(property.id));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => Math.min(prev + 1, totalSlides - 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => Math.max(prev - 1, 0));
  };

  const goToImage = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToImage = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = container.offsetWidth;
      container.scrollTo({ left: index * itemWidth, behavior: 'smooth' });
    }
  };

  return (
    <Link href={getPropertyUrl(property)} {...(!isMobile ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group block h-full">
      <div className="card-mob-hover overflow-hidden h-full flex flex-col">
        <div 
          className="relative aspect-[4/3] overflow-hidden"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Swipeable image container */}
          <div 
            ref={scrollContainerRef}
            className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            onScroll={e => {
              const container = e.currentTarget;
              const scrollLeft = container.scrollLeft;
              const itemWidth = container.offsetWidth;
              const newIndex = Math.round(scrollLeft / itemWidth);
              if (newIndex !== currentImageIndex && newIndex >= 0 && newIndex < totalSlides) {
                setCurrentImageIndex(newIndex);
              }
            }}
          >
            {images.map((img, index) => (
              <div key={index} className="flex-shrink-0 w-full h-full snap-center relative">
                <Image
                  src={img}
                  alt={`${property.propertyType || "Propiedad"} ${property.rooms ? `${property.rooms} ambientes ` : ""}en ${property.neighborhood || property.address} - foto ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </div>
          
          {/* Navigation Arrows */}
          {isHovering && (
            <>
              {currentImageIndex > 0 && (
                <button
                  onClick={(e) => {
                    prevImage(e);
                    scrollToImage(Math.max(currentImageIndex - 1, 0));
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background transition-all shadow-md"
                >
                  <ChevronLeft className="h-4 w-4 text-foreground" />
                </button>
              )}
              <button
                onClick={(e) => {
                  if (currentImageIndex === totalSlides - 1) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isMobile) {
                      router.push(getPropertyUrl(property));
                    } else {
                      window.open(getPropertyUrl(property), '_blank', 'noopener,noreferrer');
                    }
                  } else {
                    nextImage(e);
                    scrollToImage(Math.min(currentImageIndex + 1, totalSlides - 1));
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background transition-all shadow-md"
              >
                <ChevronRight className="h-4 w-4 text-foreground" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {totalSlides > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {Array.from({ length: totalSlides }, (_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    goToImage(e, index);
                    scrollToImage(index);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentImageIndex
                      ? "w-4 bg-background"
                      : "w-1.5 bg-background/60 hover:bg-background/80"
                  }`}
                />
              ))}
            </div>
          )}


          {/* Publisher Badge */}
          <div className="absolute top-3 left-3">
            <PublisherBadge
              publisherType={property.publisherType}
              legacyType={property.type}
              context={context}
              compact={isMobile}
            />
          </div>
          
          {/* Favorite button - Always visible */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 h-8 w-8 rounded-full backdrop-blur flex items-center justify-center transition-colors group/fav ${
              isFavorite(Number(property.id))
                ? "bg-background"
                : "bg-background/50 hover:bg-background"
            }`}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isFavorite(Number(property.id))
                  ? "fill-primary text-primary"
                  : "text-foreground/50 group-hover/fav:text-primary"
              }`}
            />
          </button>
        </div>
        
        <div className="p-3 flex-1 flex flex-col min-w-0">
          <h3 className="font-display font-semibold text-foreground text-xs leading-tight truncate">
            {formatAddress(property.address)}
          </h3>
          <p className="text-muted-foreground text-xs mt-0.5 truncate">
            {property.neighborhood}
          </p>
          
          <div className="mt-2">
            {property.currency === "USD" ? (
              (() => {
                const rentUsd = property.rentPrice ?? property.price;
                const hasExpensas = property.expensas != null && property.expensas > 0;
                const expensasInUsd = hasExpensas && rate ? Math.round(property.expensas! / rate) : 0;
                const totalUsd = hasExpensas && rate ? Math.round((rentUsd + expensasInUsd) / 10) * 10 : rentUsd;
                return (
                  <>
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className="font-display font-bold text-sm text-foreground">
                        USD {totalUsd.toLocaleString("es-AR")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Total
                      </span>
                      {property.discountPct != null && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-green-500/15 text-green-600">
                          {Math.round(property.discountPct)}%
                        </span>
                      )}
                    </div>
                    {hasExpensas ? (
                      isMobile ? (
                        <div className="flex flex-col mt-0.5 min-w-0">
                          <span className="text-[10px] text-muted-foreground truncate">
                            USD {rentUsd.toLocaleString("es-AR")} Alquiler
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            ${property.expensas!.toLocaleString("es-AR")} Expensas
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground mt-0.5 block">
                          USD {rentUsd.toLocaleString("es-AR")} Alq + ${property.expensas!.toLocaleString("es-AR")} Exp
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">
                        Sin expensas
                      </span>
                    )}
                  </>
                );
              })()
            ) : (
              <>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="font-display font-bold text-sm text-foreground">
                    ${property.price.toLocaleString("es-AR")}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Total
                  </span>
                  {property.discountPct != null && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-green-500/15 text-green-600">
                      {Math.round(property.discountPct)}%
                    </span>
                  )}
                </div>
                {property.rentPrice != null && property.expensas != null && property.rentPrice > 0 && property.expensas > 0 ? (
                  isMobile ? (
                    <div className="flex flex-col mt-0.5 min-w-0">
                      <span className="text-[10px] text-muted-foreground truncate">
                        ${property.rentPrice.toLocaleString("es-AR")} Alquiler
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        ${property.expensas.toLocaleString("es-AR")} Expensas
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">
                      ${property.rentPrice.toLocaleString("es-AR")} Alq + ${property.expensas.toLocaleString("es-AR")} Exp
                    </span>
                  )
                ) : (
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    Sin expensas
                  </span>
                )}
              </>
            )}
          </div>
          
          <div className="text-[10px] text-muted-foreground mt-auto pt-1.5 truncate min-w-0">
            {property.dormitorios !== undefined || property.rooms !== undefined ? (
              <>
                {property.dormitorios !== undefined ? <span>{property.dormitorios} dorm</span> : property.rooms !== undefined ? <span>{property.rooms} amb</span> : null}
                {property.bathrooms !== undefined && <span>{(property.dormitorios !== undefined || property.rooms !== undefined) ? ' · ' : ''}{property.bathrooms} baño</span>}
                {property.parking !== undefined && property.parking > 0 && <span> · {property.parking} coch</span>}
                {property.surface !== undefined && <span> · {property.surface} m²</span>}
              </>
            ) : (
              <span>&nbsp;</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;