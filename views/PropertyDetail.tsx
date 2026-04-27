"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, Heart, MapPin, CheckCircle, Shield, Calendar, BadgeCheck, ChevronRight, Grid3X3, Bed, Square, Bath, Car, Home, ChevronLeft, FileText, User, Link2, Check, Info, Settings2, Compass, Clock, Toilet, Armchair } from "lucide-react";
import type { PublisherType } from "@/lib/publisher";
import { getPublisherBadgeConfig } from "@/lib/publisher";
import { InfoTooltip } from "@/components/InfoTooltip";
import { GarantiaTooltip } from "@/components/GarantiaTooltip";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExploreRentals from "@/components/ExploreRentals";
import { useState, useEffect, useRef, useCallback } from "react";
import { claritySet } from "@/lib/analytics/clarity";
import { trackPropertyEvent } from "@/lib/analytics/track";
import PropertyCard, { Property } from "@/components/PropertyCard";
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
import VisitLeadForm from "@/components/VisitLeadForm";
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
import VerificationSuccessModal from "@/components/VerificationSuccessModal";
import VerificationRequiredDialog from "@/components/VerificationRequiredDialog";

interface PropertyDetailProps {
  property?: Property;
  photos?: string[];
  photoDescriptions?: (string | null)[];
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
  isUnavailable?: boolean;
  isPendingVerification?: boolean;
  suiteAmount?: number | null;
  toiletAmount?: number | null;
  roofedSurface?: number | null;
  ipcAdjustment?: string | null;
  publicationDate?: string | null;
  visitDays?: string[] | null;
  visitHours?: string[] | null;
  ownerAccountType?: number | null;
  contractDuration?: number | null;
  orientation?: string | null;
  amoblado?: boolean | null;
  showVerificationModal?: boolean;
  relatedProperties?: Property[];
}

function formatDescription(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/([^\n])•/g, '$1\n•')
    .trim();
}

const PropertyDetail = ({ property: propProperty, photos: propPhotos, photoDescriptions = [], tags: propTags, description: propDescription, publisherName: propPublisherName, publisherLogo: propPublisherLogo, isTokko, locationFull: propLocationFull, geoLat, geoLong, propertyId: propPropertyId, contactPhone, ownerId, age: propAge, propertyPlan = "basico", isInmobiliaria = false, isUnavailable = false, isPendingVerification = false, suiteAmount, toiletAmount, roofedSurface, ipcAdjustment, publicationDate, visitDays, visitHours, ownerAccountType, contractDuration, orientation, amoblado, showVerificationModal = false, relatedProperties }: PropertyDetailProps) => {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { rate } = useExchangeRate();

  const isCurrentUserOwner = !!user?.publicUserId && user.publicUserId === ownerId;

  useEffect(() => {
    if (propProperty?.propertyType) claritySet('property_type', propProperty.propertyType);
    if (propPropertyId) claritySet('property_id', String(propPropertyId));
  }, [propProperty?.propertyType, propPropertyId]);

  // Track property view (once per session per property)
  useEffect(() => {
    if (!propPropertyId) return;
    const key = `pv:${propPropertyId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    trackPropertyEvent(propPropertyId, 'property_view');
  }, [propPropertyId]);


  const [verificationModalDismissed, setVerificationModalDismissed] = useState(false);
  const showVerificationBanner = isPendingVerification && isCurrentUserOwner;

  // Show schedule picker for properties from inquilinos/dueños directos with availability configured
  // Plan basico disables the calendar picker — they get the generic LeadForm instead
  const showSchedulePicker =
    !isInmobiliaria &&
    propertyPlan !== "basico" &&
    (ownerAccountType === 1 || ownerAccountType === 2) &&
    !!visitDays && visitDays.length > 0 &&
    !!visitHours && visitHours.length > 0;

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

  const getShareUrl = () => `https://mob.ar/propiedad/${propPropertyId}`;

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

  const leadFormType = 'visita' as const;
  const property = propProperty;
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showBottomBar, setShowBottomBar] = useState(false);
  const mainCtaRef = useRef<HTMLDivElement>(null);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [preloadedIndices, setPreloadedIndices] = useState<Set<number>>(new Set());
  const [badgeTooltipOpen, setBadgeTooltipOpen] = useState(false);
  const [publisherTooltipOpen, setPublisherTooltipOpen] = useState(false);

  // Build descriptive alt text for gallery photos
  const getPhotoAlt = (index: number) => {
    if (photoDescriptions[index]) return photoDescriptions[index]!;
    const typeName = property.propertyType || "Propiedad";
    const loc = propLocationFull || property.neighborhood || "";
    const rooms = property.rooms ? ` ${property.rooms} ambientes` : "";
    return `${typeName}${rooms} en ${loc} - foto ${index + 1}`;
  };

  // Gallery images: use real photos if available, otherwise property main image
  const galleryImages = propPhotos && propPhotos.length > 0
    ? propPhotos
    : [property?.image].filter(Boolean);

  // Preload adjacent gallery images so navigation feels instant
  useEffect(() => {
    setPreloadedIndices((prev) => {
      const next = new Set(prev);
      const len = galleryImages.length;
      for (let offset = -2; offset <= 2; offset++) {
        next.add(((galleryIndex + offset) % len + len) % len);
      }
      if (next.size === prev.size) return prev;
      return next;
    });
  }, [galleryIndex, galleryImages.length]);

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

  const handleGalleryPrev = useCallback(() => {
    setGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  }, [galleryImages.length]);

  const handleGalleryNext = useCallback(() => {
    setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
  }, [galleryImages.length]);

  // Close gallery and sync carousel to the current gallery photo
  const closeGallery = useCallback(() => {
    setShowGallery(false);
    // Scroll mobile carousel to the photo the user was viewing in the lightbox
    if (carouselApi) {
      carouselApi.scrollTo(galleryIndex, true);
    }
  }, [carouselApi, galleryIndex]);

  // Handle keyboard navigation for gallery
  useEffect(() => {
    if (!showGallery) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleGalleryPrev();
      if (e.key === 'ArrowRight') handleGalleryNext();
      if (e.key === 'Escape') closeGallery();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGallery, handleGalleryPrev, handleGalleryNext, closeGallery]);

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
          className="fixed inset-0 top-0 md:top-[72px] z-50 md:z-40 bg-background flex flex-col overscroll-contain"
          onClick={closeGallery}
          style={{ touchAction: 'manipulation' }}
        >
          {/* Main image area */}
          <div className="flex-1 flex items-center justify-center relative">
            {/* Top bar */}
            <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-4 md:px-6 py-3 bg-gradient-to-b from-background/90 to-transparent">
              <button
                onClick={closeGallery}
                aria-label="Cerrar galería"
                className="flex items-center gap-1.5 text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg px-2 py-1.5 -ml-2"
                style={{ touchAction: 'manipulation' }}
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Volver</span>
              </button>

              <span className="text-sm font-medium text-muted-foreground tabular-nums">
                {galleryIndex + 1} / {galleryImages.length}
              </span>

              <button
                onClick={closeGallery}
                aria-label="Cerrar galería"
                className="flex h-9 w-9 items-center justify-center text-foreground/60 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
              >
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>

            {/* Image container with swipe support — preloads ±2 adjacent images */}
            <div
              className="relative max-w-[92vw] md:max-w-[85vw] max-h-[65vh] md:max-h-[60vh] flex items-center justify-center mt-10 mb-2"
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
              {galleryImages.map((img, index) => {
                if (!preloadedIndices.has(index)) return null;
                const isCurrent = index === galleryIndex;
                return (
                  <Image
                    key={index}
                    src={img}
                    alt={getPhotoAlt(index)}
                    width={1200}
                    height={900}
                    sizes="90vw"
                    className={`max-w-full max-h-[65vh] md:max-h-[60vh] object-contain select-none rounded-xl transition-opacity duration-200 ${
                      isCurrent
                        ? "relative opacity-100"
                        : "absolute inset-0 m-auto opacity-0 pointer-events-none"
                    }`}
                    priority={isCurrent}
                    draggable={false}
                  />
                );
              })}

              {/* Previous arrow — inside image container */}
              <button
                onClick={(e) => { e.stopPropagation(); handleGalleryPrev(); }}
                aria-label="Foto anterior"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center z-10 transition-all hover:bg-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                style={{ touchAction: 'manipulation' }}
              >
                <ChevronLeft className="h-5 w-5 text-neutral-700" />
              </button>

              {/* Next arrow — inside image container */}
              <button
                onClick={(e) => { e.stopPropagation(); handleGalleryNext(); }}
                aria-label="Foto siguiente"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center z-10 transition-all hover:bg-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                style={{ touchAction: 'manipulation' }}
              >
                <ChevronRight className="h-5 w-5 text-neutral-700" />
              </button>
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="flex items-center gap-1.5 md:gap-2 border-t border-border px-2 py-3 md:py-4">
            <button
              onClick={(e) => { e.stopPropagation(); thumbnailStripRef.current?.scrollBy({ left: -200, behavior: 'smooth' }); }}
              aria-label="Desplazar miniaturas a la izquierda"
              className="hidden md:flex flex-shrink-0 h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <div ref={thumbnailStripRef} className="flex gap-1.5 md:gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1 px-1 md:px-0">
              {galleryImages.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setGalleryIndex(index); }}
                  aria-label={`Ver foto ${index + 1}`}
                  className={`flex-shrink-0 w-12 h-9 md:w-16 md:h-12 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
                    index === galleryIndex ? 'border-primary opacity-100' : 'border-transparent opacity-50 hover:opacity-75'
                  }`}
                  style={{ touchAction: 'manipulation' }}
                >
                  <Image src={img} alt={getPhotoAlt(index)} fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); thumbnailStripRef.current?.scrollBy({ left: 200, behavior: 'smooth' }); }}
              aria-label="Desplazar miniaturas a la derecha"
              className="hidden md:flex flex-shrink-0 h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>
      )}
      {/* Global Header - Shows on all pages including mobile */}
      <Header />

      {/* Desktop Sub-header spacer removed — Guardar/Compartir moved inline with location */}

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
                  <div
                    className="aspect-[4/3] relative cursor-pointer"
                    onClick={() => { setGalleryIndex(index); setShowGallery(true); }}
                  >
                    <Image
                      src={image}
                      alt={getPhotoAlt(index)}
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

          {/* Photo counter */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-4 right-4 z-10 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
              {currentSlide + 1} / {galleryImages.length}
            </div>
          )}

          {/* Publisher Badge - Bottom left */}
          <div className="absolute bottom-4 left-4 z-10">
            <Popover open={badgeTooltipOpen} onOpenChange={setBadgeTooltipOpen}>
              <PopoverAnchor asChild>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-background/95 text-primary shadow-sm">
                  {publisherConfig.showCheckmark && <BadgeCheck className="h-3.5 w-3.5" />}
                  <span className="cursor-pointer" onClick={() => setBadgeTooltipOpen(v => !v)}>{publisherConfig.label}</span>
                  <button type="button" aria-label="Más información" className="inline-flex items-center justify-center text-primary/60 hover:text-primary touch-manipulation" onClick={() => setBadgeTooltipOpen(v => !v)}>
                    <Info className="h-[13px] w-[13px]" />
                  </button>
                </span>
              </PopoverAnchor>
              <PopoverContent side="bottom" align="start" className="max-w-[260px] text-xs leading-relaxed whitespace-pre-line px-3 py-2">
                {publisherConfig.tooltipText}
              </PopoverContent>
            </Popover>
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
        {/* Verification Banner - Desktop */}
        {showVerificationBanner && (
          <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
            <Shield className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-amber-800 text-sm">
                Tu propiedad no es visible en las búsquedas
              </p>
              <p className="text-amber-700 text-sm mt-0.5">
                Verificá tu identidad para que otros usuarios puedan encontrarla.
              </p>
            </div>
            {!showVerificationModal && (
              <Link
                href="/verificate"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Verificar
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}

        {/* Title - Desktop */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">
              {property.propertyType ? `${property.propertyType} en ${property.address}` : property.address}
            </h1>
            {user?.publicUserId && user.publicUserId === ownerId && propPropertyId && (
              <Link
                href={`/gestion/propiedad/${propPropertyId}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors whitespace-nowrap"
              >
                <Settings2 className="h-3.5 w-3.5" />
                Ir a gestionar
              </Link>
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {property.address}, {locationSuffix}
            </p>
            <div className="hidden md:flex items-center gap-4">
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

        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-xl overflow-hidden mb-6 h-[400px]">
          <div className="col-span-2 row-span-2 relative cursor-pointer" onClick={() => { setGalleryIndex(0); setShowGallery(true); }}>
            <Image
              src={galleryImages[0] || property.image}
              alt={getPhotoAlt(0)}
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
                alt={getPhotoAlt(index + 1)}
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

      {/* Verification Banner - Mobile */}
      {showVerificationBanner && (
        <div className="md:hidden mx-4 mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-amber-800 text-sm">
                Tu propiedad no es visible en las búsquedas
              </p>
              <p className="text-amber-700 text-sm mt-0.5">
                Verificá tu identidad para que otros usuarios puedan encontrarla.
              </p>
            </div>
          </div>
          {!showVerificationModal && (
            <Link
              href="/verificate"
              className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
            >
              Verificar mi identidad
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}

      {/* Mobile Content */}
      <div className="md:hidden pb-6">
        {/* Property Info Block */}
        <div className="px-4 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-foreground mb-1">
              {property.propertyType ? `${property.propertyType} en ${property.address}` : property.address}
            </h1>
            {user?.publicUserId && user.publicUserId === ownerId && propPropertyId && (
              <Link
                href={`/gestion/propiedad/${propPropertyId}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
              >
                <Settings2 className="h-3.5 w-3.5" />
                Gestionar
              </Link>
            )}
          </div>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {property.address}, {property.neighborhood}
          </p>
        </div>

        {/* Price + CTA Block - Priority section */}
        <div ref={mainCtaRef} className="px-4 py-5 bg-secondary/30 border-b border-border scroll-mt-20">
          {isUnavailable ? (
            <div className="rounded-xl border border-border bg-background p-5 text-center space-y-2">
              <Info className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="font-display text-lg font-bold text-foreground">Propiedad no disponible</p>
              <p className="text-sm text-muted-foreground">
                Esta propiedad ya no se encuentra disponible para alquiler.
              </p>
            </div>
          ) : (<>
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

          {!isCurrentUserOwner && propPropertyId && (
            <div className="mt-5">
              {showSchedulePicker && visitDays && visitHours ? (
                <VisitLeadForm
                  propertyId={propPropertyId}
                  propertyAddress={property?.address || ""}
                  visitDays={visitDays}
                  visitHours={visitHours}
                />
              ) : (
                <LeadForm
                  type={leadFormType}
                  propertyId={propPropertyId}
                  propertyAddress={property?.address || ""}
                  inmobiliariaPhone={isTokko ? (contactPhone ?? undefined) : undefined}
                  propertyPlan={propertyPlan}
                  isInmobiliaria={isInmobiliaria}
                  submitEventName={'agendar_visita_submit'}
                />
              )}
            </div>
          )}
          </>)}

        </div>

        {/* Características */}
        {(() => {
          const chars: { Icon: typeof Home; label: string }[] = [];
          if (suiteAmount != null) chars.push({ Icon: Bed, label: `${suiteAmount} ${suiteAmount === 1 ? 'dormitorio' : 'dormitorios'}` });
          if (property.rooms != null) chars.push({ Icon: Home, label: `${property.rooms} ${property.rooms === 1 ? 'ambiente' : 'ambientes'}` });
          if (property.bathrooms != null) chars.push({ Icon: Bath, label: `${property.bathrooms} ${property.bathrooms === 1 ? 'baño' : 'baños'}` });
          if (toiletAmount != null && toiletAmount > 0) chars.push({ Icon: Toilet, label: `${toiletAmount} ${toiletAmount === 1 ? 'toilette' : 'toilettes'}` });
          if (property.parking != null) {
            if (property.parking > 0) chars.push({ Icon: Car, label: `${property.parking} ${property.parking === 1 ? 'cochera' : 'cocheras'}` });
            else chars.push({ Icon: Car, label: 'Sin cochera' });
          }
          if (property.surface != null) chars.push({ Icon: Square, label: `${property.surface} m² totales` });
          if (roofedSurface != null) chars.push({ Icon: Square, label: `${roofedSurface} m² cubiertos` });
          if (publicationDate) {
            const days = Math.floor((Date.now() - new Date(publicationDate).getTime()) / 86400000);
            chars.push({ Icon: Clock, label: days === 0 ? "Publicado hoy" : days === 1 ? "Publicado hace 1 día" : `Publicado hace ${days} días` });
          }
          if (propAge != null) chars.push({ Icon: Calendar, label: propAge === 0 ? "A estrenar" : `${propAge} ${propAge === 1 ? "año" : "años"} de antigüedad` });
          if (orientation) chars.push({ Icon: Compass, label: `Orientación ${orientation}` });
          if (amoblado != null) chars.push({ Icon: Armchair, label: amoblado ? "Amoblado" : "No amoblado" });
          return chars.length > 0 ? (
            <div className="px-4 py-5 border-b border-border">
              <h2 className="font-display text-lg font-bold text-foreground mb-4">
                Características
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                {chars.map((char, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <char.Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-sm text-foreground">{char.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()}

        {/* About Section */}
        {description && (
          <div className="px-4 py-5 border-b border-border">
            <h2 className="font-display text-lg font-bold text-foreground mb-3">
              Descripción
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

        {/* Contrato Section */}
        {(ipcAdjustment || contractDuration) && (
          <div className="px-4 py-5 border-b border-border">
            <h2 className="font-display text-lg font-bold text-foreground mb-3">
              Contrato
            </h2>
            <div className="space-y-3">
              {contractDuration && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duración</p>
                    <p className="text-sm font-medium text-foreground">
                      {contractDuration >= 12 && contractDuration % 12 === 0
                        ? `${contractDuration / 12} ${contractDuration / 12 === 1 ? "año" : "años"}`
                        : `${contractDuration} meses`}
                    </p>
                  </div>
                </div>
              )}
              {ipcAdjustment && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Settings2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      Ajuste por
                      <InfoTooltip text="El Índice de Precios al Consumidor (IPC) permite ajustar el alquiler periódicamente según la inflación publicada por el INDEC." size={13} />
                    </p>
                    <p className="text-sm font-medium text-foreground">IPC</p>
                  </div>
                </div>
              )}
              {ipcAdjustment && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Actualización</p>
                    <p className="text-sm font-medium text-foreground capitalize">{ipcAdjustment}</p>
                  </div>
                </div>
              )}
            </div>
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
            {propertyPlan === "experiencia" && (
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Experiencia <span className="font-ubuntu">mob</span>
                </span>
              </div>
            )}
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
                  <p className="font-semibold text-base text-foreground">{isTokko ? "Solicitud de visita" : showSchedulePicker ? "Coordinación directa" : "Consulta directa"}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{isTokko ? "Envíamos tu consulta a la inmobiliaria." : showSchedulePicker ? "Sincronizamos tu agenda con la del dueño." : "Enviamos tu consulta al propietario."}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-background rounded-xl p-4 border border-border/50">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-base text-foreground"><GarantiaTooltip>Garantía con 50% off</GarantiaTooltip></p>
                  <p className="text-sm text-muted-foreground mt-0.5">Te verificás y accedés a <span className="font-semibold text-foreground">garantía 50% off</span></p>
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
            <Popover open={publisherTooltipOpen} onOpenChange={setPublisherTooltipOpen}>
              <PopoverAnchor asChild>
                <div className="flex items-center gap-3 mb-4">
                  {publisherLogo ? (
                    <div className="h-14 w-14 rounded-lg bg-white border border-border flex items-center justify-center overflow-hidden shrink-0">
                      <Image
                        src={publisherLogo}
                        alt={publisherName}
                        width={56}
                        height={56}
                        className="max-h-full max-w-full object-contain cursor-pointer"
                        onClick={() => setPublisherTooltipOpen(v => !v)}
                      />
                    </div>
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <User className="h-7 w-7 text-muted-foreground cursor-pointer" onClick={() => setPublisherTooltipOpen(v => !v)} />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-foreground w-fit cursor-pointer" onClick={() => setPublisherTooltipOpen(v => !v)}>{publisherName}</p>
                    <p className={`text-xs font-semibold flex items-center gap-1 mt-0.5 ${publisherSubtitleColor}`}>
                      <span className="inline-flex items-center gap-1 cursor-pointer" onClick={() => setPublisherTooltipOpen(v => !v)}>
                        {publisherConfig.showCheckmark && <BadgeCheck className="h-3.5 w-3.5" />}
                        {publisherConfig.label}
                      </span>
                      <button type="button" aria-label="Más información" className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground touch-manipulation" onClick={() => setPublisherTooltipOpen(v => !v)}>
                        <Info className="h-[13px] w-[13px]" />
                      </button>
                    </p>
                  </div>
                </div>
              </PopoverAnchor>
              <PopoverContent side="bottom" align="center" className="max-w-[260px] text-xs leading-relaxed whitespace-pre-line px-3 py-2">
                {publisherConfig.tooltipText}
              </PopoverContent>
            </Popover>
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
          showBottomBar && !isUnavailable && !isCurrentUserOwner ? "translate-y-0" : "translate-y-full"
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
              onClick={() => mainCtaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
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
            {/* Características */}
            {(() => {
              const chars: { Icon: typeof Home; label: string }[] = [];
              if (suiteAmount != null) chars.push({ Icon: Bed, label: `${suiteAmount} ${suiteAmount === 1 ? 'dormitorio' : 'dormitorios'}` });
              if (property.rooms != null) chars.push({ Icon: Home, label: `${property.rooms} ${property.rooms === 1 ? 'ambiente' : 'ambientes'}` });
              if (property.bathrooms != null) chars.push({ Icon: Bath, label: `${property.bathrooms} ${property.bathrooms === 1 ? 'baño' : 'baños'}` });
              if (toiletAmount != null && toiletAmount > 0) chars.push({ Icon: Toilet, label: `${toiletAmount} ${toiletAmount === 1 ? 'toilette' : 'toilettes'}` });
              if (property.parking != null) {
                if (property.parking > 0) chars.push({ Icon: Car, label: `${property.parking} ${property.parking === 1 ? 'cochera' : 'cocheras'}` });
                else chars.push({ Icon: Car, label: 'Sin cochera' });
              }
              if (property.surface != null) chars.push({ Icon: Square, label: `${property.surface} m² totales` });
              if (roofedSurface != null) chars.push({ Icon: Square, label: `${roofedSurface} m² cubiertos` });
              if (publicationDate) {
                const days = Math.floor((Date.now() - new Date(publicationDate).getTime()) / 86400000);
                chars.push({ Icon: Clock, label: days === 0 ? "Publicado hoy" : days === 1 ? "Publicado hace 1 día" : `Publicado hace ${days} días` });
              }
              if (propAge != null) chars.push({ Icon: Calendar, label: propAge === 0 ? "A estrenar" : `${propAge} ${propAge === 1 ? "año" : "años"} de antigüedad` });
              if (orientation) chars.push({ Icon: Compass, label: `Orientación ${orientation}` });
              if (amoblado != null) chars.push({ Icon: Armchair, label: amoblado ? "Amoblado" : "No amoblado" });
              return (
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground mb-4">
                    Características
                  </h2>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                    {chars.map((char, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <char.Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                        <span className="text-sm text-foreground">{char.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* About */}
            {description && (
              <>
                <hr className="border-border" />
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground mb-3">
                    Descripción
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

            {/* Contrato */}
            {(ipcAdjustment || contractDuration) && (
              <>
                <hr className="border-border" />
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground mb-3">
                    Contrato
                  </h2>
                  <div className="flex gap-8">
                    {contractDuration && (
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Duración</p>
                          <p className="text-sm font-medium text-foreground">
                            {contractDuration >= 12 && contractDuration % 12 === 0
                              ? `${contractDuration / 12} ${contractDuration / 12 === 1 ? "año" : "años"}`
                              : `${contractDuration} meses`}
                          </p>
                        </div>
                      </div>
                    )}
                    {ipcAdjustment && (
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Settings2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            Ajuste por
                            <InfoTooltip text="El Índice de Precios al Consumidor (IPC) permite ajustar el alquiler periódicamente según la inflación publicada por el INDEC." size={13} />
                          </p>
                          <p className="text-sm font-medium text-foreground">IPC</p>
                        </div>
                      </div>
                    )}
                    {ipcAdjustment && (
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Actualización</p>
                          <p className="text-sm font-medium text-foreground capitalize">{ipcAdjustment}</p>
                        </div>
                      </div>
                    )}
                  </div>
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
              {isUnavailable ? (
                <div className="rounded-xl border border-border bg-secondary/30 p-5 text-center space-y-2">
                  <Info className="h-10 w-10 text-muted-foreground mx-auto" />
                  <p className="font-display text-lg font-bold text-foreground">Propiedad no disponible</p>
                  <p className="text-sm text-muted-foreground">
                    Esta propiedad ya no se encuentra disponible para alquiler.
                  </p>
                </div>
              ) : (<>
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

                {!isCurrentUserOwner && propPropertyId && (
                  <div className="mt-5">
                    {showSchedulePicker && visitDays && visitHours ? (
                      <VisitLeadForm
                        propertyId={propPropertyId}
                        propertyAddress={property?.address || ""}
                        visitDays={visitDays}
                        visitHours={visitHours}
                      />
                    ) : (
                      <LeadForm
                        type={leadFormType}
                        propertyId={propPropertyId}
                        propertyAddress={property?.address || ""}
                        inmobiliariaPhone={isTokko ? (contactPhone ?? undefined) : undefined}
                        propertyPlan={propertyPlan}
                        isInmobiliaria={isInmobiliaria}
                        submitEventName={'agendar_visita_submit'}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Trust Elements */}
              <div className="space-y-3 pt-4 border-t border-border">
                {propertyPlan === "experiencia" && (
                  <div className="flex justify-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold">
                      <CheckCircle className="h-3 w-3" />
                      Experiencia <span className="font-ubuntu">mob</span>
                    </span>
                  </div>
                )}
                <div className="flex gap-2.5">
                  <Shield className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-xs text-foreground">Alquiler Seguro mob</p>
                    <p className="text-xs text-muted-foreground leading-snug">Contrato y firma 100% online.</p>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <Calendar className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-xs text-foreground">{isTokko ? "Solicitud de visita" : showSchedulePicker ? "Coordinación directa" : "Consulta directa"}</p>
                    <p className="text-xs text-muted-foreground leading-snug">{isTokko ? "Envíamos tu consulta a la inmobiliaria." : showSchedulePicker ? "Sincronizamos tu agenda con la del dueño." : "Enviamos tu consulta al propietario."}</p>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-xs text-foreground"><GarantiaTooltip>Garantía con 50% off</GarantiaTooltip></p>
                    <p className="text-xs text-muted-foreground leading-snug">Te verificás y accedés a <span className="font-semibold text-foreground">garantía 50% off</span></p>
                  </div>
                </div>
                
                <p className="text-[10px] text-center text-muted-foreground tracking-wider pt-2">
                  Tus datos están protegidos por <span className="font-ubuntu">mob</span>
                </p>
              </div>

              </>)}

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
      
      {relatedProperties && relatedProperties.length > 0 && (
        <section className="container py-10 md:py-14">
          <h2 className="text-xl font-semibold mb-6">Propiedades similares</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {relatedProperties.map((rp) => (
              <PropertyCard key={rp.id} property={rp} />
            ))}
          </div>
        </section>
      )}

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
          <Link href="/alquileres" className="hover:text-foreground">Buscar</Link>
          <Link href="/subir-propiedad" className="hover:text-foreground">Publicar</Link>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-4">
          © 2024 <span className="font-ubuntu">mob</span>. Todos los derechos reservados.
        </p>
      </div>
    </div>
    {showVerificationModal && !verificationModalDismissed ? (
      <VerificationSuccessModal
        open
        onOpenChange={() => setVerificationModalDismissed(true)}
      />
    ) : showVerificationBanner && !verificationModalDismissed && (
      <VerificationRequiredDialog />
    )}
    </GoogleMapsProvider>
  );
};

export default PropertyDetail;