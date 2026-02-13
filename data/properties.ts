import { Property } from "@/components/PropertyCard";

const propertyNew1 = "/assets/property-new-1.png";
const propertyNew2 = "/assets/property-new-2.png";
const propertyNew3 = "/assets/property-new-3.png";
const propertyNew4 = "/assets/property-new-4.png";
const propertyNew5 = "/assets/property-new-5.png";
const propertyNew6 = "/assets/property-new-6.png";
const propertyNew7 = "/assets/property-new-7.png";
const propertyNew8 = "/assets/property-new-8.png";
const propertyNew9 = "/assets/property-new-9.png";

export const properties: Property[] = [
  {
    id: "1",
    image: propertyNew1,
    images: [propertyNew1, propertyNew2, propertyNew3],
    address: "Thames 1800, Palermo",
    neighborhood: "Palermo Soho",
    description: "Depto en Palermo Soho",
    price: 650000,
    rentPrice: 550000,
    expensas: 100000,
    type: "inmobiliaria",
    rooms: 1,
    surface: 45,
    bathrooms: 1,
    parking: 1,
    verified: true,
  },
  {
    id: "2",
    image: propertyNew5,
    images: [propertyNew5, propertyNew6, propertyNew7],
    address: "Av. Cabildo 2200, Belgrano",
    neighborhood: "Belgrano",
    description: "Moderno frente a Plaza",
    price: 320000,
    rentPrice: 280000,
    expensas: 40000,
    type: "dueno",
    rooms: 1,
    surface: 32,
    bathrooms: 1,
    parking: 0,
    verified: true,
  },
  {
    id: "3",
    image: propertyNew4,
    images: [propertyNew4, propertyNew9, propertyNew1],
    address: "Libertador 14500, San Isidro",
    neighborhood: "San Isidro",
    description: "Casa con Jardín",
    price: 850000,
    rentPrice: 750000,
    expensas: 100000,
    type: "inmobiliaria",
    rooms: 3,
    surface: 120,
    bathrooms: 2,
    parking: 2,
    verified: true,
  },
  {
    id: "4",
    image: propertyNew8,
    images: [propertyNew8, propertyNew3, propertyNew2],
    address: "Serrano 400, Villa Crespo",
    neighborhood: "Villa Crespo",
    description: "PH Reciclado a nuevo",
    price: 380000,
    rentPrice: 330000,
    expensas: 50000,
    type: "dueno",
    rooms: 2,
    surface: 55,
    bathrooms: 1,
    parking: 0,
    verified: false,
  },
  {
    id: "5",
    image: propertyNew9,
    images: [propertyNew9, propertyNew4, propertyNew5],
    address: "Quintana 200, Recoleta",
    neighborhood: "Recoleta",
    description: "Piso exclusivo",
    price: 950000,
    rentPrice: 800000,
    expensas: 150000,
    type: "inmobiliaria",
    rooms: 3,
    surface: 140,
    bathrooms: 3,
    parking: 1,
    verified: true,
  },
  {
    id: "6",
    image: propertyNew7,
    images: [propertyNew7, propertyNew8, propertyNew6],
    address: "Juana Manso, Puerto Madero",
    neighborhood: "Puerto Madero",
    description: "Depto vista al Río",
    price: 720000,
    rentPrice: 620000,
    expensas: 100000,
    type: "inmobiliaria",
    rooms: 2,
    surface: 85,
    bathrooms: 2,
    parking: 1,
    verified: false,
  },
];

export const getPropertyById = (id: string): Property | undefined => {
  return properties.find((p) => p.id === id);
};
