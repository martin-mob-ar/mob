"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, Heart, MapPin, CheckCircle, Shield, Calendar, BadgeCheck, Zap, ChevronRight, Grid3X3, Bed, Square, Bath, Car, Home, ChevronLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { properties as mockProperties } from "@/data/properties";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect, useRef, useCallback } from "react";
import { Property } from "@/components/PropertyCard";
import Image from "next/image";
const KeyRoundIcon = "/assets/key-round-icon.svg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import PropertyMap from "@/components/PropertyMap";

interface PropertyDetailProps {
  property?: Property;
  photos?: string[];
  tags?: string[];
  description?: string | null;
  branchName?: string | null;
  locationFull?: string | null;
  geoLat?: number | null;
  geoLong?: number | null;
}

const PropertyDetail = ({ property: propProperty, photos: propPhotos, tags: propTags, description: propDescription, branchName: propBranchName, locationFull: propLocationFull, geoLat, geoLong }: PropertyDetailProps) => {
  const { slug } = useParams();
  const router = useRouter();
  // Extract numeric ID from slug for mock data fallback
  const idFromSlug = (slug as string)?.match(/(\d+)$/)?.[1] || (slug as string);
  const property = propProperty || mockProperties.find((p) => p.id === idFromSlug) || mockProperties[0];
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showBottomBar, setShowBottomBar] = useState(false);
  const mainCtaRef = useRef<HTMLDivElement>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Gallery images: use real photos if available, otherwise mock
  const galleryImages = propPhotos && propPhotos.length > 0
    ? propPhotos
    : [
        property.image,
        mockProperties[1]?.image,
        mockProperties[2]?.image,
        mockProperties[3]?.image,
        mockProperties[4]?.image,
      ].filter(Boolean);

  const scrollPrev = useCallback(() => {
    carouselApi?.scrollPrev();
  }, [carouselApi]);

  const scrollNext = useCallback(() => {
    carouselApi?.scrollNext();
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const amenities = propTags && propTags.length > 0
    ? propTags
    : [
        "Balcón",
        "Seguridad 24hs",
        "Luminoso",
        "Cocina integrada",
        "Laundry",
        "Apto mascotas",
      ];

  const description = propDescription || `Increíble departamento ubicado en una de las mejores zonas de ${property.neighborhood}. Muy luminoso, con balcón al frente y terminaciones de categoría. Edificio moderno con seguridad y excelentes accesos. Ideal para quienes buscan comodidad y diseño en un solo lugar.`;

  const branchName = propBranchName || null;
  const locationSuffix = propLocationFull || `${property.neighborhood}`;

  // Detect scroll to show/hide bottom bar
  useEffect(() => {
    const handleScroll = () => {
      if (mainCtaRef.current) {
        const rect = mainCtaRef.current.getBoundingClientRect();
        // Show bottom bar when main CTA is out of view (scrolled past)
        setShowBottomBar(rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGalleryPrev = () => {
    setGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleGalleryNext = () => {
    setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
  };

  // Handle keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showGallery) return;
      if (e.key === 'ArrowLeft') handleGalleryPrev();
      if (e.key === 'ArrowRight') handleGalleryNext();
      if (e.key === 'Escape') setShowGallery(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGallery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Gallery Modal */}
      {showGallery && (
        <div 
          className="fixed inset-0 top-[72px] z-40 bg-background flex flex-col"
          onClick={() => setShowGallery(false)}
        >
          {/* Main image area */}
          <div className="flex-1 flex items-center justify-center relative px-4">
            {/* Navigation controls above image */}
            <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-6">
              <button 
                onClick={() => setShowGallery(false)}
                className="flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Volver</span>
              </button>
              
              <div className="text-muted-foreground text-sm font-medium bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg">
                {galleryIndex + 1} / {galleryImages.length}
              </div>

              <button 
                onClick={() => setShowGallery(false)}
                className="h-10 w-10 flex items-center justify-center bg-background/80 backdrop-blur-sm hover:bg-secondary rounded-lg transition-colors"
              >
                <span className="text-foreground text-xl leading-none">&times;</span>
              </button>
            </div>

            {/* Previous arrow */}
            <button
              onClick={(e) => { e.stopPropagation(); handleGalleryPrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background border border-border hover:bg-secondary flex items-center justify-center transition-colors z-10 shadow-sm"
            >
              <ChevronLeft className="h-6 w-6 text-foreground" />
            </button>

            {/* Image container with swipe support */}
            <div 
              className="max-w-[90vw] max-h-[60vh] flex items-center justify-center mt-12"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => {
                const touchStartX = e.touches[0].clientX;
                const handleTouchEnd = (endEvent: TouchEvent) => {
                  const touchEndX = endEvent.changedTouches[0].clientX;
                  const diff = touchStartX - touchEndX;
                  if (Math.abs(diff) > 50) {
                    if (diff > 0) handleGalleryNext();
                    else handleGalleryPrev();
                  }
                  document.removeEventListener('touchend', handleTouchEnd);
                };
                document.addEventListener('touchend', handleTouchEnd);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={galleryImages[galleryIndex]}
                alt={`Vista ${galleryIndex + 1}`}
                className="max-w-full max-h-[60vh] object-contain select-none rounded-lg"
                draggable={false}
              />
            </div>

            {/* Next arrow */}
            <button
              onClick={(e) => { e.stopPropagation(); handleGalleryNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background border border-border hover:bg-secondary flex items-center justify-center transition-colors z-10 shadow-sm"
            >
              <ChevronRight className="h-6 w-6 text-foreground" />
            </button>
          </div>

          {/* Thumbnail strip */}
          <div className="flex justify-center gap-2 px-4 py-4 border-t border-border">
            {galleryImages.map((img, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); setGalleryIndex(index); }}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all relative ${
                  index === galleryIndex ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-80'
                }`}
              >
                <Image src={img} alt={`Miniatura ${index + 1}`} fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Global Header - Shows on all pages including mobile */}
      <Header />

      {/* Desktop Sub-header */}
      <div className="hidden md:block border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link 
              href="/buscar" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a búsqueda
            </Link>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Share2 className="h-4 w-4" />
                Compartir
              </button>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Heart className="h-4 w-4" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Gallery Hero - Full width carousel */}
      <div className="md:hidden">
        <div className="relative">
          {/* Floating navigation buttons over image */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
            <Link 
              href="/buscar" 
              className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </Link>
            <div className="flex items-center gap-2">
              <button className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center">
                <Share2 className="h-5 w-5 text-foreground" />
              </button>
              <button className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center">
                <Heart className="h-5 w-5 text-foreground" />
              </button>
            </div>
          </div>

          {/* Carousel */}
          <Carousel 
            setApi={setCarouselApi}
            className="w-full"
            opts={{ loop: true }}
          >
            <CarouselContent className="ml-0">
              {galleryImages.map((image, index) => (
                <CarouselItem key={index} className="pl-0">
                  <div className="aspect-[4/3] relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt={`Vista ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Verified Badge - Bottom left */}
          {property.verified && (
            <div className="absolute bottom-4 left-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-background/95 text-primary shadow-sm">
                <CheckCircle className="h-3.5 w-3.5" />
                Verificada
              </span>
            </div>
          )}

          {/* Subtle navigation arrows */}
          <button 
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center z-10"
          >
            <ChevronLeft className="h-6 w-6 text-white/70" />
          </button>
          <button 
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center z-10"
          >
            <ChevronRight className="h-6 w-6 text-white/70" />
          </button>
        </div>
      </div>

      {/* Desktop Gallery */}
      <div className="hidden md:block max-w-6xl mx-auto px-6 py-6">
        {/* Title - Desktop */}
        <div className="mb-4">
          <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">
            {property.address}
          </h1>
          <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {property.address}, {locationSuffix}
          </p>
        </div>

        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-xl overflow-hidden mb-6 h-[400px]">
          <div className="col-span-2 row-span-2 relative cursor-pointer" onClick={() => { setGalleryIndex(0); setShowGallery(true); }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={galleryImages[0] || property.image}
              alt={property.address}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Verified Badge - Desktop */}
            {property.verified && (
              <div className="absolute bottom-3 left-3 z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-background/95 text-primary shadow-sm">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Verificada
                </span>
              </div>
            )}
          </div>
          {galleryImages.slice(1, 5).map((img, index) => (
            <div
              key={index}
              className="col-span-1 cursor-pointer relative"
              onClick={() => { setGalleryIndex(index + 1); setShowGallery(true); }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`Vista ${index + 2}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {index === 3 && galleryImages.length > 5 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setGalleryIndex(0); setShowGallery(true); }}
                  className="absolute bottom-2 right-2 px-3 py-1.5 bg-background rounded-lg border border-border text-xs font-medium hover:bg-secondary transition-colors flex items-center gap-1.5"
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                  Mostrar todas las fotos
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden pb-6">
        {/* Property Info Block */}
        <div className="px-4 py-5 border-b border-border">
          <h1 className="font-display text-xl font-bold text-foreground mb-1">
            {property.address}
          </h1>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {property.address}, {property.neighborhood}
          </p>

        </div>

        {/* Price + CTA Block - Priority section */}
        <div className="px-4 py-5 bg-secondary/30 border-b border-border">
          {property.currency === "USD" ? (
            <>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-display text-2xl font-bold text-foreground">
                  USD {property.rentPrice?.toLocaleString() ?? property.price.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Alquiler
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {property.expensas != null && property.expensas > 0
                  ? `$${property.expensas.toLocaleString()} expensas`
                  : "Sin expensas"}
              </p>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-display text-2xl font-bold text-foreground">
                  ${property.price.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Total
                </span>
              </div>
            </>
          )}

          {/* Reference for bottom bar visibility - triggers when this price breakdown scrolls out */}
          <div ref={mainCtaRef} className={`flex gap-4 text-sm mb-5 ${property.currency === "USD" ? "hidden" : ""}`}>
            {property.rentPrice != null && property.rentPrice > 0 && (
              <div>
                <span className="text-muted-foreground text-xs">Alquiler</span>
                <p className="font-medium">${property.rentPrice.toLocaleString()}</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground text-xs">Expensas</span>
              <p className="font-medium">
                {property.expensas != null && property.expensas > 0
                  ? `$${property.expensas.toLocaleString()}`
                  : "Sin expensas"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full rounded-xl h-12 font-semibold text-base"
              onClick={() => router.push("/visita/intro")}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Agendar visita
            </Button>
            <Button 
              className="w-full rounded-xl h-12 font-medium text-base bg-secondary hover:bg-secondary/80 text-foreground border-0"
              onClick={() => router.push("/reserva/verificacion-intro")}
            >
              <Image src={KeyRoundIcon} alt="" width={20} height={20} className="mr-2" />
              Reservar
            </Button>
          </div>

          {/* Quick Stats - Below CTAs */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-border/50">
            {[
              { icon: Square, label: `${property.surface} m²` },
              { icon: Home, label: `${property.rooms + 1} amb` },
              { icon: Bed, label: `${property.rooms} ${property.rooms === 1 ? 'dorm' : 'dorms'}` },
              { icon: Bath, label: `${property.bathrooms} ${property.bathrooms === 1 ? 'baño' : 'baños'}` },
              { icon: Car, label: "–" },
            ].map((stat, index) => (
              <div 
                key={index} 
                className="flex items-center gap-1.5"
              >
                <div className="h-6 w-6 rounded-md border border-border flex items-center justify-center">
                  <stat.icon className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-semibold text-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div className="px-4 py-5 border-b border-border">
          <h2 className="font-display text-lg font-bold text-foreground mb-3">
            Sobre esta propiedad
          </h2>
          <p className={`text-sm text-muted-foreground leading-relaxed ${!showFullDescription ? "line-clamp-4" : ""}`}>
            {description}
          </p>
          {description.length > 150 && (
            <button 
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-sm font-medium text-foreground mt-2 flex items-center gap-1"
            >
              {showFullDescription ? "Ver menos" : "Ver más"}
              <ChevronRight className={`h-4 w-4 transition-transform ${showFullDescription ? "rotate-90" : ""}`} />
            </button>
          )}
        </div>

        {/* Location Section */}
        <div className="px-4 py-5 border-b border-border">
          <h2 className="font-display text-lg font-bold text-foreground mb-3">
            Ubicación
          </h2>
          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {property.address}, {locationSuffix}
          </p>
          {geoLat && geoLong ? (
            <PropertyMap lat={geoLat} lng={geoLong} className="aspect-[16/10]" />
          ) : (
            <div className="aspect-[16/10] bg-secondary rounded-xl flex items-center justify-center">
              <MapPin className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Amenities Section */}
        <div className="px-4 py-5 border-b border-border">
          <h2 className="font-display text-lg font-bold text-foreground mb-4">
            Qué ofrece este lugar
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {amenities.map((amenity) => (
              <div key={amenity} className="flex items-center gap-2.5">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust MOB Section - Clean redesign */}
        <div className="px-4 py-6 border-b border-border bg-secondary/30">
          <h2 className="font-display text-xl font-bold text-foreground mb-5 text-center">
            Alquilá con confianza
          </h2>
          <div className="space-y-3">
            <div className="bg-background rounded-xl p-4 border border-border/50">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-base text-foreground">Contrato digital</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Firma 100% online, con validez legal.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-background rounded-xl p-4 border border-border/50">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-base text-foreground">Visitas coordinadas</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Agenda sincronizada entre inquilino y propietario.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-background rounded-xl p-4 border border-border/50">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-base text-foreground">Inquilinos verificados</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Validación previa por Hoggax, una sola vez.</p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-5 font-medium">
            Menos riesgo. Menos vueltas. Más claridad.
          </p>
        </div>

        {/* Agent/Owner Section */}
        {branchName && (
          <div className="px-4 py-5 border-b border-border">
            <h2 className="font-display text-lg font-bold text-foreground mb-4">
              Publicado por
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                {branchName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{branchName}</p>
                <p className="text-xs text-primary uppercase tracking-wider flex items-center gap-1 mt-0.5">
                  <Shield className="h-3.5 w-3.5" />
                  Inmobiliaria verificada
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full rounded-xl h-11">
              Ver perfil
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3 leading-relaxed">
              Esta inmobiliaria utiliza la infraestructura digital de{" "}
              <span className="font-ubuntu text-primary font-medium">mob</span>
            </p>
          </div>
        )}
      </div>

      {/* Mobile Fixed Bottom CTA - Only shows after scrolling past main CTA */}
      <div 
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 z-40 transition-transform duration-300 ${
          showBottomBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1">
            {property.currency === "USD" ? (
              <>
                <p className="font-display text-lg font-bold text-foreground">
                  USD {property.rentPrice?.toLocaleString() ?? property.price.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {property.expensas != null && property.expensas > 0
                    ? `$${property.expensas.toLocaleString()} expensas`
                    : "Sin expensas"}
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-lg font-bold text-foreground">
                  ${property.price.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {property.expensas != null && property.expensas > 0
                    ? "Total mensual"
                    : "Sin expensas"}
                </p>
              </>
            )}
          </div>
          <Button 
            className="rounded-xl h-11 px-6 font-semibold"
            onClick={() => router.push("/visita/intro")}
          >
            Agendar visita
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <main className="hidden md:block max-w-6xl mx-auto px-6 pb-6">
        <div className="grid grid-cols-3 gap-10">
          {/* Left Column - Details */}
          <div className="col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Ambientes", value: `${property.rooms} Ambientes` },
                { label: "Superficie", value: `${property.surface} m²` },
                { label: "Baños", value: `${property.bathrooms} Baño` },
                { label: "Antigüedad", value: "4 Años" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="font-display font-semibold text-foreground text-sm mt-0.5">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <hr className="border-border" />

            {/* About */}
            <div>
              <h2 className="font-display text-lg font-bold text-foreground mb-3">
                Sobre esta propiedad
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>

            <hr className="border-border" />

            {/* Location */}
            <div>
              <h2 className="font-display text-lg font-bold text-foreground mb-3">
                {property.address}, {locationSuffix}
              </h2>
              {geoLat && geoLong ? (
                <PropertyMap lat={geoLat} lng={geoLong} className="aspect-video" />
              ) : (
                <div className="aspect-video bg-secondary rounded-xl flex items-center justify-center">
                  <MapPin className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>

            <hr className="border-border" />

            {/* Amenities */}
            <div>
              <h2 className="font-display text-lg font-bold text-foreground mb-3">
                Qué ofrece este lugar
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="col-span-1">
            <div className="card-mob p-5 sticky top-20 space-y-5">
              {/* Price */}
              <div>
                {property.currency === "USD" ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-2xl font-bold text-foreground">
                        USD {property.rentPrice?.toLocaleString() ?? property.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        Alquiler
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {property.expensas != null && property.expensas > 0
                        ? `$${property.expensas.toLocaleString()} expensas`
                        : "Sin expensas"}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-2xl font-bold text-foreground">
                        ${property.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        Total
                      </span>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      {property.rentPrice != null && property.rentPrice > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground text-xs uppercase tracking-wider">
                            Alquiler mensual
                          </span>
                          <span className="font-medium text-sm">${property.rentPrice.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider">
                          Expensas
                        </span>
                        <span className="font-medium text-sm">
                          {property.expensas != null && property.expensas > 0
                            ? `$${property.expensas.toLocaleString()}`
                            : "Sin expensas"}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* CTAs */}
              <div className="space-y-2">
                <Button 
                  className="w-full rounded-xl py-5 font-medium text-sm"
                  onClick={() => router.push("/visita/intro")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar visita física
                </Button>
                <Button 
                  className="w-full rounded-xl py-5 font-medium text-sm bg-secondary hover:bg-secondary/80 text-foreground border-0"
                  onClick={() => router.push("/reserva/verificacion-intro")}
                >
                  <Image src={KeyRoundIcon} alt="" width={16} height={16} className="mr-2" />
                  Reservar
                </Button>
              </div>

              {/* Trust Elements */}
              <div className="space-y-3 pt-4 border-t border-border">
                {[
                  { 
                    icon: Shield, 
                    title: "Alquiler Seguro mob",
                    description: "Contrato y firma 100% digital con validez legal."
                  },
                  { 
                    icon: Zap, 
                    title: "Coordinación directa",
                    description: "Sincronizamos tu agenda con la del dueño."
                  },
                  { 
                    icon: BadgeCheck, 
                    title: "Validación por Hoggax",
                    description: "Una vez validado, aplica a cualquier alquiler."
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-2.5">
                    <item.icon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-xs text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground leading-snug">{item.description}</p>
                    </div>
                  </div>
                ))}
                
                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider pt-2">
                  Tus datos están protegidos por <span className="font-ubuntu">mob</span>
                </p>
              </div>

              {/* Agent */}
              {branchName && (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {branchName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{branchName}</p>
                      <p className="text-[10px] text-primary uppercase tracking-wider flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Inmobiliaria verificada
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full rounded-xl text-sm">
                    Ver perfil comercial
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground mt-2 leading-snug">
                    Esta inmobiliaria utiliza la infraestructura digital de{" "}
                    <span className="font-ubuntu text-primary font-medium">mob</span> para agilizar tu alquiler.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile Footer - Compact */}
      <div className="md:hidden border-t border-border bg-secondary/30 px-4 py-6 mb-16">
        <div className="flex items-center justify-center mb-4">
          <Image
            alt="mob"
            width={80}
            height={20}
            className="h-5 w-auto opacity-60"
            src="/lovable-uploads/cda8dadd-0c9e-4b61-abb0-42cf7667cd56.png"
          />
        </div>
        <div className="flex justify-center gap-6 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Inicio</Link>
          <Link href="/buscar" className="hover:text-foreground">Buscar</Link>
          <Link href="/subir-propiedad" className="hover:text-foreground">Publicar</Link>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-4">
          © 2024 <span className="font-ubuntu">mob</span>. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default PropertyDetail;