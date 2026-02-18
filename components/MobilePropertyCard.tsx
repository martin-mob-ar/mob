"use client";
import Image from "next/image";
import { Heart, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Property } from "@/components/PropertyCard";

interface MobilePropertyCardProps {
  property: Property;
}

const MobilePropertyCard = ({
  property
}: MobilePropertyCardProps) => {
  const images = property.images?.length ? property.images : [property.image];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const {
    isAuthenticated,
    openAuthModal
  } = useAuth();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setIsFavorite(!isFavorite);
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
    const newIndex = (currentImageIndex + 1) % images.length;
    setCurrentImageIndex(newIndex);
    scrollToImage(newIndex);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = (currentImageIndex - 1 + images.length) % images.length;
    setCurrentImageIndex(newIndex);
    scrollToImage(newIndex);
  };

  return <Link href={`/propiedad/${property.id}`} className="block">
      <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-border">
        {/* Image Section - Horizontal scroll gallery */}
        <div className="relative aspect-[4/3] overflow-hidden group">
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
            {images.map((img, index) => <div key={index} className="flex-shrink-0 w-full h-full snap-center relative">
                <Image src={img} alt={`${property.address} - ${index + 1}`} fill sizes="100vw" className="object-cover" draggable={false} />
              </div>)}
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background transition-all shadow-md opacity-0 group-hover:opacity-100 md:opacity-100"
              >
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background transition-all shadow-md opacity-0 group-hover:opacity-100 md:opacity-100"
              >
                <ChevronRight className="h-4 w-4 text-foreground" />
              </button>
            </>
          )}

          {/* Badge */}
          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-background/95 text-foreground shadow-sm">
              {property.type === "inmobiliaria" ? "Inmobiliaria" : "Dueño directo"}
            </span>
          </div>

          {/* Dots Indicator */}
          {images.length > 1 && <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
              {images.map((_, index) => <div key={index} className={`h-1.5 rounded-full transition-all ${index === currentImageIndex ? "w-5 bg-background" : "w-1.5 bg-background/60"}`} />)}
            </div>}

          {/* Verified Badge */}
          {property.verified && (
            <div className="absolute bottom-3 left-3 pointer-events-none">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-background/95 text-primary shadow-sm">
                <CheckCircle className="h-3.5 w-3.5" />
                Verificada
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
            {property.description}
          </p>

          {/* Price Row */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-display font-bold text-xl text-foreground">
                  ${property.price.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground uppercase">
                  Total
                </span>
                {property.rentPrice && property.expensas && <span className="text-sm text-muted-foreground">
                    (${property.rentPrice.toLocaleString()} Alq + ${property.expensas.toLocaleString()} Exp)
                  </span>}
              </div>
            </div>

            {/* Favorite Button - Always visible */}
            <button onClick={handleFavoriteClick} className="h-10 w-10 rounded-full bg-background/50 backdrop-blur flex items-center justify-center hover:bg-background transition-colors">
              <Heart className={`h-5 w-5 transition-colors ${isFavorite ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"}`} />
            </button>
          </div>

          {/* Details */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
            {property.rooms !== undefined && <span className="font-bold">{property.rooms} dorm</span>}
            {property.bathrooms !== undefined && <>
                <span>·</span>
                <span className="font-bold">{property.bathrooms} baño</span>
              </>}
            {property.parking !== undefined && property.parking > 0 && <>
                <span>·</span>
                <span className="font-bold">{property.parking} coch</span>
              </>}
            {property.surface !== undefined && <>
                <span>·</span>
                <span className="font-bold">{property.surface} m²</span>
              </>}
          </div>

          {/* Location */}
          <p className="text-sm text-muted-foreground">
            {property.address} · {property.neighborhood}
          </p>
        </div>
      </div>
    </Link>;
};
export default MobilePropertyCard;