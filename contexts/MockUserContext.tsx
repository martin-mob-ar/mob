import { createContext, useContext, useState, ReactNode } from "react";

// Lead stages for interested parties (not user profile)
export type LeadStage = 
  | "sin_verificar" 
  | "verificado" 
  | "en_seguimiento"
  | "calificado"
  | "no_avanza";

export const leadStageConfig: Record<LeadStage, { label: string; className: string; order: number }> = {
  sin_verificar: { 
    label: "Sin verificar", 
    className: "bg-muted text-muted-foreground", 
    order: 0 
  },
  verificado: { 
    label: "Verificado", 
    className: "bg-primary/10 text-primary", 
    order: 1 
  },
  en_seguimiento: { 
    label: "En seguimiento", 
    className: "bg-amber-500/10 text-amber-600", 
    order: 2 
  },
  calificado: { 
    label: "Calificado", 
    className: "bg-green-500/10 text-green-600", 
    order: 3 
  },
  no_avanza: { 
    label: "No avanza", 
    className: "bg-destructive/10 text-destructive", 
    order: -1 
  },
};

interface MockUserContextType {
  isVerified: boolean;
  setIsVerified: (value: boolean) => void;
  isAgencyOnboarded: boolean;
  setIsAgencyOnboarded: (value: boolean) => void;
}

const MockUserContext = createContext<MockUserContextType | undefined>(undefined);

export const MockUserProvider = ({ children }: { children: ReactNode }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isAgencyOnboarded, setIsAgencyOnboarded] = useState(false);

  return (
    <MockUserContext.Provider value={{ 
      isVerified, 
      setIsVerified,
      isAgencyOnboarded,
      setIsAgencyOnboarded
    }}>
      {children}
    </MockUserContext.Provider>
  );
};

export const useMockUser = () => {
  const context = useContext(MockUserContext);
  if (context === undefined) {
    throw new Error("useMockUser must be used within a MockUserProvider");
  }
  return context;
};
