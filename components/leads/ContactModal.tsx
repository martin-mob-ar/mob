import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Mail, 
  Phone,
  ExternalLink
} from "lucide-react";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
  phone?: string;
  email?: string;
}

const ContactModal = ({ open, onOpenChange, leadName, phone, email }: ContactModalProps) => {
  const handleWhatsApp = () => {
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${cleanPhone}`, "_blank");
    }
    onOpenChange(false);
  };

  const handleEmail = () => {
    if (email) {
      window.open(`mailto:${email}`, "_blank");
    }
    onOpenChange(false);
  };

  const handleCall = () => {
    if (phone) {
      window.open(`tel:${phone}`, "_blank");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Contactar a {leadName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 pt-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-14 rounded-xl"
            onClick={handleWhatsApp}
          >
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium">WhatsApp</p>
              <p className="text-sm text-muted-foreground">{phone || "No disponible"}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-14 rounded-xl"
            onClick={handleEmail}
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground truncate">{email || "No disponible"}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-14 rounded-xl"
            onClick={handleCall}
          >
            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium">Llamar</p>
              <p className="text-sm text-muted-foreground">{phone || "No disponible"}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
