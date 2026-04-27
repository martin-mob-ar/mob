'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { CronRun } from '@/lib/admin/queries';

export interface CronRunColumn {
  header: string;
  getValue: (run: CronRun) => string | number | null | undefined;
  color?: string;
}

interface CronRunLogProps {
  runs: CronRun[];
  columns: CronRunColumn[];
  pageSize?: number;
}

const statusStyles: Record<string, string> = {
  completed: 'bg-green-950 text-green-400',
  failed:    'bg-red-950 text-red-300',
  chained:   'bg-sky-950 text-sky-300',
  running:   'bg-muted text-muted-foreground',
};

const statusLabels: Record<string, string> = {
  completed: 'ok',
  failed:    'err',
  chained:   'chain',
  running:   '...',
};

export function CronRunLog({ runs, columns, pageSize = 5 }: CronRunLogProps) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);

  if (runs.length === 0) return null;

  const totalPages = Math.ceil(runs.length / pageSize);
  const pageRuns = runs.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div className="mt-2 border-t pt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        <span>Últimas ejecuciones</span>
        <span className="ml-auto text-[10px]">{runs.length} registros</span>
      </button>

      {open && (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                {columns.map((col, i) => (
                  <th key={i} className="pb-1 pr-3 font-normal whitespace-nowrap">{col.header}</th>
                ))}
                <th className="pb-1 font-normal">Estado</th>
              </tr>
            </thead>
            <tbody>
              {pageRuns.map((run) => (
                <tr key={run.id} className="border-b border-border/40 last:border-0">
                  {columns.map((col, i) => {
                    const val = col.getValue(run);
                    return (
                      <td
                        key={i}
                        className={`py-1 pr-3 tabular-nums whitespace-nowrap ${col.color ?? 'text-muted-foreground'}`}
                      >
                        {val == null ? <span className="opacity-30">—</span> : val}
                      </td>
                    );
                  })}
                  <td className="py-1">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${statusStyles[run.status] ?? statusStyles.running}`}>
                      {statusLabels[run.status] ?? run.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>pág. {page + 1} / {totalPages}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 0}
                  className="rounded border px-2 py-0.5 disabled:opacity-40 hover:bg-muted"
                >
                  ←
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                  className="rounded border px-2 py-0.5 disabled:opacity-40 hover:bg-muted"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
