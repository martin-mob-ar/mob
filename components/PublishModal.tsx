"use client";
import { Building2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PublishModal = ({ open, onOpenChange }: PublishModalProps) => {
  const router = useRouter();

  const handleSelect = (type: "inmobiliaria" | "propietario") => {
    onOpenChange(false);
    if (type === "propietario") {
      router.push("/propietarios");
    } else {
      router.push("/inmobiliarias");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <div className="space-y-4">
          <button
            onClick={() => handleSelect("inmobiliaria")}
            className="w-full p-6 rounded-2xl border border-border hover:border-primary/30 hover:bg-accent transition-all flex items-center gap-4 group"
          >
            <div className="icon-container">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <span className="font-display font-semibold text-lg">
              Soy inmobiliaria
            </span>
          </button>

          <button
            onClick={() => handleSelect("propietario")}
            className="w-full p-6 rounded-2xl border border-border hover:border-primary/30 hover:bg-accent transition-all flex items-center gap-4 group"
          >
            <div className="icon-container">
              <User className="h-6 w-6 text-primary" />
            </div>
            <span className="font-display font-semibold text-lg">
              Soy propietario
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PublishModal;
