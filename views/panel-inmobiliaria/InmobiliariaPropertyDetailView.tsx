"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  FileText, 
  DollarSign, 
  MessageCircle, 
  Info,
  MapPin,
  Calendar,
  User,
  Download,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Eye,
  CalendarCheck,
  XCircle,
  RefreshCw,
  Briefcase
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
const propertyNew1 = "/assets/property-new-1.png";
const propertyNew2 = "/assets/property-new-2.png";
const propertyNew3 = "/assets/property-new-3.png";
const propertyNew5 = "/assets/property-new-5.png";
const propertyNew6 = "/assets/property-new-6.png";
import { agencyInterestedByProperty } from "@/data/interestedParties";
import AgencyLeadCard from "@/components/leads/AgencyLeadCard";
import ContextualAlert from "@/components/leads/ContextualAlert";

// Mock property data
const propertiesData: Record<string, {
  id: string;
  name: string;
  location: string;
  address: string;
  price: string;
  status: "activa" | "alquilada" | "reservada";
  image: string;
  propietario: string;
  tokkoId: string;
  tenant?: { name: string; email: string; phone: string };
  contractStart?: string;
  contractEnd?: string;
  contractProgress?: number;
}> = {
  "1": {
    id: "1",
    name: "Loft Palermo Soho",
    location: "Palermo Soho, CABA",
    address: "Thames 1800, Palermo, CABA",
    price: "$850 USD",
    status: "activa",
    image: propertyNew1,
    propietario: "Juan Pérez",
    tokkoId: "TK-001234",
  },
  "2": {
    id: "2",
    name: "Piso Exclusivo Recoleta",
    location: "Recoleta, CABA",
    address: "Quintana 200, Recoleta, CABA",
    price: "$1,200 USD",
    status: "alquilada",
    image: propertyNew2,
    propietario: "María García",
    tokkoId: "TK-001235",
    tenant: { name: "Lucía Fernández", email: "lucia@email.com", phone: "+54 11 5555-4321" },
    contractStart: "01/01/2025",
    contractEnd: "01/01/2026",
    contractProgress: 8,
  },
  "3": {
    id: "3",
    name: "Estudio Moderno Belgrano",
    location: "Belgrano, CABA",
    address: "Av. Cabildo 2200, Belgrano, CABA",
    price: "$650 USD",
    status: "activa",
    image: propertyNew3,
    propietario: "Carlos López",
    tokkoId: "TK-001236",
  },
  "4": {
    id: "4",
    name: "Depto 3 amb Caballito",
    location: "Caballito, CABA",
    address: "Av. Rivadavia 5200, Caballito, CABA",
    price: "$720 USD",
    status: "reservada",
    image: propertyNew1,
    propietario: "Ana Martínez",
    tokkoId: "TK-001237",
  },
  "5": {
    id: "5",
    name: "PH Luminoso Villa Crespo",
    location: "Villa Crespo, CABA",
    address: "Corrientes 5800, Villa Crespo, CABA",
    price: "$980 USD",
    status: "alquilada",
    image: propertyNew5,
    propietario: "Roberto Fernández",
    tokkoId: "TK-001238",
    tenant: { name: "Martín Gómez", email: "martin@email.com", phone: "+54 11 5555-9999" },
    contractStart: "15/06/2024",
    contractEnd: "15/06/2025",
    contractProgress: 60,
  },
  "6": {
    id: "6",
    name: "Monoambiente Núñez",
    location: "Núñez, CABA",
    address: "Av. del Libertador 7200, Núñez, CABA",
    price: "$520 USD",
    status: "activa",
    image: propertyNew6,
    propietario: "Laura Sánchez",
    tokkoId: "TK-001239",
  },
};

const transactions = [
  { date: "01/01/2025", concept: "Alquiler Enero", type: "ingreso", amount: 1200 },
  { date: "01/12/2024", concept: "Alquiler Diciembre", type: "ingreso", amount: 1200 },
  { date: "15/11/2024", concept: "Reparación plomería", type: "egreso", amount: -180 },
  { date: "01/11/2024", concept: "Alquiler Noviembre", type: "ingreso", amount: 1200 },
];

const tickets = [
  { id: "T-101", title: "Problema con calefacción", status: "abierto", date: "15/01/2025", priority: "alta" },
  { id: "T-102", title: "Consulta de renovación", status: "cerrado", date: "05/01/2025", priority: "media" },
];

const statusConfig = {
  activa: { label: "Activa", className: "bg-primary/10 text-primary", dotColor: "bg-primary" },
  alquilada: { label: "Alquilada", className: "bg-green-500/10 text-green-600", dotColor: "bg-green-500" },
  reservada: { label: "Reservada", className: "bg-amber-500/10 text-amber-600", dotColor: "bg-amber-500" },
};

const ticketStatusConfig = {
  abierto: { label: "Abierto", icon: AlertCircle, className: "text-orange-500" },
  cerrado: { label: "Resuelto", icon: CheckCircle2, className: "text-green-500" },
};

const InmobiliariaPropertyDetailView = () => {
  const { propertyId } = useParams();
  const property = propertiesData[(propertyId as string) || "1"];

  if (!property) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Propiedad no encontrada</p>
        <Link href="/gestion-inmobiliaria/propiedades" className="text-primary hover:underline mt-2 inline-block">
          Volver a propiedades
        </Link>
      </div>
    );
  }

  const openTickets = tickets.filter(t => t.status === "abierto").length;
  const propertyInterested = agencyInterestedByProperty[(propertyId as string) || "1"] || [];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/gestion-inmobiliaria/propiedades"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a propiedades
      </Link>

      {/* Property Header */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-80 aspect-video md:aspect-auto">
            <img
              src={property.image}
              alt={property.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Info */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[property.status].className}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${statusConfig[property.status].dotColor}`} />
                    {statusConfig[property.status].label}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono bg-secondary text-muted-foreground">
                    <RefreshCw className="h-3 w-3" />
                    {property.tokkoId}
                  </span>
                </div>
                <h1 className="font-display text-2xl font-bold">{property.name}</h1>
                <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  {property.address}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                  <User className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider">Propietario:</span>
                  <span className="font-medium text-foreground">{property.propietario}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Alquiler mensual</p>
                <p className="font-display font-bold text-2xl">{property.price}</p>
              </div>
            </div>

            {/* Tenant info if rented */}
            {property.tenant && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Inquilino actual</p>
                    <p className="font-semibold">{property.tenant.name}</p>
                    <p className="text-sm text-muted-foreground">{property.tenant.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="interesados" className="space-y-6">
        <TabsList className="bg-card border border-border p-1 rounded-xl flex-wrap h-auto gap-1">
          <TabsTrigger value="interesados" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative">
            <Users className="h-4 w-4" />
            Interesados
            {propertyInterested.length > 0 && (
              <span className="ml-1 h-5 min-w-5 px-1 rounded-full bg-primary/20 text-primary data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground text-xs font-bold flex items-center justify-center">
                {propertyInterested.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="balance" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <DollarSign className="h-4 w-4" />
            Balance
          </TabsTrigger>
          <TabsTrigger value="contrato" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="h-4 w-4" />
            Contrato
          </TabsTrigger>
          <TabsTrigger value="tickets" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative">
            <MessageCircle className="h-4 w-4" />
            Tickets
            {openTickets > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                {openTickets}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="info" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Info className="h-4 w-4" />
            Información
          </TabsTrigger>
        </TabsList>

        {/* Interesados Tab - Default */}
        <TabsContent value="interesados" className="space-y-6">
          {propertyInterested.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold">Interesados</h3>
                  <p className="text-sm text-muted-foreground">
                    {propertyInterested.length} persona{propertyInterested.length !== 1 ? "s" : ""} interesada{propertyInterested.length !== 1 ? "s" : ""} en esta propiedad
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {propertyInterested.map((interested) => (
                  <AgencyLeadCard key={interested.id} lead={interested} />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg">Todavía no hay interesados</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Todavía no hay interesados para esta propiedad. Te avisamos cuando aparezca el primero.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Balance Tab */}
        <TabsContent value="balance" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Ingresos totales</p>
              <p className="font-display font-bold text-2xl mt-1 text-green-600">
                ${transactions.filter(t => t.amount > 0).reduce((a, b) => a + b.amount, 0).toLocaleString("es-AR")}
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Egresos totales</p>
              <p className="font-display font-bold text-2xl mt-1 text-destructive">
                ${Math.abs(transactions.filter(t => t.amount < 0).reduce((a, b) => a + b.amount, 0)).toLocaleString("es-AR")}
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Balance neto</p>
              <p className="font-display font-bold text-2xl mt-1">
                ${transactions.reduce((a, b) => a + b.amount, 0).toLocaleString("es-AR")}
              </p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="font-display font-semibold">Movimientos</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider">Fecha</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Concepto</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx, idx) => (
                  <TableRow key={idx} className="hover:bg-secondary/50">
                    <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                    <TableCell>{tx.concept}</TableCell>
                    <TableCell className={`text-right font-medium ${tx.amount > 0 ? "text-green-600" : "text-destructive"}`}>
                      {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString("es-AR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Contract Tab */}
        <TabsContent value="contrato" className="space-y-6">
          {property.status === "alquilada" && property.contractStart ? (
            <>
              {/* Contract Progress */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display font-semibold mb-4">Estado del contrato</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Inicio: {property.contractStart}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Fin: {property.contractEnd}
                    </div>
                  </div>
                  <Progress value={property.contractProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    {property.contractProgress}% del contrato transcurrido
                  </p>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display font-semibold mb-4">Documentación</h3>
                <div className="space-y-3">
                  {[
                    { name: "Contrato de alquiler", date: "01/01/2025" },
                    { name: "Inventario inicial", date: "01/01/2025" },
                    { name: "Garantía depositada", date: "28/12/2024" },
                  ].map((doc) => (
                    <div key={doc.name} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.date}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg">Sin contrato activo</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Esta propiedad no tiene un contrato activo. Cuando se alquile, verás aquí la información del contrato.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold">Tickets de soporte</h3>
              <p className="text-sm text-muted-foreground">
                {openTickets} ticket{openTickets !== 1 ? "s" : ""} abierto{openTickets !== 1 ? "s" : ""}
              </p>
            </div>
            <Button variant="outline" className="rounded-full gap-2">
              <MessageCircle className="h-4 w-4" />
              Nuevo ticket
            </Button>
          </div>

          <div className="space-y-3">
            {tickets.map((ticket) => {
              const StatusIcon = ticketStatusConfig[ticket.status as keyof typeof ticketStatusConfig].icon;
              return (
                <div 
                  key={ticket.id}
                  className="bg-card rounded-xl border border-border p-5 hover:border-primary/20 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <StatusIcon className={`h-5 w-5 mt-0.5 ${ticketStatusConfig[ticket.status as keyof typeof ticketStatusConfig].className}`} />
                      <div>
                        <p className="font-medium">{ticket.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span>{ticket.id}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {ticket.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-display font-semibold mb-6">Información de la propiedad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Nombre</p>
                  <p className="font-medium mt-1">{property.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Dirección</p>
                  <p className="font-medium mt-1">{property.address}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Ubicación</p>
                  <p className="font-medium mt-1">{property.location}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Precio</p>
                  <p className="font-medium mt-1">{property.price}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Estado</p>
                  <p className="font-medium mt-1">{statusConfig[property.status].label}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Propietario</p>
                  <p className="font-medium mt-1">{property.propietario}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full gap-2">
              <FileText className="h-4 w-4" />
              Editar información
            </Button>
            <Button variant="outline" className="rounded-full gap-2">
              <ExternalLink className="h-4 w-4" />
              Ver publicación
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InmobiliariaPropertyDetailView;
