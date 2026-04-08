"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { SignupDay } from "@/lib/admin/queries";

const config: ChartConfig = {
  inquilino: { label: "Inquilino", color: "hsl(var(--chart-1))" },
  dueno: { label: "Dueño", color: "hsl(var(--chart-2))" },
  inmobiliaria: { label: "Inmobiliaria", color: "hsl(var(--chart-3))" },
  sin_tipo: { label: "Sin tipo", color: "hsl(var(--chart-4))" },
};

export function SignupsChart({ data }: { data: SignupDay[] }) {
  if (!data.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Sin datos de registros</p>;
  }

  return (
    <ChartContainer config={config} className="aspect-auto h-[280px] w-full">
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={32} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area type="monotone" dataKey="inquilino" stackId="1" fill="var(--color-inquilino)" stroke="var(--color-inquilino)" fillOpacity={0.4} />
        <Area type="monotone" dataKey="dueno" stackId="1" fill="var(--color-dueno)" stroke="var(--color-dueno)" fillOpacity={0.4} />
        <Area type="monotone" dataKey="inmobiliaria" stackId="1" fill="var(--color-inmobiliaria)" stroke="var(--color-inmobiliaria)" fillOpacity={0.4} />
        <Area type="monotone" dataKey="sin_tipo" stackId="1" fill="var(--color-sin_tipo)" stroke="var(--color-sin_tipo)" fillOpacity={0.4} />
      </AreaChart>
    </ChartContainer>
  );
}
