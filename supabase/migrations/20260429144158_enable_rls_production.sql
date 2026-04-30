-- ============================================================================
-- Enable RLS + policies on production (idempotent — safe to re-run)
-- Mirrors baseline migration sections 14 & 15
-- ============================================================================

-- 1. ENABLE ROW-LEVEL SECURITY (idempotent, no-op if already enabled)
ALTER TABLE public.account_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados_inquilino ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_job_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties_read ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokko_company ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokko_country ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokko_location ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokko_location_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokko_operation_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokko_property_file ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokko_property_photo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokko_property_property_tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokko_property_tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokko_property_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokko_property_video ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokko_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailing_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verificaciones_hoggax ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verificaciones_truora ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visita_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_debug_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipc_rates ENABLE ROW LEVEL SECURITY;

-- 2. RLS POLICIES (drop-if-exists + create for idempotency)

-- account_type
DROP POLICY IF EXISTS "Anyone can view account_type" ON public.account_type;
CREATE POLICY "Anyone can view account_type"
  ON public.account_type FOR SELECT
  TO anon, authenticated
  USING (true);

-- cron_job_log
DROP POLICY IF EXISTS "Anyone can read cron_job_log" ON public.cron_job_log;
CREATE POLICY "Anyone can read cron_job_log"
  ON public.cron_job_log FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Service role full access" ON public.cron_job_log;
CREATE POLICY "Service role full access"
  ON public.cron_job_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- cron_sync_log
DROP POLICY IF EXISTS "Service role only" ON public.cron_sync_log;
CREATE POLICY "Service role only"
  ON public.cron_sync_log FOR ALL
  TO public
  USING (false);

-- exchange_rates
DROP POLICY IF EXISTS "Anyone can view exchange_rates" ON public.exchange_rates;
CREATE POLICY "Anyone can view exchange_rates"
  ON public.exchange_rates FOR SELECT
  TO anon, authenticated
  USING (true);

-- favoritos
DROP POLICY IF EXISTS "User can manage own favoritos" ON public.favoritos;
CREATE POLICY "User can manage own favoritos"
  ON public.favoritos FOR ALL
  TO public
  USING (user_id = (SELECT auth.uid()));

-- leads
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
CREATE POLICY "Users can view own leads"
  ON public.leads FOR SELECT
  TO public
  USING (owner_id = (SELECT auth.uid()) OR submitter_user_id = (SELECT auth.uid()));

-- operaciones
DROP POLICY IF EXISTS "Users can view own operaciones" ON public.operaciones;
CREATE POLICY "Users can view own operaciones"
  ON public.operaciones FOR SELECT
  TO public
  USING (tenant_id = (SELECT auth.uid()) OR property_id IN (SELECT id FROM properties WHERE user_id = (SELECT auth.uid())));

-- properties
DROP POLICY IF EXISTS "Users can view own properties" ON public.properties;
CREATE POLICY "Users can view own properties"
  ON public.properties FOR SELECT
  TO public
  USING (user_id = (SELECT auth.uid()));

-- properties_read
DROP POLICY IF EXISTS "Anyone can view properties_read" ON public.properties_read;
CREATE POLICY "Anyone can view properties_read"
  ON public.properties_read FOR SELECT
  TO public
  USING (true);

-- tokko_company
DROP POLICY IF EXISTS "Users can view own company" ON public.tokko_company;
CREATE POLICY "Users can view own company"
  ON public.tokko_company FOR SELECT
  TO public
  USING (user_id = (SELECT auth.uid()));

-- tokko_country
DROP POLICY IF EXISTS "Anyone can view tokko_country" ON public.tokko_country;
CREATE POLICY "Anyone can view tokko_country"
  ON public.tokko_country FOR SELECT
  TO anon, authenticated
  USING (true);

-- tokko_location
DROP POLICY IF EXISTS "Anyone can view tokko_location" ON public.tokko_location;
CREATE POLICY "Anyone can view tokko_location"
  ON public.tokko_location FOR SELECT
  TO anon, authenticated
  USING (true);

-- tokko_location_type
DROP POLICY IF EXISTS "Anyone can view tokko_location_type" ON public.tokko_location_type;
CREATE POLICY "Anyone can view tokko_location_type"
  ON public.tokko_location_type FOR SELECT
  TO anon, authenticated
  USING (true);

-- tokko_operation_type
DROP POLICY IF EXISTS "Anyone can view tokko_operation_type" ON public.tokko_operation_type;
CREATE POLICY "Anyone can view tokko_operation_type"
  ON public.tokko_operation_type FOR SELECT
  TO anon, authenticated
  USING (true);

-- tokko_property_file
DROP POLICY IF EXISTS "Users can view own property files" ON public.tokko_property_file;
CREATE POLICY "Users can view own property files"
  ON public.tokko_property_file FOR SELECT
  TO public
  USING (property_id IN (SELECT id FROM properties WHERE user_id = (SELECT auth.uid())));

-- tokko_property_photo
DROP POLICY IF EXISTS "Anyone can view photos" ON public.tokko_property_photo;
CREATE POLICY "Anyone can view photos"
  ON public.tokko_property_photo FOR SELECT
  TO public
  USING (true);

-- tokko_property_property_tag
DROP POLICY IF EXISTS "Users can view own property tags" ON public.tokko_property_property_tag;
CREATE POLICY "Users can view own property tags"
  ON public.tokko_property_property_tag FOR SELECT
  TO public
  USING (property_id IN (SELECT id FROM properties WHERE user_id = (SELECT auth.uid())));

-- tokko_property_tag
DROP POLICY IF EXISTS "Anyone can view tokko_property_tag" ON public.tokko_property_tag;
CREATE POLICY "Anyone can view tokko_property_tag"
  ON public.tokko_property_tag FOR SELECT
  TO anon, authenticated
  USING (true);

-- tokko_property_type
DROP POLICY IF EXISTS "Anyone can view property types" ON public.tokko_property_type;
CREATE POLICY "Anyone can view property types"
  ON public.tokko_property_type FOR SELECT
  TO public
  USING (true);

-- tokko_property_video
DROP POLICY IF EXISTS "Users can view own property videos" ON public.tokko_property_video;
CREATE POLICY "Users can view own property videos"
  ON public.tokko_property_video FOR SELECT
  TO public
  USING (property_id IN (SELECT id FROM properties WHERE user_id = (SELECT auth.uid())));

-- tokko_state
DROP POLICY IF EXISTS "Anyone can view tokko_state" ON public.tokko_state;
CREATE POLICY "Anyone can view tokko_state"
  ON public.tokko_state FOR SELECT
  TO anon, authenticated
  USING (true);

-- users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  TO public
  USING (id = (SELECT auth.uid()));

-- verificaciones_hoggax
DROP POLICY IF EXISTS "Service role only" ON public.verificaciones_hoggax;
CREATE POLICY "Service role only"
  ON public.verificaciones_hoggax FOR ALL
  TO public
  USING (false);

-- verificaciones_truora
DROP POLICY IF EXISTS "Service role only" ON public.verificaciones_truora;
CREATE POLICY "Service role only"
  ON public.verificaciones_truora FOR ALL
  TO public
  USING (false);

-- visita_proposals
DROP POLICY IF EXISTS "Users can view own visita proposals" ON public.visita_proposals;
CREATE POLICY "Users can view own visita proposals"
  ON public.visita_proposals FOR SELECT
  TO public
  USING (visita_id IN (SELECT id FROM visitas WHERE owner_user_id = (SELECT auth.uid()) OR requester_user_id = (SELECT auth.uid())));

-- visitas
DROP POLICY IF EXISTS "Users can view own visitas" ON public.visitas;
CREATE POLICY "Users can view own visitas"
  ON public.visitas FOR SELECT
  TO public
  USING (owner_user_id = (SELECT auth.uid()) OR requester_user_id = (SELECT auth.uid()));

-- webhook_debug_log
DROP POLICY IF EXISTS "Service role only" ON public.webhook_debug_log;
CREATE POLICY "Service role only"
  ON public.webhook_debug_log FOR ALL
  TO public
  USING (false);

-- ipc_rates (from migration 20260427000001)
DROP POLICY IF EXISTS "ipc_rates_select" ON public.ipc_rates;
CREATE POLICY "ipc_rates_select"
  ON public.ipc_rates FOR SELECT
  USING (true);

-- NOTE: Tables without policies (property_events, user_mailing_preferences,
-- certificados_inquilino) have RLS enabled but NO policies — meaning only
-- service_role can access them. This is intentional.
