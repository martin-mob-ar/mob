import { DollarSign, TrendingUp, ArrowDownRight, ArrowUpRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const transactions = [
  {
    date: "03/01/2026",
    description: "Comisión alquiler - Loft Palermo Soho",
    propietario: "Juan Pérez",
    type: "ingreso",
    amount: "+$85",
  },
  {
    date: "02/01/2026",
    description: "Comisión alquiler - Depto Recoleta",
    propietario: "María García",
    type: "ingreso",
    amount: "+$120",
  },
  {
    date: "01/01/2026",
    description: "Comisión alquiler - Estudio Belgrano",
    propietario: "Carlos López",
    type: "ingreso",
    amount: "+$65",
  },
  {
    date: "28/12/2025",
    description: "Gasto de marketing - Publicidad propiedades",
    propietario: "—",
    type: "egreso",
    amount: "-$200",
  },
  {
    date: "27/12/2025",
    description: "Comisión alquiler - PH Villa Crespo",
    propietario: "Roberto Fernández",
    type: "ingreso",
    amount: "+$98",
  },
];

const InmobiliariaBalanceView = () => {
  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold">Balance</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Comisiones totales
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-display">$18.750</span>
                <span className="text-sm text-muted-foreground">USD</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
              <ArrowUpRight className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ingresos del mes
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-display text-green-600">+$2.150</span>
                <span className="flex items-center text-sm font-medium text-green-600">
                  <TrendingUp className="h-4 w-4 mr-0.5" />
                  +8%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
              <ArrowDownRight className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Gastos del mes
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-display text-red-600">-$450</span>
                <span className="text-sm text-muted-foreground">USD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-6">
          Movimientos recientes
        </h2>

        <Table>
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Fecha
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Descripción
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Propietario
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                Monto
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction, index) => (
              <TableRow key={index} className="border-0 hover:bg-secondary/50">
                <TableCell className="text-sm text-muted-foreground">
                  {transaction.date}
                </TableCell>
                <TableCell className="font-medium">{transaction.description}</TableCell>
                <TableCell className="text-muted-foreground">{transaction.propietario}</TableCell>
                <TableCell
                  className={`text-right font-semibold ${
                    transaction.type === "ingreso" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {transaction.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InmobiliariaBalanceView;
