import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, X, TrendingUp, ChevronLeft, ChevronRight, ChevronsUpDown, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  hipotecarios,
  BANCOS_DISPONIBLES,
  DESTINOS,
  TIPOS_CREDITO,
} from "@/data/hipotecarios";
import HipotecarioCard from "@/components/hipotecarios/HipotecarioCard";
import HipotecarioEducativo from "@/components/hipotecarios/HipotecarioEducativo";
import CalculadoraHipotecaria from "@/components/hipotecarios/CalculadoraHipotecaria";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PER_PAGE = 8;

const BANCOS_DESTACADOS = [
  "Banco de la Nación Argentina",
  "Banco Galicia",
  "Banco Santander Argentina",
  "Banco BBVA Argentina",
  "Banco Macro",
  "Banco de la Provincia de Buenos Aires",
  "Banco ICBC",
  "Banco Hipotecario",
  "Banco de la Ciudad de Buenos Aires",
  "Banco Credicoop",
].filter((b) => BANCOS_DISPONIBLES.includes(b));

const BANCOS_RESTO = BANCOS_DISPONIBLES
  .filter((b) => !BANCOS_DESTACADOS.includes(b))
  .sort((a, b) => a.localeCompare(b, "es"));

export default function CreditosHipotecarios() {
  const [destino, setDestino] = useState("Todos");
  const [banco, setBanco] = useState("Todos");
  const [tipo, setTipo] = useState("Todos");
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.title =
      "Créditos Hipotecarios en Argentina 2025 – Compará préstamos UVA y en pesos | MOB";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Compará créditos hipotecarios de bancos argentinos: tasas UVA y en pesos, montos financiables, plazos y requisitos. Filtrá por destino, entidad y modalidad para encontrar el préstamo hipotecario ideal para tu vivienda."
      );
    }
  }, []);

  const filtered = useMemo(() => {
    return hipotecarios.filter((h) => {
      if (destino !== "Todos" && h.destino !== destino) return false;
      if (banco !== "Todos" && h.banco !== banco) return false;
      if (tipo !== "Todos" && h.tipo_credito !== tipo) return false;
      return true;
    });
  }, [destino, banco, tipo]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [destino, banco, tipo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const hasFilters = destino !== "Todos" || banco !== "Todos" || tipo !== "Todos";

  const clearFilters = () => {
    setDestino("Todos");
    setBanco("Todos");
    setTipo("Todos");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/3" />
        <div className="relative max-w-6xl mx-auto px-4 pt-24 pb-12 sm:pt-32 sm:pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-6">
            <TrendingUp className="h-3.5 w-3.5" />
            Tasas hipotecarias actualizadas · Bancos públicos y privados
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight mb-4">
            Créditos hipotecarios en Argentina
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-3 leading-relaxed">
            Compará préstamos hipotecarios UVA y en pesos de los principales bancos argentinos.
            Revisá tasas, montos financiables, plazos y condiciones crediticias en un solo lugar.
          </p>
          <p className="text-muted-foreground/60 text-sm">
            Filtrá por destino del financiamiento, entidad bancaria y modalidad (UVA o pesos)
          </p>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 pb-20">
        {/* Calculator */}
        <CalculadoraHipotecaria />

        {/* Filters */}
        <Card className="border-border/40 bg-card mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Comparar créditos hipotecarios</CardTitle>
            </div>
            <CardDescription>
              Ajustá los filtros para encontrar el préstamo para vivienda que mejor se adapte a tu perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Destino del financiamiento
                </label>
                <Select value={destino} onValueChange={setDestino}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DESTINOS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Entidad bancaria
                </label>
                <BancoCombobox value={banco} onChange={setBanco} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Modalidad del préstamo
                </label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_CREDITO.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 text-xs text-muted-foreground hover:text-foreground"
                onClick={clearFilters}
              >
                <X className="h-3 w-3 mr-1" />
                Restablecer filtros
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {filtered.length === 1 ? "Se encontró" : "Se encontraron"}{" "}
            <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "préstamo hipotecario" : "préstamos hipotecarios"}
            {totalPages > 1 && (
              <span className="text-muted-foreground/60"> · Página {page} de {totalPages}</span>
            )}
          </p>
          {hasFilters && (
            <div className="flex gap-1.5 flex-wrap">
              {destino !== "Todos" && (
                <Badge variant="secondary" className="text-[10px]">{destino}</Badge>
              )}
              {banco !== "Todos" && (
                <Badge variant="secondary" className="text-[10px]">{banco}</Badge>
              )}
              {tipo !== "Todos" && (
                <Badge variant="secondary" className="text-[10px]">{tipo}</Badge>
              )}
            </div>
          )}
        </div>

        {/* Results grid */}
        {paged.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {paged.map((oferta) => (
                <HipotecarioCard key={oferta.id} oferta={oferta} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-12">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    // Show first, last, current, and neighbors
                    const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
                    const showEllipsis = !show && (p === 2 || p === totalPages - 1);
                    if (showEllipsis) return <span key={p} className="px-1 text-muted-foreground">…</span>;
                    if (!show) return null;
                    return (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "ghost"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-border/20 bg-card">
            <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-foreground font-display font-semibold mb-2">
              No se encontraron préstamos hipotecarios
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              No hay créditos que coincidan con esos criterios. Probá ajustando los filtros para ver más opciones.
            </p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Ver todos los créditos
            </Button>
          </div>
        )}

        {/* Educational section */}
        <HipotecarioEducativo />
      </main>

      <Footer />
    </div>
  );
}

function BancoCombobox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{value === "Todos" ? "Todos los bancos" : value}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover z-50" align="start">
        <Command>
          <CommandInput placeholder="Buscar banco..." />
          <CommandList className="max-h-64">
            <CommandEmpty>No se encontró el banco.</CommandEmpty>
            <CommandGroup>
              <CommandItem value="Todos" onSelect={() => { onChange("Todos"); setOpen(false); }}>
                <Check className={cn("mr-2 h-4 w-4", value === "Todos" ? "opacity-100" : "opacity-0")} />
                Todos los bancos
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Principales">
              {BANCOS_DESTACADOS.map((b) => (
                <CommandItem key={b} value={b} onSelect={() => { onChange(b); setOpen(false); }}>
                  <Check className={cn("mr-2 h-4 w-4", value === b ? "opacity-100" : "opacity-0")} />
                  {b}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Otros bancos">
              {BANCOS_RESTO.map((b) => (
                <CommandItem key={b} value={b} onSelect={() => { onChange(b); setOpen(false); }}>
                  <Check className={cn("mr-2 h-4 w-4", value === b ? "opacity-100" : "opacity-0")} />
                  {b}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
