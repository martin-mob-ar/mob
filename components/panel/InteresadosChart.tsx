"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface ViewSeriesPoint {
  date: string;
  views: number;
}

const config: ChartConfig = {
  views: { label: "Vistas", color: "hsl(var(--chart-1))" },
};

export function InteresadosChart({ data }: { data: ViewSeriesPoint[] }) {
  if (!data.length) return null;

  return (
    <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
      <AreaChart
        data={data}
        margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
      >
        <defs>
          <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => {
            const d = new Date(v + "T00:00:00");
            return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={32}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(v) => {
                const d = new Date(v + "T00:00:00");
                return d.toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                });
              }}
            />
          }
        />
        <Area
          dataKey="views"
          type="monotone"
          fill="url(#fillViews)"
          stroke="var(--color-views)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
