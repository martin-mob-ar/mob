"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InterestedParty } from "@/data/interestedParties";
import { leadStageConfig, LeadStage } from "@/contexts/MockUserContext";
import ContactModal from "./ContactModal";
import ReminderModal from "./ReminderModal";
import { 
  User, 
  MessageCircle, 
  Bell, 
  MoreHorizontal,
  FileText,
  CheckCircle2,
  Calendar,
  Building2,
  Briefcase,
  DollarSign,
  Clock,
  AlertCircle,
  Star,
  ChevronRight,
  XCircle,
  UserCheck,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface AgencyLeadCardProps {
  lead: InterestedParty;
}

const AgencyLeadCard = ({ lead }: AgencyLeadCardProps) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const stageConfig = leadStageConfig[lead.leadStage];

  const handleChangeStatus = (newStage: LeadStage) => {
    toast.success(`Estado actualizado`, {
      description: `${lead.name} ahora está: ${leadStageConfig[newStage].label}`,
    });
  };

  const handleRequestAction = (action: string) => {
    toast.success(`Solicitud enviada a ${lead.name}`, {
      description: action,
    });
  };

  const handleDiscard = () => {
    toast.success(`Interesado descartado`, {
      description: `${lead.name} fue removido de la lista`,
    });
  };

  return (
    <>
      <div className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-all">
        <div className="flex flex-col gap-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            {/* Avatar and basic info */}
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold">{lead.name}</h4>
                  {lead.age && (
                    <span className="text-sm text-muted-foreground">{lead.age} años</span>
                  )}
                </div>
                
                {/* Stage Badge */}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stageConfig.className}`}>
                    {stageConfig.label}
                  </span>
                  {lead.pendingResponse && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600">
                      <AlertCircle className="h-3 w-3" />
                      Pendiente de respuesta
                    </span>
                  )}
                  {lead.highCloseProbability && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                      <Star className="h-3 w-3" />
                      Alta probabilidad
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* More actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleRequestAction("Subir documentación")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Solicitar documentación
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRequestAction("Completar verificación")}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Completar verificación
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRequestAction("Confirmar disponibilidad")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Confirmar disponibilidad
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => handleChangeStatus("en_seguimiento")}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Marcar "En seguimiento"
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleChangeStatus("calificado")}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Marcar "Calificado"
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleChangeStatus("no_avanza")}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Marcar "No avanza"
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleDiscard}
                  className="text-destructive focus:text-destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Descartar interesado
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Properties */}
          {lead.properties && lead.properties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {lead.properties.map((prop) => (
                <Link
                  key={prop.id}
                  href={`/gestion-inmobiliaria/propiedad/${prop.id}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary text-sm hover:bg-secondary/80 transition-colors"
                >
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  {prop.name}
                </Link>
              ))}
            </div>
          )}

          {/* Details row */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            {lead.occupation && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {lead.occupation}
              </span>
            )}
            {lead.estimatedIncome && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                {lead.estimatedIncome}
              </span>
            )}
            {lead.lastContact && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Último contacto: {lead.lastContact}
              </span>
            )}
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Button 
              onClick={() => setShowContactModal(true)}
              className="rounded-full gap-2"
              size="sm"
            >
              <MessageCircle className="h-4 w-4" />
              Contactar
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowReminderModal(true)}
              className="rounded-full gap-2"
              size="sm"
            >
              <Bell className="h-4 w-4" />
              Enviar recordatorio
            </Button>
          </div>
        </div>
      </div>

      <ContactModal
        open={showContactModal}
        onOpenChange={setShowContactModal}
        leadName={lead.name}
        phone={lead.phone}
        email={lead.email}
      />
      
      <ReminderModal
        open={showReminderModal}
        onOpenChange={setShowReminderModal}
        leadName={lead.name}
      />
    </>
  );
};

export default AgencyLeadCard;
