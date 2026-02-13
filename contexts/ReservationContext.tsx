import { createContext, useContext, useState, ReactNode } from "react";

export type ReservationStep = 
  | "not_started"
  | "login"
  | "verificacion_intro"
  | "verificacion_identidad"
  | "verificacion_ingresos"
  | "verificacion_hoggax"
  | "checkout"
  | "pago"
  | "pago_ok"
  | "esperando_propietario"
  | "rechazada"
  | "aprobada"
  | "contrato_revision"
  | "contrato_firmado"
  | "post_venta";

interface PropertyInfo {
  id: string;
  title: string;
  address: string;
  neighborhood: string;
  price: number;
  image: string;
}

interface ReservationContextType {
  currentStep: ReservationStep;
  setCurrentStep: (step: ReservationStep) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  isIdentityVerified: boolean;
  setIsIdentityVerified: (value: boolean) => void;
  isIncomeVerified: boolean;
  setIsIncomeVerified: (value: boolean) => void;
  isHoggaxQualified: boolean;
  setIsHoggaxQualified: (value: boolean) => void;
  paymentStatus: "pending" | "success" | "failed";
  setPaymentStatus: (status: "pending" | "success" | "failed") => void;
  ownerApproval: "pending" | "approved" | "rejected";
  setOwnerApproval: (status: "pending" | "approved" | "rejected") => void;
  contractSigned: boolean;
  setContractSigned: (value: boolean) => void;
  selectedProperty: PropertyInfo | null;
  setSelectedProperty: (property: PropertyInfo | null) => void;
  resetReservation: () => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export const ReservationProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState<ReservationStep>("not_started");
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Mock: assume logged in
  const [isIdentityVerified, setIsIdentityVerified] = useState(false);
  const [isIncomeVerified, setIsIncomeVerified] = useState(false);
  const [isHoggaxQualified, setIsHoggaxQualified] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending");
  const [ownerApproval, setOwnerApproval] = useState<"pending" | "approved" | "rejected">("pending");
  const [contractSigned, setContractSigned] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyInfo | null>(null);

  const resetReservation = () => {
    setCurrentStep("not_started");
    setIsIdentityVerified(false);
    setIsIncomeVerified(false);
    setIsHoggaxQualified(false);
    setPaymentStatus("pending");
    setOwnerApproval("pending");
    setContractSigned(false);
    setSelectedProperty(null);
  };

  return (
    <ReservationContext.Provider value={{
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
      paymentStatus,
      setPaymentStatus,
      ownerApproval,
      setOwnerApproval,
      contractSigned,
      setContractSigned,
      selectedProperty,
      setSelectedProperty,
      resetReservation,
    }}>
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error("useReservation must be used within a ReservationProvider");
  }
  return context;
};
