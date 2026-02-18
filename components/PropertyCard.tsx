"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Heart, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export interface Property {
  id: string;
  image: string;
  images?: string[];
  address: string;
  neighborhood: string;
  description: string;
  price: number;
  rentPrice?: number;
  expensas?: number;
  type: "inmobiliaria" | "dueno";
  rooms?: number;
  surface?: number;
  bathrooms?: number;
  parking?: number;
  verified?: boolean;
}

interface PropertyCardProps {
  property: Property;
  showDetails?: boolean;
  compactVerified?: boolean;
}

const PropertyCard = ({ property, showDetails = false, compactVerified = false }: PropertyCardProps) => {
  const images = property.images?.length ? property.images : [property.image];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { isAuthenticated, openAuthModal } = useAuth();
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setIsFavorite(!isFavorite);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
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
    <Link href={`/propiedad/${property.id}`} className="group block">
      <div className="card-mob-hover overflow-hidden">
        <div 
          className="relative aspect-[4/3] overflow-hidden"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Swipeable image container */}
          <div 
            ref={scrollContainerRef}
            className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide touch-pan-x" 
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            onScroll={e => {
              const container = e.currentTarget;
              const scrollLeft = container.scrollLeft;
              const itemWidth = container.offsetWidth;
              const newIndex = Math.round(scrollLeft / itemWidth);
              if (newIndex !== currentImageIndex && newIndex >= 0 && newIndex < images.length) {
                setCurrentImageIndex(newIndex);
              }
            }}
          >
            {images.map((img, index) => (
              <div key={index} className="flex-shrink-0 w-full h-full snap-center relative">
                <Image
                  src={img}
                  alt={`${property.address} - ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  draggable={false}
                />
              </div>
            ))}
          </div>
          
          {/* Navigation Arrows */}
          {images.length > 1 && isHovering && (
            <>
              <button
                onClick={(e) => {
                  prevImage(e);
                  const newIndex = (currentImageIndex - 1 + images.length) % images.length;
                  scrollToImage(newIndex);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background transition-all shadow-md"
              >
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </button>
              <button
                onClick={(e) => {
                  nextImage(e);
                  const newIndex = (currentImageIndex + 1) % images.length;
                  scrollToImage(newIndex);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background transition-all shadow-md"
              >
                <ChevronRight className="h-4 w-4 text-foreground" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, index) => (
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

          {/* Verified Badge */}
          {property.verified && (
            <div className="absolute bottom-3 left-2">
              <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-background text-primary border border-border shadow-sm ${
                compactVerified ? "p-1" : "px-2 py-0.5 text-[10px]"
              }`}>
                <CheckCircle className="h-3 w-3" />
                {!compactVerified && "Verificada"}
              </span>
            </div>
          )}
          
          {/* Badge - White bg with blue text */}
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-background text-primary border border-border shadow-sm">
              {property.type === "inmobiliaria" ? "Inmobiliaria" : "Dueño directo"}
            </span>
          </div>
          
          {/* Favorite button - Always visible */}
          <button 
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/50 backdrop-blur flex items-center justify-center hover:bg-background transition-colors group/fav"
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${
                isFavorite 
                  ? "fill-primary text-primary" 
                  : "text-foreground/50 group-hover/fav:text-primary"
              }`} 
            />
          </button>
        </div>
        
        <div className="p-3">
          <h3 className="font-display font-semibold text-foreground text-xs leading-tight line-clamp-2">
            {property.address}
          </h3>
          <p className="text-muted-foreground text-xs mt-0.5 truncate">
            {property.neighborhood}
          </p>
          
          <div className="mt-2">
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="font-display font-bold text-sm text-foreground">
                ${property.price.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase">
                Total
              </span>
              {property.rentPrice && property.expensas && (
                <span className="text-[10px] text-muted-foreground">
                  (${property.rentPrice.toLocaleString()} Alq + ${property.expensas.toLocaleString()} Exp)
                </span>
              )}
            </div>
          </div>
          
          {property.rooms !== undefined && (
            <div className="text-[9px] text-muted-foreground mt-1.5 truncate">
              <span>{property.rooms} dorm</span>
              {property.bathrooms !== undefined && <span> · {property.bathrooms} baño</span>}
              {property.parking !== undefined && property.parking > 0 && <span> · {property.parking} coch</span>}
              {property.surface !== undefined && <span> · {property.surface} m²</span>}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;