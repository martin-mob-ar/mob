import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InterestedParty } from "@/data/interestedParties";
import { leadStageConfig } from "@/contexts/MockUserContext";
import { 
  User, 
  CheckCircle2, 
  XCircle,
  Eye,
  MoreHorizontal,
  BadgeCheck,
  Briefcase,
  DollarSign,
  Calendar,
  FileText,
  Shield,
  Star
} from "lucide-react";
import { toast } from "sonner";

interface OwnerLeadCardProps {
  lead: InterestedParty;
}

const OwnerLeadCard = ({ lead }: OwnerLeadCardProps) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const stageConfig = leadStageConfig[lead.leadStage];
  const isVerified = lead.leadStage !== "sin_verificar" && lead.leadStage !== "no_avanza";

  const handleAccept = () => {
    toast.success(`¡Excelente elección!`, {
      description: `Avanzamos con ${lead.name} como inquilino`,
    });
  };

  const handleReject = () => {
    toast.success(`Interesado descartado`, {
      description: `${lead.name} fue removido de la lista`,
    });
  };

  const handleRequestInfo = (type: string) => {
    toast.success(`Información solicitada`, {
      description: `Pedimos ${type} a ${lead.name}`,
    });
  };

  return (
    <>
      <div className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-all">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center shrink-0 relative">
                <User className="h-6 w-6 text-muted-foreground" />
                {isVerified && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center border-2 border-card">
                    <BadgeCheck className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold">{lead.name}</h4>
                
                {/* Stage badge */}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stageConfig.className}`}>
                    {stageConfig.label}
                  </span>
                  {lead.highCloseProbability && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                      <Star className="h-3 w-3" />
                      Recomendado
                    </span>
                  )}
                </div>
                
                {/* Hoggax badge */}
                {isVerified && (
                  <div className="flex items-center gap-1.5 mt-2 text-sm text-primary">
                    <Shield className="h-3.5 w-3.5" />
                    <span className="font-medium">Verificado por Hoggax</span>
                  </div>
                )}
              </div>
            </div>

            {/* More actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleRequestInfo("Ingresos")}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pedir ingresos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRequestInfo("Garantía")}>
                  <Shield className="h-4 w-4 mr-2" />
                  Pedir garantía
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRequestInfo("Fecha de ingreso")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Pedir fecha de ingreso
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Profile summary */}
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
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Button 
              onClick={handleAccept}
              className="flex-1 rounded-full gap-2"
              size="sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              Aceptar interesado
            </Button>
            <Button 
              variant="outline"
              onClick={handleReject}
              className="rounded-full gap-2 text-muted-foreground hover:text-destructive hover:border-destructive"
              size="sm"
            >
              <XCircle className="h-4 w-4" />
              Descartar
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setShowProfileModal(true)}
              className="rounded-full"
              size="sm"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Perfil de {lead.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Avatar and name */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center relative">
                <User className="h-8 w-8 text-muted-foreground" />
                {isVerified && (
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center border-2 border-card">
                    <BadgeCheck className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{lead.name}</h3>
                {lead.age && <p className="text-muted-foreground">{lead.age} años</p>}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${stageConfig.className}`}>
                {stageConfig.label}
              </span>
              {isVerified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary">
                  <Shield className="h-4 w-4" />
                  Hoggax verificado
                </span>
              )}
            </div>

            {/* Details */}
            <div className="space-y-3 pt-2">
              {lead.occupation && (
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Ocupación
                  </span>
                  <span className="font-medium">{lead.occupation}</span>
                </div>
              )}
              {lead.estimatedIncome && (
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Ingreso estimado
                  </span>
                  <span className="font-medium">{lead.estimatedIncome}</span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de interés
                </span>
                <span className="font-medium">{lead.interestDate}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button onClick={handleAccept} className="flex-1 rounded-full">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Aceptar
              </Button>
              <Button variant="outline" onClick={handleReject} className="flex-1 rounded-full">
                <XCircle className="h-4 w-4 mr-2" />
                Descartar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OwnerLeadCard;
