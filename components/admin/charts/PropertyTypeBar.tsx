"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { PropertyTypeCount } from "@/lib/admin/queries";

const config: ChartConfig = {
  count: { label: "Propiedades", color: "hsl(var(--chart-1))" },
};

export function PropertyTypeBar({ data }: { data: PropertyTypeCount[] }) {
  if (!data.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Sin datos</p>;
  }

  return (
    <ChartContainer config={config} className="aspect-auto h-[280px] w-full">
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={100} className="text-xs" />
        <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
