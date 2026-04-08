"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const OPTIONS = [
  { label: "7d", value: "7" },
  { label: "30d", value: "30" },
  { label: "90d", value: "90" },
  { label: "Todo", value: "all" },
] as const;

export function PeriodSelector() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("period") || "30";

  return (
    <div className="flex gap-1">
      {OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          variant={current === opt.value ? "default" : "outline"}
          size="sm"
          onClick={() => {
            const sp = new URLSearchParams(params.toString());
            sp.set("period", opt.value);
            router.replace(`?${sp.toString()}`, { scroll: false });
          }}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
