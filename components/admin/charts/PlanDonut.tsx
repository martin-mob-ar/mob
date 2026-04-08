"use client";

import { Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { PlanCount } from "@/lib/admin/queries";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function PlanDonut({ data }: { data: PlanCount[] }) {
  if (!data.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Sin datos de planes</p>;
  }

  const config: ChartConfig = Object.fromEntries(
    data.map((d, i) => [d.plan, { label: d.plan, color: COLORS[i % COLORS.length] }])
  );

  const chartData = data.map((d) => ({
    name: d.plan,
    value: d.count,
  }));

  return (
    <ChartContainer config={config} className="aspect-square h-[280px] w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
