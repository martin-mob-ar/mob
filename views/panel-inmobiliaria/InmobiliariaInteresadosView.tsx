import { useState } from "react";
import { 
  User, 
  Filter, 
  Building2,
  Briefcase,
  DollarSign,
  Clock,
  ChevronRight,
  Users,
  AlertCircle,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { agencyInterestedParties } from "@/data/interestedParties";
import { leadStageConfig } from "@/contexts/MockUserContext";
import AgencyLeadCard from "@/components/leads/AgencyLeadCard";
import ContextualAlert from "@/components/leads/ContextualAlert";

const InmobiliariaInteresadosView = () => {
  const [stageFilter, setStageFilter] = useState("todos");
  const [propertyFilter, setPropertyFilter] = useState("todas");

  // Filter leads
  const filteredLeads = agencyInterestedParties.filter(lead => {
    if (stageFilter !== "todos" && lead.leadStage !== stageFilter) return false;
    if (propertyFilter !== "todas" && !lead.properties?.some(p => p.id === propertyFilter)) return false;
    return true;
  });

  // Stats
  const totalCount = agencyInterestedParties.length;
  const qualifiedCount = agencyInterestedParties.filter(p => p.leadStage === "calificado").length;
  const verifiedCount = agencyInterestedParties.filter(p => 
    p.leadStage === "verificado" || p.leadStage === "en_seguimiento" || p.leadStage === "calificado"
  ).length;
  const pendingResponseCount = agencyInterestedParties.filter(p => p.pendingResponse).length;
  const highProbabilityCount = agencyInterestedParties.filter(p => p.highCloseProbability).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Interesados</h1>
          <p className="text-muted-foreground mt-1">
            Gestión de todos los leads interesados en tus propiedades
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="sin_verificar">Sin verificar</SelectItem>
              <SelectItem value="verificado">Verificado</SelectItem>
              <SelectItem value="en_seguimiento">En seguimiento</SelectItem>
              <SelectItem value="calificado">Calificado</SelectItem>
              <SelectItem value="no_avanza">No avanza</SelectItem>
            </SelectContent>
          </Select>
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filtrar por propiedad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las propiedades</SelectItem>
              <SelectItem value="2">Piso Exclusivo Recoleta</SelectItem>
              <SelectItem value="3">Estudio Moderno Belgrano</SelectItem>
              <SelectItem value="6">Monoambiente Núñez</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            <p className="text-xs uppercase tracking-wider">Total</p>
          </div>
          <p className="font-display font-bold text-2xl">{totalCount}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 text-primary mb-1">
            <User className="h-4 w-4" />
            <p className="text-xs uppercase tracking-wider">Verificados</p>
          </div>
          <p className="font-display font-bold text-2xl text-primary">{verifiedCount}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <Star className="h-4 w-4" />
            <p className="text-xs uppercase tracking-wider">Calificados</p>
          </div>
          <p className="font-display font-bold text-2xl text-green-600">{qualifiedCount}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <AlertCircle className="h-4 w-4" />
            <p className="text-xs uppercase tracking-wider">Pendientes</p>
          </div>
          <p className="font-display font-bold text-2xl text-amber-600">{pendingResponseCount}</p>
        </div>
      </div>

      {/* Contextual alerts */}
      {pendingResponseCount > 0 && (
        <ContextualAlert type="pending_decision" count={pendingResponseCount} />
      )}

      {/* Lead cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredLeads.length} interesado{filteredLeads.length !== 1 ? "s" : ""}
          </p>
        </div>

        {filteredLeads.length > 0 ? (
          <div className="grid gap-4">
            {filteredLeads.map((lead) => (
              <AgencyLeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg">No hay interesados con estos filtros</h3>
            <p className="text-muted-foreground mt-2">
              Probá cambiando los filtros para ver más resultados
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InmobiliariaInteresadosView;
