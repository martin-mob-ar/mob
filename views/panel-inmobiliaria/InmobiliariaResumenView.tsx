import { DollarSign, Layers, MessageCircle, TrendingUp, ArrowUpRight, Users, CalendarCheck, FileCheck } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const kpis = [
  {
    label: "Propiedades activas",
    value: "24",
    subtitle: "de 32",
    icon: Layers,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    link: "/gestion-inmobiliaria/propiedades",
  },
  {
    label: "Interesados verificados",
    value: "6",
    subtitle: "este mes",
    change: "+3",
    icon: Users,
    iconBg: "bg-green-500/10",
    iconColor: "text-green-600",
    link: "/gestion-inmobiliaria/interesados",
  },
  {
    label: "Visitas coordinadas",
    value: "2",
    subtitle: "esta semana",
    icon: CalendarCheck,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
  },
  {
    label: "Contratos en curso",
    value: "18",
    subtitle: "",
    icon: FileCheck,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600",
    link: "/gestion-inmobiliaria/contratos",
  },
];

const recentActivity = [
  {
    date: "Hoy, 10:30 AM",
    property: "Loft Palermo Soho",
    propietario: "Juan Pérez",
    event: "Pago de alquiler recibido",
    amount: "+$850",
    positive: true,
  },
  {
    date: "Hoy, 09:15 AM",
    property: "Depto 3 amb Caballito",
    propietario: "María García",
    event: "Nuevo contrato firmado",
    amount: "—",
    positive: false,
  },
  {
    date: "Ayer, 14:20",
    property: "Depto Recoleta",
    propietario: "Carlos López",
    event: "Nuevo ticket: Aire acond.",
    amount: "—",
    positive: false,
  },
  {
    date: "Hace 2 días",
    property: "Estudio Belgrano",
    propietario: "Ana Martínez",
    event: "Contrato renovado",
    amount: "—",
    positive: false,
  },
];

const InmobiliariaResumenView = () => {
  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold">Resumen</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi) => {
          const CardContent = (
            <div
              className={`bg-card rounded-2xl border border-border p-5 space-y-3 ${kpi.link ? "hover:border-primary/30 transition-colors" : ""}`}
            >
              <div className={`h-11 w-11 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {kpi.label}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-display">{kpi.value}</span>
                  {kpi.subtitle && (
                    <span className="text-sm text-muted-foreground">{kpi.subtitle}</span>
                  )}
                  {kpi.change && (
                    <span className="flex items-center text-xs font-medium text-green-600">
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                      {kpi.change}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );

          return kpi.link ? (
            <Link key={kpi.label} href={kpi.link}>
              {CardContent}
            </Link>
          ) : (
            <div key={kpi.label}>{CardContent}</div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Actividad reciente
          </h2>
          <Link
            href="/gestion-inmobiliaria/balance"
            className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1"
          >
            Ver todo
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Fecha
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Propiedad
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Propietario
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Evento
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                Monto
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentActivity.map((activity, index) => (
              <TableRow key={index} className="border-0 hover:bg-secondary/50">
                <TableCell className="text-sm text-muted-foreground">
                  {activity.date}
                </TableCell>
                <TableCell className="font-medium">{activity.property}</TableCell>
                <TableCell className="text-muted-foreground">{activity.propietario}</TableCell>
                <TableCell className="text-muted-foreground">{activity.event}</TableCell>
                <TableCell
                  className={`text-right font-semibold ${
                    activity.positive ? "text-green-600" : "text-muted-foreground"
                  }`}
                >
                  {activity.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InmobiliariaResumenView;
