import { LeadStage } from "@/contexts/MockUserContext";

export interface InterestedParty {
  id: string;
  name: string;
  age?: number;
  occupation?: string;
  estimatedIncome?: string;
  leadStage: LeadStage;
  paymentCapacity: string;
  interestDate: string;
  lastContact?: string;
  daysWithoutResponse?: number;
  pendingResponse?: boolean;
  highCloseProbability?: boolean;
  phone?: string;
  email?: string;
  properties?: Array<{ id: string; name: string }>;
}

// Owner panel - interested parties per property
export const ownerInterestedParties: Record<string, InterestedParty[]> = {
  "1": [], // Alquilada - no interested
  "2": [
    {
      id: "int-1",
      name: "Lucía Fernández",
      age: 32,
      occupation: "Diseñadora UX",
      estimatedIncome: "$2,500 USD",
      leadStage: "calificado",
      paymentCapacity: "$1,200 - $1,500 USD",
      interestDate: "18/01/2025",
      lastContact: "Hace 1 día",
      highCloseProbability: true,
      phone: "+54 11 5555-1234",
      email: "lucia.fernandez@email.com",
    },
    {
      id: "int-2",
      name: "Martín Rodríguez",
      age: 28,
      occupation: "Desarrollador",
      estimatedIncome: "$2,000 USD",
      leadStage: "en_seguimiento",
      paymentCapacity: "$1,000 - $1,400 USD",
      interestDate: "15/01/2025",
      lastContact: "Hace 3 días",
      daysWithoutResponse: 3,
      pendingResponse: true,
      phone: "+54 11 5555-2345",
      email: "martin.r@email.com",
    },
    {
      id: "int-3",
      name: "Carolina Méndez",
      age: 35,
      occupation: "Contadora",
      estimatedIncome: "$2,800 USD",
      leadStage: "verificado",
      paymentCapacity: "$1,300 - $1,600 USD",
      interestDate: "12/01/2025",
      lastContact: "Hace 5 días",
      phone: "+54 11 5555-3456",
      email: "carolina.m@email.com",
    },
  ],
  "3": [
    {
      id: "int-4",
      name: "Diego Torres",
      age: 24,
      occupation: "Estudiante",
      estimatedIncome: "$1,200 USD",
      leadStage: "sin_verificar",
      paymentCapacity: "$600 - $800 USD",
      interestDate: "20/01/2025",
      lastContact: "Hace 2 días",
      phone: "+54 11 5555-4567",
      email: "diego.t@email.com",
    },
  ],
};

// Agency panel - all interested parties with properties
export const agencyInterestedParties: InterestedParty[] = [
  {
    id: "int-1",
    name: "Lucía Fernández",
    age: 32,
    occupation: "Diseñadora UX",
    estimatedIncome: "$2,500 USD",
    leadStage: "calificado",
    paymentCapacity: "$1,200 - $1,500 USD",
    interestDate: "18/01/2025",
    lastContact: "Hace 1 día",
    highCloseProbability: true,
    phone: "+54 11 5555-1234",
    email: "lucia.fernandez@email.com",
    properties: [{ id: "2", name: "Piso Exclusivo Recoleta" }],
  },
  {
    id: "int-2",
    name: "Martín Rodríguez",
    age: 28,
    occupation: "Desarrollador",
    estimatedIncome: "$2,000 USD",
    leadStage: "en_seguimiento",
    paymentCapacity: "$1,000 - $1,400 USD",
    interestDate: "15/01/2025",
    lastContact: "Hace 3 días",
    daysWithoutResponse: 3,
    pendingResponse: true,
    phone: "+54 11 5555-2345",
    email: "martin.r@email.com",
    properties: [
      { id: "2", name: "Piso Exclusivo Recoleta" },
      { id: "3", name: "Estudio Moderno Belgrano" },
    ],
  },
  {
    id: "int-3",
    name: "Carolina Méndez",
    age: 35,
    occupation: "Contadora",
    estimatedIncome: "$2,800 USD",
    leadStage: "verificado",
    paymentCapacity: "$1,300 - $1,600 USD",
    interestDate: "12/01/2025",
    lastContact: "Hace 5 días",
    phone: "+54 11 5555-3456",
    email: "carolina.m@email.com",
    properties: [{ id: "2", name: "Piso Exclusivo Recoleta" }],
  },
  {
    id: "int-4",
    name: "Diego Torres",
    age: 24,
    occupation: "Estudiante",
    estimatedIncome: "$1,200 USD",
    leadStage: "sin_verificar",
    paymentCapacity: "$600 - $800 USD",
    interestDate: "20/01/2025",
    lastContact: "Hace 2 días",
    phone: "+54 11 5555-4567",
    email: "diego.t@email.com",
    properties: [{ id: "3", name: "Estudio Moderno Belgrano" }],
  },
  {
    id: "int-5",
    name: "Sofía Ramos",
    age: 29,
    occupation: "Abogada",
    estimatedIncome: "$3,000 USD",
    leadStage: "calificado",
    paymentCapacity: "$900 - $1,100 USD",
    interestDate: "19/01/2025",
    lastContact: "Hace 1 día",
    highCloseProbability: true,
    phone: "+54 11 5555-5678",
    email: "sofia.ramos@email.com",
    properties: [{ id: "6", name: "Monoambiente Núñez" }],
  },
  {
    id: "int-6",
    name: "Pablo Gutiérrez",
    age: 31,
    occupation: "Arquitecto",
    estimatedIncome: "$2,200 USD",
    leadStage: "verificado",
    paymentCapacity: "$700 - $950 USD",
    interestDate: "17/01/2025",
    lastContact: "Hace 4 días",
    pendingResponse: true,
    daysWithoutResponse: 4,
    phone: "+54 11 5555-6789",
    email: "pablo.g@email.com",
    properties: [
      { id: "3", name: "Estudio Moderno Belgrano" },
      { id: "6", name: "Monoambiente Núñez" },
    ],
  },
  {
    id: "int-7",
    name: "Ana Ruiz",
    age: 27,
    occupation: "Marketing",
    estimatedIncome: "$1,800 USD",
    leadStage: "no_avanza",
    paymentCapacity: "$500 - $700 USD",
    interestDate: "21/01/2025",
    lastContact: "Hace 7 días",
    phone: "+54 11 5555-7890",
    email: "ana.ruiz@email.com",
    properties: [{ id: "6", name: "Monoambiente Núñez" }],
  },
];

// Agency panel - interested parties per property
export const agencyInterestedByProperty: Record<string, InterestedParty[]> = {
  "1": [],
  "2": [
    agencyInterestedParties[0], // Lucía
    agencyInterestedParties[1], // Martín
    agencyInterestedParties[2], // Carolina
  ],
  "3": [
    agencyInterestedParties[1], // Martín
    agencyInterestedParties[3], // Diego
    agencyInterestedParties[5], // Pablo
  ],
  "4": [],
  "5": [],
  "6": [
    agencyInterestedParties[4], // Sofía
    agencyInterestedParties[5], // Pablo
    agencyInterestedParties[6], // Ana
  ],
};
