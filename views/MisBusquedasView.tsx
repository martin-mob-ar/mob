"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Search, ChevronRight, ArrowLeft, Bed, Bath } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AnimateHeight } from "@/components/ui/animate-height";
import { useFavorites } from "@/contexts/FavoritesContext";

type PropertySnippet = {
  property_id: number;
  slug: string | null;
  address: string | null;
  location_name: string | null;
  price: number | null;
  secondary_price: number | null;
  expenses: number | null;
  currency: string | null;
  cover_photo_url: string | null;
  room_amount: number | null;
  suite_amount: number | null;
  bathroom_amount: number | null;
};

type FavoritoItem = {
  propertyId: number;
  savedAt: string | null;
  property: PropertySnippet;
};

type ConsultaItem = {
  leadId: number;
  propertyId: number;
  type: "visita" | "reserva";
  sentAt: string | null;
  property: PropertySnippet;
};

interface MisBusquedasViewProps {
  userName: string;
  favoritos: FavoritoItem[];
  consultas: ConsultaItem[];
}

function getPropertyUrl(slug: string | null, id: number) {
  if (slug) return `/propiedad/${slug}`;
  return `/propiedad/${id}`;
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem.`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} mes.`;
  return `Hace ${Math.floor(diffDays / 365)} año${Math.floor(diffDays / 365) > 1 ? "s" : ""}`;
}

function formatPrice(property: PropertySnippet): string {
  const { currency, price, secondary_price } = property;
  if (currency === "USD") {
    const base = secondary_price ?? price;
    return base ? `USD ${base.toLocaleString("es-AR")}` : "";
  }
  const total = price;
  return total ? `$${total.toLocaleString("es-AR")}` : "";
}

function PropertyCard({ property, href }: { property: PropertySnippet; href: string }) {
  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {/* Thumbnail */}
      <Link href={href} className="shrink-0">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-secondary">
          {property.cover_photo_url ? (
            <Image
              src={property.cover_photo_url}
              alt={property.address || "Propiedad"}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <Search className="h-5 w-5 text-muted-foreground/30" />
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link href={href}>
          <p className="text-sm font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
            {property.address || "Dirección no disponible"}
          </p>
        </Link>
        {property.location_name && (
          <p className="text-xs text-muted-foreground truncate">{property.location_name}</p>
        )}
        <p className="text-xs font-medium text-foreground mt-0.5">
          {formatPrice(property)}
          {property.expenses && property.expenses > 0 && (
            <span className="text-muted-foreground font-normal">
              {" "}+ ${property.expenses.toLocaleString("es-AR")} exp.
            </span>
          )}
        </p>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
          {property.suite_amount != null && (
            <span className="flex items-center gap-0.5">
              <Bed className="h-2.5 w-2.5" />
              {property.suite_amount}
            </span>
          )}
          {property.bathroom_amount != null && (
            <span className="flex items-center gap-0.5">
              <Bath className="h-2.5 w-2.5" />
              {property.bathroom_amount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function FavoritoCard({ item }: { item: FavoritoItem }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const href = getPropertyUrl(item.property.slug, item.propertyId);
  const favorited = isFavorite(item.propertyId);

  if (!favorited) return null; // Removed via optimistic update

  return (
    <div className="flex items-center gap-3 bg-background rounded-2xl p-3 shadow-sm border border-border/50">
      <PropertyCard property={item.property} href={href} />
      <div className="flex items-center gap-2 shrink-0 ml-1">
        <button
          onClick={() => toggleFavorite(item.propertyId)}
          aria-label="Quitar de favoritos"
          className="h-8 w-8 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors cursor-pointer"
        >
          <Heart className="h-4 w-4 fill-primary" />
        </button>
        <Link
          href={href}
          aria-label="Ver propiedad"
          className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function ConsultaCard({ item }: { item: ConsultaItem }) {
  const href = getPropertyUrl(item.property.slug, item.propertyId);

  return (
    <div className="flex items-center gap-3 bg-background rounded-2xl p-3 shadow-sm border border-border/50">
      <PropertyCard property={item.property} href={href} />
      <div className="flex flex-col items-end gap-1.5 shrink-0 ml-1">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            item.type === "visita"
              ? "bg-primary/10 text-primary"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {item.type === "visita" ? "Visita" : "Reserva"}
        </span>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {formatRelativeDate(item.sentAt)}
        </span>
        <Link
          href={href}
          aria-label="Ver propiedad"
          className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1 mb-5">{description}</p>
      <Link
        href="/buscar"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        <Search className="h-4 w-4" />
        Explorar propiedades
      </Link>
    </div>
  );
}

export default function MisBusquedasView({ userName, favoritos, consultas }: MisBusquedasViewProps) {
  const [tab, setTab] = useState<"favoritos" | "consultas">("favoritos");
  const { favorites } = useFavorites();

  // Reflect live favorite count from context (syncs with toggles done on this or other pages)
  const liveFavCount = favoritos.filter((f) => favorites.has(f.propertyId)).length;

  return (
    <div className="min-h-screen bg-secondary/40">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pt-8 pb-20">
        {/* Page header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Inicio
          </Link>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Hola, {userName.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Tus propiedades guardadas y consultas enviadas
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-background rounded-2xl p-1.5 border border-border/50 shadow-sm">
          <button
            onClick={() => setTab("favoritos")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              tab === "favoritos"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Heart className={`h-4 w-4 ${tab === "favoritos" ? "fill-primary-foreground" : ""}`} />
            Favoritos
            {liveFavCount > 0 && (
              <span
                className={`inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold ${
                  tab === "favoritos"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {liveFavCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("consultas")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              tab === "consultas"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            Consultas
            {consultas.length > 0 && (
              <span
                className={`inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold ${
                  tab === "consultas"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {consultas.length}
              </span>
            )}
          </button>
        </div>

        {/* Favoritos tab */}
        <AnimateHeight show={tab === "favoritos"}>
          <div className="space-y-2">
            {liveFavCount === 0 ? (
              <EmptyState
                icon={Heart}
                title="Aún no guardaste propiedades"
                description="Tocá el corazón en cualquier propiedad para guardarla aquí."
              />
            ) : (
              favoritos.map((item) => (
                <FavoritoCard key={item.propertyId} item={item} />
              ))
            )}
          </div>
        </AnimateHeight>

        {/* Consultas tab */}
        <AnimateHeight show={tab === "consultas"}>
          <div className="space-y-2">
            {consultas.length === 0 ? (
              <EmptyState
                icon={MessageCircle}
                title="Aún no enviaste consultas"
                description="Cuando contactes a un propietario, tu consulta aparecerá aquí."
              />
            ) : (
              consultas.map((item) => (
                <ConsultaCard key={item.leadId} item={item} />
              ))
            )}
          </div>
        </AnimateHeight>
      </main>

      <Footer />
    </div>
  );
}
