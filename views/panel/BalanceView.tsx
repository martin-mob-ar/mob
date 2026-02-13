import { Wallet, Download, ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Movement {
  period: string;
  property: string;
  description: string;
  gross: string;
  commission: string;
  net: string;
  isPositive: boolean;
}

const movements: Movement[] = [
  {
    period: "MAR 2024",
    property: "Loft Palermo",
    description: "Alquiler mensual",
    gross: "$850",
    commission: "-$85",
    net: "$765",
    isPositive: true,
  },
  {
    period: "MAR 2024",
    property: "Depto Belgrano",
    description: "Alquiler mensual",
    gross: "$1600",
    commission: "-$160",
    net: "$1440",
    isPositive: true,
  },
  {
    period: "FEB 2024",
    property: "Loft Palermo",
    description: "Reparación plomería",
    gross: "$-60",
    commission: "—",
    net: "$-60",
    isPositive: false,
  },
];

const BalanceView = () => {
  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold">Balance</h1>

      {/* Balance card */}
      <div className="bg-primary rounded-3xl p-8 text-primary-foreground relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent rounded-3xl" />
        
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-5 w-5 opacity-80" />
              <span className="text-sm font-medium uppercase tracking-wider opacity-80">
                Balance total disponible
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold font-display">$4.120</span>
              <span className="text-2xl opacity-80">USD</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              className="rounded-full gap-2 bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <Download className="h-4 w-4" />
              Reporte
            </Button>
            <Button 
              variant="secondary" 
              className="rounded-full gap-2 bg-white hover:bg-white/90 text-primary"
            >
              <ArrowDownToLine className="h-4 w-4" />
              Retirar
            </Button>
          </div>
        </div>
      </div>

      {/* Movements table */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="mb-6">
          <h2 className="font-display font-semibold uppercase tracking-wider text-sm">
            Movimientos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Historial completo de transacciones
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Período
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Propiedad
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Descripción
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                Bruto
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                Comisión
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                Neto
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement, index) => (
              <TableRow key={index} className="border-0 hover:bg-secondary/50">
                <TableCell className="font-medium">{movement.period}</TableCell>
                <TableCell className="font-medium">{movement.property}</TableCell>
                <TableCell className="text-muted-foreground">{movement.description}</TableCell>
                <TableCell
                  className={`text-right font-semibold ${
                    movement.isPositive ? "text-green-600" : "text-muted-foreground"
                  }`}
                >
                  {movement.gross}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {movement.commission}
                </TableCell>
                <TableCell
                  className={`text-right font-semibold ${
                    movement.isPositive ? "text-green-600" : "text-destructive"
                  }`}
                >
                  {movement.net}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BalanceView;
