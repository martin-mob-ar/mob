"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { CronJobDay } from "@/lib/admin/queries";

const config: ChartConfig = {
  completed: { label: "Completados", color: "hsl(var(--chart-1))" },
  failed: { label: "Fallidos", color: "hsl(0 84% 60%)" },
};

export function CronJobChart({ data }: { data: CronJobDay[] }) {
  if (!data.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Sin datos
      </p>
    );
  }

  return (
    <ChartContainer config={config} className="aspect-auto h-[160px] w-full">
      <BarChart
        data={data}
        margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v.slice(5)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={28}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="completed"
          stackId="1"
          fill="var(--color-completed)"
        />
        <Bar
          dataKey="failed"
          stackId="1"
          fill="var(--color-failed)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
