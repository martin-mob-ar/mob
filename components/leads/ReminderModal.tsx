import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  CheckCircle2, 
  Calendar,
  Key,
  Send
} from "lucide-react";
import { toast } from "sonner";

interface ReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
}

const reminders = [
  { 
    id: "docs", 
    icon: FileText, 
    title: "Recordar subir documentación", 
    description: "Enviar recordatorio para completar documentos pendientes" 
  },
  { 
    id: "interest", 
    icon: CheckCircle2, 
    title: "Confirmar interés", 
    description: "Verificar si sigue interesado en la propiedad" 
  },
  { 
    id: "visit", 
    icon: Calendar, 
    title: "Recordar visita", 
    description: "Enviar recordatorio de la visita coordinada" 
  },
  { 
    id: "reserve", 
    icon: Key, 
    title: "Avanzar con reserva", 
    description: "Invitar a iniciar el proceso de reserva" 
  },
];

const ReminderModal = ({ open, onOpenChange, leadName }: ReminderModalProps) => {
  const handleSendReminder = (reminderTitle: string) => {
    toast.success(`Recordatorio enviado a ${leadName}`, {
      description: reminderTitle,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Enviar recordatorio a {leadName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2 pt-4">
          {reminders.map((reminder) => (
            <Button
              key={reminder.id}
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3 px-4 rounded-xl"
              onClick={() => handleSendReminder(reminder.title)}
            >
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <reminder.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="font-medium text-sm">{reminder.title}</p>
                <p className="text-xs text-muted-foreground">{reminder.description}</p>
              </div>
              <Send className="h-4 w-4 text-muted-foreground shrink-0" />
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderModal;
