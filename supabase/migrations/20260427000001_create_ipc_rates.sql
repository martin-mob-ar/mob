-- Create ipc_rates table to store monthly IPC (inflation) rates from INDEC.
-- Populated and kept up-to-date by the /api/cron/ipc cron job (daily, datos.gob.ar).

CREATE TABLE public.ipc_rates (
  period     text        NOT NULL,  -- "YYYY-MM" format, e.g. "2026-03"
  rate       numeric     NOT NULL,  -- monthly % change, e.g. 3.4 means 3.4%
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ipc_rates_pkey PRIMARY KEY (period)
);

-- Public read access (used by client via /api/ipc route).
-- Write only via service role (cron job).
ALTER TABLE public.ipc_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ipc_rates_select" ON public.ipc_rates FOR SELECT USING (true);
