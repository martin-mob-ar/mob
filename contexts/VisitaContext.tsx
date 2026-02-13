import { createContext, useContext, useState, ReactNode } from "react";

export type VisitaStep = 
  | "not_started"
  | "login"
  | "verificacion_intro"
  | "verificacion_identidad"
  | "verificacion_ingresos"
  | "verificacion_hoggax"
  | "solicitud"
  | "espera_aprobacion"
  | "rechazada"
  | "confirmada"
  | "realizada";

interface PropertyInfo {
  id: string;
  title: string;
  address: string;
  neighborhood: string;
  price: number;
  image: string;
}

interface VisitaConfirmation {
  date: string;
  time: string;
  address: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

interface VisitaContextType {
  currentStep: VisitaStep;
  setCurrentStep: (step: VisitaStep) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  isIdentityVerified: boolean;
  setIsIdentityVerified: (value: boolean) => void;
  isIncomeVerified: boolean;
  setIsIncomeVerified: (value: boolean) => void;
  isHoggaxQualified: boolean;
  setIsHoggaxQualified: (value: boolean) => void;
  visitApproval: "pending" | "approved" | "rejected";
  setVisitApproval: (status: "pending" | "approved" | "rejected") => void;
  selectedProperty: PropertyInfo | null;
  setSelectedProperty: (property: PropertyInfo | null) => void;
  visitConfirmation: VisitaConfirmation | null;
  setVisitConfirmation: (confirmation: VisitaConfirmation | null) => void;
  resetVisita: () => void;
}

const VisitaContext = createContext<VisitaContextType | undefined>(undefined);

export const VisitaProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState<VisitaStep>("not_started");
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Mock: assume logged in
  const [isIdentityVerified, setIsIdentityVerified] = useState(false);
  const [isIncomeVerified, setIsIncomeVerified] = useState(false);
  const [isHoggaxQualified, setIsHoggaxQualified] = useState(false);
  const [visitApproval, setVisitApproval] = useState<"pending" | "approved" | "rejected">("pending");
  const [selectedProperty, setSelectedProperty] = useState<PropertyInfo | null>(null);
  const [visitConfirmation, setVisitConfirmation] = useState<VisitaConfirmation | null>(null);

  const resetVisita = () => {
    setCurrentStep("not_started");
    setIsIdentityVerified(false);
    setIsIncomeVerified(false);
    setIsHoggaxQualified(false);
    setVisitApproval("pending");
    setSelectedProperty(null);
    setVisitConfirmation(null);
  };

  return (
    <VisitaContext.Provider value={{
      currentStep,
      setCurrentStep,
      isLoggedIn,
      setIsLoggedIn,
      isIdentityVerified,
      setIsIdentityVerified,
      isIncomeVerified,
      setIsIncomeVerified,
      isHoggaxQualified,
      setIsHoggaxQualified,
      visitApproval,
      setVisitApproval,
      selectedProperty,
      setSelectedProperty,
      visitConfirmation,
      setVisitConfirmation,
      resetVisita,
    }}>
      {children}
    </VisitaContext.Provider>
  );
};

export const useVisita = () => {
  const context = useContext(VisitaContext);
  if (context === undefined) {
    throw new Error("useVisita must be used within a VisitaProvider");
  }
  return context;
};
