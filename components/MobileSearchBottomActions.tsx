import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileSearchBottomActionsProps {
  onAlertClick?: () => void;
  visible?: boolean;
}

const MobileSearchBottomActions = ({
  onAlertClick,
  visible = true,
}: MobileSearchBottomActionsProps) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4">
      <div className="flex justify-center max-w-xs mx-auto">
        <Button
          className="h-9 px-5 rounded-full text-xs font-medium gap-1.5"
          onClick={onAlertClick}
        >
          <Bell className="h-3.5 w-3.5" />
          Crear alerta
        </Button>
      </div>
    </div>
  );
};

export default MobileSearchBottomActions;
