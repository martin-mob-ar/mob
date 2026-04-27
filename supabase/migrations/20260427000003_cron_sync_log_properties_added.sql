ALTER TABLE public.cron_sync_log
  ADD COLUMN IF NOT EXISTS properties_added INTEGER NOT NULL DEFAULT 0;
