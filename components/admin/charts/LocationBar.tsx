"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { LocationCount } from "@/lib/admin/queries";

const config: ChartConfig = {
  count: { label: "Propiedades", color: "hsl(var(--chart-2))" },
};

export function LocationBar({ data }: { data: LocationCount[] }) {
  if (!data.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Sin datos</p>;
  }

  const chartData = data.map((d) => ({
    name: d.location,
    count: d.count,
  }));

  return (
    <ChartContainer config={config} className="aspect-auto h-[380px] w-full">
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} className="text-xs" />
        <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
