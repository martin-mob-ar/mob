import { useState } from "react";
import { ChevronDown, ChevronUp, Building2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type HipotecarioOferta, formatMonto } from "@/data/hipotecarios";

interface Props {
  oferta: HipotecarioOferta;
}

export default function HipotecarioCard({ oferta }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border/30 bg-card/60 backdrop-blur-sm p-5 sm:p-6 transition-all hover:border-primary/30 hover:bg-card/80">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="h-5 w-5 text-primary shrink-0" />
            <h3 className="font-display font-semibold text-foreground text-base sm:text-lg truncate">
              {oferta.banco}
            </h3>
          </div>
        </div>
        <p className="text-xs text-muted-foreground truncate">{oferta.producto}</p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant="outline"
            className={`text-[10px] font-bold tracking-wide ${
              oferta.tipo_credito === "UVA"
                ? "border-primary/50 text-primary bg-primary/10"
                : "border-amber-500/50 text-amber-400 bg-amber-500/10"
            }`}
          >
            {oferta.tipo_credito}
          </Badge>
          <Badge variant="outline" className="text-[10px] border-border/50 text-muted-foreground">
            {oferta.destino}
          </Badge>
          <Badge variant="outline" className="text-[10px] border-border/50 text-muted-foreground">
            Tasa {oferta.tipo_tasa.toLowerCase()}
          </Badge>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <MetricBox label="Tasa nominal anual" value={`${oferta.tna}%`} highlight />
        <MetricBox label="Monto financiable" value={formatMonto(oferta.monto_max)} />
        <MetricBox label="Plazo del crédito" value={`${oferta.plazo_max_anios} años`} />
        <MetricBox
          label="Relación monto/tasación"
          value={oferta.ltv !== null ? `${oferta.ltv}%` : "Consultar"}
        />
      </div>

      {/* Beneficiarios */}
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
        <span className="font-medium text-foreground/80">Perfil crediticio:</span> {oferta.beneficiarios}
      </p>

      {/* Fecha */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 mb-3">
        <Calendar className="h-3 w-3" />
        <span>Datos vigentes al: {oferta.fecha_info}</span>
      </div>

      {/* Expand */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-xs text-primary hover:text-primary/80 hover:bg-primary/5"
        onClick={() => setOpen(!open)}
      >
        {open ? "Ocultar condiciones" : "Ver condiciones del préstamo"}
        {open ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
      </Button>

      {open && (
        <div className="mt-3 pt-3 border-t border-border/30 space-y-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-2 duration-200">
          <DetailRow label="Entidad bancaria" value={oferta.banco} />
          <DetailRow label="Línea de crédito" value={oferta.producto} />
          <DetailRow label="Modalidad" value={oferta.tipo_credito} />
          <DetailRow label="Tipo de tasa" value={oferta.tipo_tasa} />
          <DetailRow label="Tasa nominal anual (TNA)" value={`${oferta.tna}%`} />
          <DetailRow label="Monto financiable máximo" value={formatMonto(oferta.monto_max)} />
          <DetailRow label="Plazo máximo del crédito" value={`${oferta.plazo_max_anios} años`} />
          <DetailRow label="Relación monto/tasación (LTV)" value={oferta.ltv !== null ? `${oferta.ltv}%` : "Consultar"} />
          <DetailRow label="Destino del financiamiento" value={oferta.destino} />
          <DetailRow label="Edad máxima del solicitante" value={`${oferta.edad_max} años`} />
          <DetailRow label="Perfil crediticio requerido" value={oferta.beneficiarios} />
          <DetailRow label="Condiciones vigentes al" value={oferta.fecha_info} />
        </div>
      )}
    </div>
  );
}

function MetricBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl bg-background/40 border border-border/20 p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">
        {label}
      </p>
      <p
        className={`font-display font-bold text-sm sm:text-base ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground/70 text-xs">{label}</span>
      <span className="text-foreground text-xs text-right font-medium">{value}</span>
    </div>
  );
}
