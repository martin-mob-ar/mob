-- ============================================================================
-- Simplify RLS policies now that public.users.id = auth.users.id
-- ============================================================================
--
-- Before: policies indirected through
--   `user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())`
-- After:  policies compare directly: `user_id = auth.uid()`
--
-- Both forms are semantically equivalent after the ID-unification migration.
-- This migration is safe to run while the old app code is still deployed —
-- all queries continue to work identically.
--
-- Prereq: 20260416000001_unify_user_ids_with_auth.sql has been applied.
-- ============================================================================


-- users: "Users can view own profile"
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  USING (id = (SELECT auth.uid()));


-- favoritos: "User can manage own favoritos"
DROP POLICY IF EXISTS "User can manage own favoritos" ON public.favoritos;
CREATE POLICY "User can manage own favoritos" ON public.favoritos
  FOR ALL
  USING (user_id = (SELECT auth.uid()));


-- leads: "Users can view own leads"
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
CREATE POLICY "Users can view own leads" ON public.leads
  FOR SELECT
  USING (
    owner_id = (SELECT auth.uid())
    OR submitter_user_id = (SELECT auth.uid())
  );


-- operaciones: "Users can view own operaciones"
DROP POLICY IF EXISTS "Users can view own operaciones" ON public.operaciones;
CREATE POLICY "Users can view own operaciones" ON public.operaciones
  FOR SELECT
  USING (
    tenant_id = (SELECT auth.uid())
    OR property_id IN (
      SELECT id FROM public.properties WHERE user_id = (SELECT auth.uid())
    )
  );


-- properties: "Users can view own properties"
DROP POLICY IF EXISTS "Users can view own properties" ON public.properties;
CREATE POLICY "Users can view own properties" ON public.properties
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));


-- tokko_company: "Users can view own company"
DROP POLICY IF EXISTS "Users can view own company" ON public.tokko_company;
CREATE POLICY "Users can view own company" ON public.tokko_company
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));


-- tokko_property_file: "Users can view own property files"
DROP POLICY IF EXISTS "Users can view own property files" ON public.tokko_property_file;
CREATE POLICY "Users can view own property files" ON public.tokko_property_file
  FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM public.properties WHERE user_id = (SELECT auth.uid())
    )
  );


-- tokko_property_property_tag: "Users can view own property tags"
DROP POLICY IF EXISTS "Users can view own property tags" ON public.tokko_property_property_tag;
CREATE POLICY "Users can view own property tags" ON public.tokko_property_property_tag
  FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM public.properties WHERE user_id = (SELECT auth.uid())
    )
  );


-- tokko_property_video: "Users can view own property videos"
DROP POLICY IF EXISTS "Users can view own property videos" ON public.tokko_property_video;
CREATE POLICY "Users can view own property videos" ON public.tokko_property_video
  FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM public.properties WHERE user_id = (SELECT auth.uid())
    )
  );


-- visitas: "Users can view own visitas"
DROP POLICY IF EXISTS "Users can view own visitas" ON public.visitas;
CREATE POLICY "Users can view own visitas" ON public.visitas
  FOR SELECT
  USING (
    owner_user_id = (SELECT auth.uid())
    OR requester_user_id = (SELECT auth.uid())
  );


-- visita_proposals: "Users can view own visita proposals"
DROP POLICY IF EXISTS "Users can view own visita proposals" ON public.visita_proposals;
CREATE POLICY "Users can view own visita proposals" ON public.visita_proposals
  FOR SELECT
  USING (
    visita_id IN (
      SELECT id FROM public.visitas
      WHERE owner_user_id = (SELECT auth.uid())
         OR requester_user_id = (SELECT auth.uid())
    )
  );
