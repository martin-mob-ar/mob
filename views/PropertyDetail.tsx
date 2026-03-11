"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, Heart, MapPin, CheckCircle, Shield, Calendar, BadgeCheck, Zap, ChevronRight, Grid3X3, Bed, Square, Bath, Car, Home, ChevronLeft, FileText, User, Link2, Check } from "lucide-react";
import type { PublisherType } from "@/lib/publisher";
import { getPublisherBadgeConfig } from "@/lib/publisher";
import { InfoTooltip } from "@/components/InfoTooltip";
import { Button } from "@/components/ui/button";
import { properties as mockProperties } from "@/data/properties";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExploreRentals from "@/components/ExploreRentals";
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
import GoogleMapsProvider from "@/components/GoogleMapsProvider";
import LeadForm from "@/components/LeadForm";
import { AnimateHeight } from "@/components/ui/animate-height";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useExchangeRate } from "@/hooks/useExchangeRate";

interface PropertyDetailProps {
  property?: Property;
  photos?: string[];
  tags?: string[];
  description?: string | null;
  publisherName?: string | null;
  publisherLogo?: string | null;
  isTokko?: boolean;
  locationFull?: string | null;
  geoLat?: number | null;
  geoLong?: number | null;
  propertyId?: number;
  contactPhone?: string | null;
  ownerId?: string | null;
  age?: number | null;
  propertyPlan?: "basico" | "acompanado" | "experiencia";
  isInmobiliaria?: boolean;
}

function formatDescription(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/([^\n])•/g, '$1\n•')
    .trim();
}

const PropertyDetail = ({ property: propProperty, photos: propPhotos, tags: propTags, description: propDescription, publisherName: propPublisherName, publisherLogo: propPublisherLogo, isTokko, locationFull: propLocationFull, geoLat, geoLong, propertyId: propPropertyId, contactPhone, ownerId, age: propAge, propertyPlan = "basico", isInmobiliaria = false }: PropertyDetailProps) => {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { rate } = useExchangeRate();

  const handleFavoriteClick = () => {
    if (propPropertyId) toggleFavorite(propPropertyId);
  };

  const [linkCopied, setLinkCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const shareCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openShareMenu = () => {
    if (shareCloseTimer.current) clearTimeout(shareCloseTimer.current);
    setShareOpen(true);
  };
  const scheduleShareClose = () => {
    shareCloseTimer.current = setTimeout(() => setShareOpen(false), 150);
  };

  const getShareUrl = () => `https://mob.ar/propiedad/${slug}`;

  const getShareTitle = () => {
    if (propProperty) {
      const parts = [propProperty.propertyType, propProperty.address, propProperty.neighborhood].filter(Boolean);
      return parts.length > 0 ? parts.join(" - ") : "Mirá esta propiedad en Mob";
    }
    return "Mirá esta propiedad en Mob";
  };

  const getShareText = () => `${getShareTitle()} ${getShareUrl()}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getShareUrl());
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: getShareTitle(),
          text: "Mirá esta propiedad en Mob",
          url: getShareUrl(),
        });
      } catch {
        // User cancelled share - do nothing
      }
    }
  };

  const [leadFormType, setLeadFormType] = useState<"visita" | "reserva" | null>(null);
  // Extract numeric ID from slug for mock data fallback
  const idFromSlug = (slug as string)?.match(/(\d+)$/)?.[1] || (slug as string);
  const property = propProperty || mockProperties.find((p) => p.id === idFromSlug) || mockProperties[0];
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showBottomBar, setShowBottomBar] = useState(false);
  const mainCtaRef = useRef<HTMLDivElement>(null);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);
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

  const amenities = propTags && propTags.length > 0 ? propTags : [];

  const description = propDescription || null;

  const publisherName = propPublisherName || null;
  const publisherLogo = propPublisherLogo || null;
  const locationSuffix = propLocationFull || `${property.neighborhood}`;
  const publisherType: PublisherType = isInmobiliaria
    ? (isTokko ? "inmobiliaria-red" : "inmobiliaria-normal")
    : (propertyPlan !== "basico" ? "dueno-verificado" : "dueno-directo");
  const publisherConfig = getPublisherBadgeConfig(publisherType, "detail");
  const publisherSubtitleColor = publisherType === "dueno-verificado"
    ? "text-emerald-600"
    : publisherType === "dueno-directo"
      ? "text-muted-foreground"
      : "text-primary";

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

  // Lock body scroll when gallery is open
  useEffect(() => {
    if (showGallery) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showGallery]);

  // Auto-scroll thumbnail strip to keep active thumbnail centered
  useEffect(() => {
    const strip = thumbnailStripRef.current;
    if (!strip) return;
    const activeThumb = strip.children[galleryIndex] as HTMLElement | undefined;
    if (!activeThumb) return;
    const stripLeft = strip.scrollLeft;
    const stripWidth = strip.clientWidth;
    const thumbLeft = activeThumb.offsetLeft;
    const thumbWidth = activeThumb.offsetWidth;
    const targetScroll = thumbLeft - stripWidth / 2 + thumbWidth / 2;
    strip.scrollTo({ left: targetScroll, behavior: 'smooth' });
  }, [galleryIndex]);

  return (
    <GoogleMapsProvider>
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
                className="flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors bg-background/80 backdrop-blur-sm px-3 py-2 rounded-xl"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Volver</span>
              </button>
              
              <div className="text-muted-foreground text-sm font-medium bg-background/80 backdrop-blur-sm px-3 py-2 rounded-xl">
                {galleryIndex + 1} / {galleryImages.length}
              </div>

              <button 
                onClick={() => setShowGallery(false)}
                className="h-10 w-10 flex items-center justify-center bg-background/80 backdrop-blur-sm hover:bg-secondary rounded-xl transition-colors"
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
              <Image
                src={galleryImages[galleryIndex]}
                alt={`Vista ${galleryIndex + 1}`}
                width={1200}
                height={900}
                sizes="90vw"
                className="max-w-full max-h-[60vh] object-contain select-none rounded-xl"
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
          <div className="flex items-center gap-2 border-t border-border px-2 py-4">
            <button
              onClick={(e) => { e.stopPropagation(); thumbnailStripRef.current?.scrollBy({ left: -200, behavior: 'smooth' }); }}
              className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-background border border-border hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <div ref={thumbnailStripRef} className="flex gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1">
              {galleryImages.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setGalleryIndex(index); }}
                  className={`flex-shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all relative ${
                    index === galleryIndex ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-80'
                  }`}
                >
                  <Image src={img} alt={`Miniatura ${index + 1}`} fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); thumbnailStripRef.current?.scrollBy({ left: 200, behavior: 'smooth' }); }}
              className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-background border border-border hover:bg-secondary transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>
      )}
      {/* Global Header - Shows on all pages including mobile */}
      <Header />

      {/* Desktop Sub-header */}
      <div className="hidden md:block border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-4">
              <button
                onClick={handleFavoriteClick}
                aria-label={propPropertyId && isFavorite(propPropertyId) ? "Quitar de favoritos" : "Guardar en favoritos"}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  propPropertyId && isFavorite(propPropertyId)
                    ? "text-primary hover:text-primary/70"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${propPropertyId && isFavorite(propPropertyId) ? "fill-primary" : ""}`}
                />
                {propPropertyId && isFavorite(propPropertyId) ? "Guardada" : "Guardar"}
              </button>
              <DropdownMenu open={shareOpen} onOpenChange={setShareOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    onPointerDown={(e) => e.preventDefault()}
                    onMouseEnter={openShareMenu}
                    onMouseLeave={scheduleShareClose}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    Compartir
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48"
                  onMouseEnter={openShareMenu}
                  onMouseLeave={scheduleShareClose}
                >
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleCopyLink(); }} className="gap-2 cursor-pointer">
                    {linkCopied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
                    {linkCopied ? "¡Copiado!" : "Copiar link"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleWhatsAppShare} className="gap-2 cursor-pointer">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Gallery Hero - Full width carousel */}
      <div className="md:hidden">
        <div className="relative">
          {/* Floating navigation buttons over image */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleFavoriteClick}
                aria-label={propPropertyId && isFavorite(propPropertyId) ? "Quitar de favoritos" : "Guardar en favoritos"}
                className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center"
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    propPropertyId && isFavorite(propPropertyId) ? "fill-primary text-primary" : "text-foreground"
                  }`}
                />
              </button>
              <button
                onClick={handleNativeShare}
                aria-label="Compartir"
                className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center"
              >
                <Share2 className="h-5 w-5 text-foreground" />
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
                    <Image
                      src={image}
                      alt={`Vista ${index + 1}`}
                      fill
                      sizes="100vw"
                      priority={index === 0}
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Publisher Badge - Bottom left */}
          <div className="absolute bottom-4 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-background/95 text-primary shadow-sm">
              {publisherConfig.showCheckmark && <BadgeCheck className="h-3.5 w-3.5" />}
              {publisherConfig.label}
              <InfoTooltip text={publisherConfig.tooltipText} size={13} className="text-primary/60 hover:text-primary" />
            </span>
          </div>

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
            {property.propertyType ? `${property.propertyType} en ${property.address}` : property.address}
          </h1>
          <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {property.address}, {locationSuffix}
          </p>
        </div>

        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-xl overflow-hidden mb-6 h-[400px]">
          <div className="col-span-2 row-span-2 relative cursor-pointer" onClick={() => { setGalleryIndex(0); setShowGallery(true); }}>
            <Image
              src={galleryImages[0] || property.image}
              alt={property.address}
              fill
              sizes="(max-width: 1024px) 50vw, 33vw"
              priority
              className="object-cover"
            />
            {/* Publisher Badge - Desktop */}
            <div className="absolute bottom-3 left-3 z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-background/95 text-primary shadow-sm">
                {publisherConfig.showCheckmark && <BadgeCheck className="h-3.5 w-3.5" />}
                {publisherConfig.label}
                <InfoTooltip text={publisherConfig.tooltipText} size={13} className="text-primary/60 hover:text-primary" />
              </span>
            </div>
          </div>
          {galleryImages.slice(1, 5).map((img, index) => (
            <div
              key={index}
              className="col-span-1 cursor-pointer relative"
              onClick={() => { setGalleryIndex(index + 1); setShowGallery(true); }}
            >
              <Image
                src={img}
                alt={`Vista ${index + 2}`}
                fill
                sizes="(max-width: 1024px) 25vw, 17vw"
                className="object-cover"
              />
              {index === 3 && galleryImages.length > 5 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setGalleryIndex(0); setShowGallery(true); }}
                  className="absolute bottom-2 right-2 px-3 py-1.5 bg-background rounded-xl border border-border text-xs font-medium hover:bg-secondary transition-colors flex items-center gap-1.5"
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
            {property.propertyType ? `${property.propertyType} en ${property.address}` : property.address}
          </h1>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {property.address}, {property.neighborhood}
          </p>

        </div>

        {/* Price + CTA Block - Priority section */}
        <div ref={mainCtaRef} className="px-4 py-5 bg-secondary/30 border-b border-border scroll-mt-20">
          {(() => {
            const rentUsd = property.rentPrice ?? property.price;
            const hasExpensas = property.expensas != null && property.expensas > 0;
            const isUsd = property.currency === "USD";
            const expensasInUsd = isUsd && hasExpensas && rate ? Math.round(property.expensas! / rate) : 0;
            const showUsdTotal = isUsd && hasExpensas && rate;

            return isUsd ? (
              <>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-display text-2xl font-bold text-foreground">
                    USD {(showUsdTotal ? rentUsd + expensasInUsd : rentUsd).toLocaleString("es-AR")}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    {showUsdTotal ? "Total" : "Alquiler"}
                  </span>
                </div>
                {!showUsdTotal && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {hasExpensas
                      ? `$${property.expensas!.toLocaleString("es-AR")} expensas`
                      : "Sin expensas"}
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-display text-2xl font-bold text-foreground">
                  ${property.price.toLocaleString("es-AR")}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Total
                </span>
              </div>
            );
          })()}

          <div className={`flex gap-4 text-sm ${property.currency === "USD" && !(property.expensas != null && property.expensas > 0 && rate) ? "hidden" : ""}`}>
            {property.currency === "USD" ? (
              <>
                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">Alquiler mensual</span>
                  <p className="font-medium">USD {(property.rentPrice ?? property.price).toLocaleString("es-AR")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">Expensas</span>
                  <p className="font-medium">${property.expensas!.toLocaleString("es-AR")}</p>
                </div>
              </>
            ) : (
              <>
                {property.rentPrice != null && property.rentPrice > 0 && (
                  <div>
                    <span className="text-muted-foreground text-xs">Alquiler</span>
                    <p className="font-medium">${property.rentPrice.toLocaleString("es-AR")}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground text-xs">Expensas</span>
                  <p className="font-medium">
                    {property.expensas != null && property.expensas > 0
                      ? `$${property.expensas.toLocaleString("es-AR")}`
                      : "Sin expensas"}
                  </p>
                </div>
              </>
            )}
          </div>

          <AnimateHeight show={!leadFormType}>
            <div className="space-y-2 mt-5">
              <Button
                className="w-full rounded-xl h-12 font-semibold text-base"
                onClick={() => setLeadFormType("visita")}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Agendar visita
              </Button>
              <Button
                className="w-full rounded-xl h-12 font-medium text-base bg-secondary hover:bg-secondary/80 text-foreground border-0"
                onClick={() => setLeadFormType("reserva")}
              >
                <Image src={KeyRoundIcon} alt="" width={20} height={20} className="mr-2" />
                Quiero reservar
              </Button>
            </div>
          </AnimateHeight>

          <AnimateHeight show={!!leadFormType}>
            <div className="mt-3 pt-3 border-t border-border">
              {leadFormType && propPropertyId && (
                <LeadForm
                  type={leadFormType}
                  propertyId={propPropertyId}
                  propertyAddress={property?.address || ""}
                  onClose={() => setLeadFormType(null)}
                  inmobiliariaPhone={isTokko ? (contactPhone ?? undefined) : undefined}
                  propertyPlan={propertyPlan}
                  isInmobiliaria={isInmobiliaria}
                />
              )}
            </div>
          </AnimateHeight>

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
                <div className="h-6 w-6 rounded-xl border border-border flex items-center justify-center">
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
        {description && (
          <div className="px-4 py-5 border-b border-border">
            <h2 className="font-display text-lg font-bold text-foreground mb-3">
              Sobre esta propiedad
            </h2>
            <p className={`text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap ${!showFullDescription ? "line-clamp-4" : ""}`}>
              {formatDescription(description)}
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
        )}

        {/* Location Section */}
        {geoLat && geoLong && (
          <div className="px-4 py-5 border-b border-border">
            <h2 className="font-display text-lg font-bold text-foreground mb-3">
              Ubicación
            </h2>
            <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {property.address}, {locationSuffix}
            </p>
            <PropertyMap lat={geoLat} lng={geoLong} className="aspect-[16/10]" />
          </div>
        )}

        {/* Amenities Section */}
        {amenities.length > 0 && (
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
        )}

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
                  <p className="font-semibold text-base text-foreground">Alquiler Seguro mob</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Contrato y firma 100% online.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-background rounded-xl p-4 border border-border/50">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-base text-foreground">Coordinación directa</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Sincronizamos tu agenda con la {isTokko ? "inmobiliaria" : "del dueño"}.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-background rounded-xl p-4 border border-border/50">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-base text-foreground">Validación por mob</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Te verificás y accedés a <span className="font-semibold text-foreground">garantía 50% off</span> para cualquier alquiler.</p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-5 font-medium">
            Menos riesgo. Menos vueltas. Más claridad.
          </p>
        </div>

        {/* Publisher Section */}
        {publisherName && (
          <div className="px-4 py-5 border-b border-border">
            <h2 className="font-display text-lg font-bold text-foreground mb-4">
              Publicado por
            </h2>
            <div className="flex items-center gap-3 mb-4">
              {publisherLogo ? (
                <div className="h-14 w-14 rounded-lg bg-white border border-border flex items-center justify-center overflow-hidden shrink-0">
                  <Image
                    src={publisherLogo}
                    alt={publisherName}
                    width={56}
                    height={56}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-14 w-14 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <User className="h-7 w-7 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-foreground">{publisherName}</p>
                <p className={`text-xs font-semibold flex items-center gap-1 mt-0.5 ${publisherSubtitleColor}`}>
                  {publisherConfig.showCheckmark && <BadgeCheck className="h-3.5 w-3.5" />}
                  {publisherConfig.label}
                  <InfoTooltip text={publisherConfig.tooltipText} size={13} />
                </p>
              </div>
            </div>
            {(publisherType === "inmobiliaria-red" || publisherType === "inmobiliaria-normal") && (
              <p className="text-xs text-center text-muted-foreground mt-3 leading-relaxed">
                Esta inmobiliaria utiliza la infraestructura digital de{" "}
                <span className="font-ubuntu text-primary font-medium">mob</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Mobile Fixed Bottom CTA - Only shows after scrolling past main CTA */}
      <div 
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-5 z-40 transition-transform duration-300 ${
          showBottomBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1">
            {(() => {
              const rentUsd = property.rentPrice ?? property.price;
              const hasExpensas = property.expensas != null && property.expensas > 0;
              const isUsd = property.currency === "USD";
              const expensasInUsd = isUsd && hasExpensas && rate ? Math.round(property.expensas! / rate) : 0;
              const showUsdTotal = isUsd && hasExpensas && rate;

              return isUsd ? (
                <>
                  <p className="font-display text-lg font-bold text-foreground">
                    USD {(showUsdTotal ? rentUsd + expensasInUsd : rentUsd).toLocaleString("es-AR")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {showUsdTotal ? "Total mensual" : hasExpensas ? `$${property.expensas!.toLocaleString("es-AR")} expensas` : "Sin expensas"}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display text-lg font-bold text-foreground">
                    ${property.price.toLocaleString("es-AR")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hasExpensas ? "Total mensual" : "Sin expensas"}
                  </p>
                </>
              );
            })()}
          </div>
          <Button
              className="rounded-xl h-11 px-6 font-semibold"
              onClick={() => {
                setLeadFormType("visita");
                mainCtaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
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
                { label: "Antigüedad", value: propAge === 0 ? "A estrenar" : propAge != null ? `${propAge} ${propAge === 1 ? "Año" : "Años"}` : "–" },
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

            {/* About */}
            {description && (
              <>
                <hr className="border-border" />
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground mb-3">
                    Sobre esta propiedad
                  </h2>
                  <p className={`text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap ${!showFullDescription ? "line-clamp-4" : ""}`}>
                    {formatDescription(description)}
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
              </>
            )}

            {geoLat && geoLong && (
              <>
                <hr className="border-border" />

                {/* Location */}
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground mb-3">
                    {property.address}, {locationSuffix}
                  </h2>
                  <PropertyMap lat={geoLat} lng={geoLong} className="aspect-video" />
                </div>
              </>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <>
                <hr className="border-border" />
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
              </>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="col-span-1">
            <div className="card-mob p-5 sticky top-20 space-y-5">
              {/* Price + CTAs */}
              <div>
                {(() => {
                  const rentUsd = property.rentPrice ?? property.price;
                  const hasExpensas = property.expensas != null && property.expensas > 0;
                  const isUsd = property.currency === "USD";
                  const expensasInUsd = isUsd && hasExpensas && rate ? Math.round(property.expensas! / rate) : 0;
                  const showUsdTotal = isUsd && hasExpensas && rate;

                  return isUsd ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-2xl font-bold text-foreground">
                          USD {(showUsdTotal ? rentUsd + expensasInUsd : rentUsd).toLocaleString("es-AR")}
                        </span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                          {showUsdTotal ? "Total" : "Alquiler"}
                        </span>
                      </div>
                      {showUsdTotal ? (
                        <div className="mt-3 space-y-1.5" style={{ fontVariantNumeric: "tabular-nums" }}>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground text-xs uppercase tracking-wider">Alquiler mensual</span>
                            <span className="font-medium text-sm">USD {rentUsd.toLocaleString("es-AR")}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground text-xs uppercase tracking-wider">Expensas</span>
                            <span className="font-medium text-sm">${property.expensas!.toLocaleString("es-AR")}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {hasExpensas ? `$${property.expensas!.toLocaleString("es-AR")} expensas` : "Sin expensas"}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-2xl font-bold text-foreground">
                          ${property.price.toLocaleString("es-AR")}
                        </span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                          Total
                        </span>
                      </div>
                      <div className="mt-3 space-y-1.5" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {property.rentPrice != null && property.rentPrice > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground text-xs uppercase tracking-wider">Alquiler mensual</span>
                            <span className="font-medium text-sm">${property.rentPrice.toLocaleString("es-AR")}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground text-xs uppercase tracking-wider">Expensas</span>
                          <span className="font-medium text-sm">
                            {hasExpensas ? `$${property.expensas!.toLocaleString("es-AR")}` : "Sin expensas"}
                          </span>
                        </div>
                      </div>
                    </>
                  );
                })()}

                <AnimateHeight show={!leadFormType}>
                  <div className="space-y-2 mt-5">
                    <Button
                      className="w-full rounded-xl py-5 font-medium text-sm"
                      onClick={() => setLeadFormType("visita")}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar visita
                    </Button>
                    <Button
                      className="w-full rounded-xl py-5 font-medium text-sm bg-secondary hover:bg-secondary/80 text-foreground border-0"
                      onClick={() => setLeadFormType("reserva")}
                    >
                      <Image src={KeyRoundIcon} alt="" width={16} height={16} className="mr-2" />
                      Quiero reservar
                    </Button>
                  </div>
                </AnimateHeight>

                <AnimateHeight show={!!leadFormType}>
                  <div className="mt-3 pt-3 border-t border-border">
                    {leadFormType && propPropertyId && (
                      <LeadForm
                        type={leadFormType}
                        propertyId={propPropertyId}
                        propertyAddress={property?.address || ""}
                        onClose={() => setLeadFormType(null)}
                        inmobiliariaPhone={isTokko ? (contactPhone ?? undefined) : undefined}
                        propertyPlan={propertyPlan}
                        isInmobiliaria={isInmobiliaria}
                      />
                    )}
                  </div>
                </AnimateHeight>
              </div>

              {/* Trust Elements */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex gap-2.5">
                  <Shield className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-xs text-foreground">Alquiler Seguro mob</p>
                    <p className="text-xs text-muted-foreground leading-snug">Contrato y firma 100% online.</p>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <Zap className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-xs text-foreground">Coordinación directa</p>
                    <p className="text-xs text-muted-foreground leading-snug">Sincronizamos tu agenda con la {isTokko ? "inmobiliaria" : "del dueño"}.</p>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-xs text-foreground">Validación por mob</p>
                    <p className="text-xs text-muted-foreground leading-snug">Te verificás y accedés a <span className="font-semibold text-foreground">garantía 50% off</span> para cualquier alquiler.</p>
                  </div>
                </div>
                
                <p className="text-[10px] text-center text-muted-foreground tracking-wider pt-2">
                  Tus datos están protegidos por <span className="font-ubuntu">mob</span>
                </p>
              </div>

              {/* Publisher */}
              {publisherName && (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2.5 mb-3">
                    {publisherLogo ? (
                      <div className="h-10 w-10 rounded-lg bg-white border border-border flex items-center justify-center overflow-hidden shrink-0">
                        <Image
                          src={publisherLogo}
                          alt={publisherName}
                          width={40}
                          height={40}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm text-foreground">{publisherName}</p>
                      <p className={`text-[10px] font-semibold flex items-center gap-1 ${publisherSubtitleColor}`}>
                        {publisherConfig.showCheckmark && <BadgeCheck className="h-3 w-3" />}
                        {publisherConfig.label}
                        <InfoTooltip text={publisherConfig.tooltipText} size={12} />
                      </p>
                    </div>
                  </div>
                  {(publisherType === "inmobiliaria-red" || publisherType === "inmobiliaria-normal") && (
                    <p className="text-[10px] text-center text-muted-foreground mt-2 leading-snug">
                      Esta inmobiliaria utiliza la infraestructura digital de{" "}
                      <span className="font-ubuntu text-primary font-medium">mob</span> para agilizar tu alquiler.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <ExploreRentals title="Más alquileres" />

      <div className="hidden md:block">
        <Footer className="mt-0" />
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
    </GoogleMapsProvider>
  );
};

export default PropertyDetail;