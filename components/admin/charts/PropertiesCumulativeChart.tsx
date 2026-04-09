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
import type { PropertyDay } from "@/lib/admin/queries";

const config: ChartConfig = {
  tokko: { label: "Tokko (sync)", color: "hsl(var(--chart-1))" },
  manual: { label: "Manual", color: "hsl(var(--chart-2))" },
};

export function PropertiesCumulativeChart({
  data,
}: {
  data: PropertyDay[];
}) {
  if (!data.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Sin datos de propiedades
      </p>
    );
  }

  let cumTokko = 0,
    cumManual = 0;
  const cumulative = data.map((d) => {
    cumTokko += d.tokko;
    cumManual += d.manual;
    return { date: d.date, tokko: cumTokko, manual: cumManual };
  });

  return (
    <ChartContainer config={config} className="aspect-auto h-[280px] w-full">
      <AreaChart
        data={cumulative}
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
          width={40}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          type="monotone"
          dataKey="tokko"
          stackId="1"
          fill="var(--color-tokko)"
          stroke="var(--color-tokko)"
          fillOpacity={0.4}
        />
        <Area
          type="monotone"
          dataKey="manual"
          stackId="1"
          fill="var(--color-manual)"
          stroke="var(--color-manual)"
          fillOpacity={0.4}
        />
      </AreaChart>
    </ChartContainer>
  );
}
