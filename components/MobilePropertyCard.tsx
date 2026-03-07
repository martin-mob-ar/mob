"use client";
import Image from "next/image";
import { Heart, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";

import { useFavorites } from "@/contexts/FavoritesContext";
import { Property } from "@/components/PropertyCard";
import { getPropertyUrl } from "@/lib/utils/property-url";
import { formatAddress } from "@/lib/utils";

interface MobilePropertyCardProps {
  property: Property;
}

const MobilePropertyCard = ({
  property
}: MobilePropertyCardProps) => {
  const images = property.images?.length ? property.images : [property.image];
  const totalSlides = images.length;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(Number(property.id));
  };

  const scrollToImage = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = container.offsetWidth;
      container.scrollTo({ left: index * itemWidth, behavior: 'smooth' });
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = Math.min(currentImageIndex + 1, totalSlides - 1);
    setCurrentImageIndex(newIndex);
    scrollToImage(newIndex);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = Math.max(currentImageIndex - 1, 0);
    setCurrentImageIndex(newIndex);
    scrollToImage(newIndex);
  };

  return <Link href={getPropertyUrl(property)} className="block">
      <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-border">
        {/* Image Section - Horizontal scroll gallery */}
        <div className="relative aspect-[4/3] overflow-hidden group">
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
            {images.map((img, index) => <div key={index} className="flex-shrink-0 w-full h-full snap-center relative">
                <Image src={img} alt={`${property.address} - ${index + 1}`} fill sizes="100vw" className="object-cover" draggable={false} />
              </div>)}
          </div>

          {/* Navigation Arrows */}
          <>
            {currentImageIndex > 0 && (
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background transition-all shadow-md opacity-0 group-hover:opacity-100 md:opacity-100"
              >
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </button>
            )}
            <button
              onClick={(e) => {
                if (currentImageIndex === totalSlides - 1) {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(getPropertyUrl(property), '_blank', 'noopener,noreferrer');
                } else {
                  nextImage(e);
                }
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background transition-all shadow-md opacity-0 group-hover:opacity-100 md:opacity-100"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          </>

          {/* Badge */}
          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-background/95 text-foreground shadow-sm">
              {property.type === "inmobiliaria" ? "Inmobiliaria" : "Dueño directo"}
            </span>
          </div>

          {/* Favorite button - top right of image */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 h-8 w-8 rounded-full backdrop-blur flex items-center justify-center transition-colors z-10 ${
              isFavorite(Number(property.id))
                ? "bg-background"
                : "bg-background/50 hover:bg-background"
            }`}
          >
            <Heart className={`h-4 w-4 transition-colors ${isFavorite(Number(property.id)) ? "fill-primary text-primary" : "text-foreground/50"}`} />
          </button>

          {/* Dots Indicator */}
          {totalSlides > 1 && <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
              {Array.from({ length: totalSlides }, (_, index) => <div key={index} className={`h-1.5 rounded-full transition-all ${index === currentImageIndex ? "w-5 bg-background" : "w-1.5 bg-background/60"}`} />)}
            </div>}

          {/* Verified Badge */}
          {property.verified && (
            <div className="absolute bottom-3 left-3 pointer-events-none">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-background/95 text-primary shadow-sm">
                <CheckCircle className="h-3.5 w-3.5" />
                Verificada
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="px-4 pt-3 pb-4">
          {/* Address */}
          <h3 className="font-display font-semibold text-foreground text-base leading-snug truncate">
            {formatAddress(property.address)}
          </h3>
          <p className="text-muted-foreground text-sm mt-0.5 truncate">
            {property.neighborhood}
          </p>

          {/* Price */}
          <div className="mt-2">
            {property.currency === "USD" ? (
              <>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="font-display font-bold text-lg text-foreground">
                    USD {property.rentPrice?.toLocaleString("es-AR") ?? property.price.toLocaleString("es-AR")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Total
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {property.expensas != null && property.expensas > 0
                    ? `+ $${property.expensas.toLocaleString("es-AR")} exp`
                    : "Sin expensas"}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="font-display font-bold text-lg text-foreground">
                    ${property.price.toLocaleString("es-AR")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Total
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {property.expensas != null && property.expensas > 0
                    ? `+ $${property.expensas.toLocaleString("es-AR")} exp`
                    : "Sin expensas"}
                </p>
              </>
            )}
          </div>

          {/* Details */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
            {property.rooms !== undefined && <span>{property.rooms} dorm</span>}
            {property.bathrooms !== undefined && <>
                <span>·</span>
                <span>{property.bathrooms} baño</span>
              </>}
            {property.parking !== undefined && property.parking > 0 && <>
                <span>·</span>
                <span>{property.parking} coch</span>
              </>}
            {property.surface !== undefined && <>
                <span>·</span>
                <span>{property.surface} m²</span>
              </>}
          </div>
        </div>
      </div>
    </Link>;
};
export default MobilePropertyCard;