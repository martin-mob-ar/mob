import { Shield, Zap, Users, CheckCircle } from "lucide-react";

const badges = [
  { 
    text: "Proceso 100% digital", 
    icon: Zap, 
    isPrimary: true,
    description: "Todo el alquiler online, sin llamadas ni papeles"
  },
  { 
    text: "Inmobiliarias verificadas", 
    icon: Shield,
    isPrimary: false,
    suffix: "verificadas"
  },
  { 
    text: "Propiedades verificadas", 
    icon: CheckCircle,
    isPrimary: false,
    suffix: "verificadas"
  },
  { 
    text: "Inquilinos verificados", 
    icon: Users,
    isPrimary: false,
    suffix: "verificados"
  },
];

const TrustBadges = () => {
  const primaryBadge = badges.find(b => b.isPrimary);
  const secondaryBadges = badges.filter(b => !b.isPrimary);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Desktop Layout - Compact hierarchy */}
      <div className="hidden md:flex flex-col gap-3">
        {/* Primary Badge - Inline compact */}
        {primaryBadge && (
          <div className="flex items-center justify-center gap-2.5 px-5 py-3 bg-[hsl(var(--primary)/0.05)] rounded-xl">
            <primaryBadge.icon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">{primaryBadge.text}</span>
          </div>
        )}

        {/* Secondary Badges - Compact row, same width as primary */}
        <div className="flex items-center gap-2 w-full">
          {secondaryBadges.map((badge) => (
            <div 
              key={badge.text}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary/30 border border-border/50 rounded-lg"
            >
              <badge.icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Layout - 2x2 Grid with hierarchy */}
      <div className="md:hidden flex flex-col gap-3 px-2">
        {/* Primary Badge - Featured */}
        {primaryBadge && (
          <div className="flex items-center justify-center gap-2 p-4 bg-[hsl(var(--primary)/0.08)] rounded-2xl">
            <primaryBadge.icon className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">{primaryBadge.text}</span>
          </div>
        )}

        {/* Secondary Badges - Grid */}
        <div className="grid grid-cols-3 gap-2">
          {secondaryBadges.map((badge) => (
            <div 
              key={badge.text}
              className="flex flex-col items-center gap-1.5 p-3 bg-[hsl(var(--secondary)/0.5)] rounded-xl"
            >
              <badge.icon className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground text-center leading-tight">
                {badge.text.replace(" verificadas", "").replace(" verificados", "")}
                <span className="block text-[10px] text-muted-foreground">{badge.suffix}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;