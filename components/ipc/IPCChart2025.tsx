import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { Loader2 } from "lucide-react";
import { fetchIPCData, parseMonthShort } from "@/services/ipcService";

interface ChartPoint {
  label: string;
  rate: number;
}

export default function IPCChart2025() {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchIPCData("2025-01", "2025-12");
        setData(
          result.data.map((d) => ({
            label: parseMonthShort(d.month).replace(" 2025", ""),
            rate: d.rate,
          }))
        );
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No se pudieron cargar los datos de IPC 2025.</p>;
  }

  const maxRate = Math.max(...data.map((d) => d.rate));

  return (
    <section className="mt-8">
      <h3 className="text-lg font-bold font-display mb-4">IPC mensual 2025</h3>
      <div className="w-full h-72 -mx-2 sm:mx-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} className="fill-muted-foreground" interval={0} angle={-45} textAnchor="end" height={40} />
            <YAxis
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 10 }}
              className="fill-muted-foreground"
              domain={[0, Math.ceil(maxRate + 1)]}
              width={40}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1).replace(".", ",")}%`, "IPC mensual"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="rate"
                position="top"
                formatter={(v: number) => `${v.toFixed(1)}%`}
                style={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              />
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.rate === maxRate ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
