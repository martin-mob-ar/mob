import { LeadStage, leadStageConfig } from "@/contexts/MockUserContext";

interface LeadStageBadgeProps {
  stage: LeadStage;
  showStepper?: boolean;
}

const LeadStageBadge = ({ stage, showStepper = false }: LeadStageBadgeProps) => {
  const config = leadStageConfig[stage];
  const currentOrder = config.order;

  return (
    <div className="flex items-center gap-2">
      {/* Badge */}
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>

      {/* Mini stepper */}
      {showStepper && (
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                step <= currentOrder 
                  ? step === 0 ? "bg-muted-foreground" :
                    step === 1 ? "bg-primary" :
                    step === 2 ? "bg-violet-500" :
                    "bg-green-500"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadStageBadge;
