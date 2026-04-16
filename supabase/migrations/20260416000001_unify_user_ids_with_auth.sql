-- ============================================================================
-- Unify public.users.id with auth.users.id
-- ============================================================================
--
-- Before this migration:
--   - public.users.id was uuid_generate_v4() (independent UUID)
--   - public.users.auth_id linked to auth.users.id
--   - All FK columns (properties.user_id, etc.) referenced public.users.id
--   - RLS policies indirected through: user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
--
-- After this migration:
--   - public.users.id = auth.users.id (one canonical identity)
--   - public.users.auth_id still exists and remains populated (for backward
--     compatibility with existing app code; it will be dropped in a later migration)
--   - All FKs still point to public.users.id (unchanged)
--   - New FK: public.users.id -> auth.users(id) ON DELETE CASCADE guarantees parity
--   - FKs now have ON UPDATE CASCADE (defensive, better default)
--   - Signup trigger writes matching ids for new users
--
-- Data scope: 27 existing users. Cascades update ~1,861 FK rows across 11 tables
-- (plus properties_read denormalized copy, which is handled explicitly).
-- ============================================================================


-- ---------------------------------------------------------------------------
-- STAGE 1: Fix signup trigger so new auth.users rows create matching public.users.id
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.users (id, auth_id, email, name)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', NULL)
  )
  ON CONFLICT (email) DO UPDATE SET
    auth_id = EXCLUDED.auth_id,
    updated_at = now();
  -- NOTE: on email conflict we intentionally do NOT update id (would break FKs).
  -- The pre-existing row keeps its id but gets linked to the new auth_id.
  -- After Phase B (auth_id column drop) this edge case will need explicit handling.
  RETURN NEW;
END;
$function$;


-- ---------------------------------------------------------------------------
-- STAGE 2: Add ON UPDATE CASCADE to every FK referencing public.users.id
--          so the backfill UPDATE in Stage 4 propagates to all child rows.
--          This is kept permanently as it is a strictly better default.
-- ---------------------------------------------------------------------------
ALTER TABLE public.certificados_inquilino
  DROP CONSTRAINT certificados_inquilino_user_id_fkey,
  ADD CONSTRAINT certificados_inquilino_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.favoritos
  DROP CONSTRAINT favoritos_user_id_fkey,
  ADD CONSTRAINT favoritos_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Note: the FK on leads.owner_id is historically named leads_user_id_fkey
ALTER TABLE public.leads
  DROP CONSTRAINT leads_user_id_fkey,
  ADD CONSTRAINT leads_user_id_fkey
    FOREIGN KEY (owner_id) REFERENCES public.users(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE public.leads
  DROP CONSTRAINT leads_submitter_user_id_fkey,
  ADD CONSTRAINT leads_submitter_user_id_fkey
    FOREIGN KEY (submitter_user_id) REFERENCES public.users(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE public.operaciones
  DROP CONSTRAINT operaciones_tenant_id_fkey,
  ADD CONSTRAINT operaciones_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES public.users(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE public.properties
  DROP CONSTRAINT properties_user_id_fkey,
  ADD CONSTRAINT properties_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.tokko_company
  DROP CONSTRAINT tokko_company_user_id_fkey,
  ADD CONSTRAINT tokko_company_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.verificaciones_hoggax
  DROP CONSTRAINT verificaciones_hoggax_user_id_fkey,
  ADD CONSTRAINT verificaciones_hoggax_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.verificaciones_truora
  DROP CONSTRAINT verificaciones_truora_user_id_fkey,
  ADD CONSTRAINT verificaciones_truora_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.visitas
  DROP CONSTRAINT visitas_owner_user_id_fkey,
  ADD CONSTRAINT visitas_owner_user_id_fkey
    FOREIGN KEY (owner_user_id) REFERENCES public.users(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.visitas
  DROP CONSTRAINT visitas_requester_user_id_fkey,
  ADD CONSTRAINT visitas_requester_user_id_fkey
    FOREIGN KEY (requester_user_id) REFERENCES public.users(id)
    ON DELETE SET NULL ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------
-- STAGE 3: Disable listing-sync triggers during the cascade to avoid 1,800+
--          rebuild_property_listing() calls (which would still be correct,
--          just slow). We manually sync properties_read once at the end.
-- ---------------------------------------------------------------------------
ALTER TABLE public.properties DISABLE TRIGGER trg_properties_sync_listing;
ALTER TABLE public.operaciones DISABLE TRIGGER trg_operaciones_sync_listing;
ALTER TABLE public.tokko_property_property_tag DISABLE TRIGGER trg_tags_sync_listing;
ALTER TABLE public.tokko_property_photo DISABLE TRIGGER trg_photos_sync_listing;


-- ---------------------------------------------------------------------------
-- STAGE 4: Backfill. Sets public.users.id = auth_id for all mismatched rows.
--          ON UPDATE CASCADE propagates the new id through every FK column.
-- ---------------------------------------------------------------------------
UPDATE public.users SET id = auth_id WHERE id <> auth_id;


-- ---------------------------------------------------------------------------
-- STAGE 5: Sync properties_read.user_id. This table has no FK constraint to
--          users (it's a denormalized copy), so the cascade above did not
--          update it. We rewrite user_id from the authoritative properties
--          table.
-- ---------------------------------------------------------------------------
UPDATE public.properties_read pr
SET user_id = p.user_id
FROM public.properties p
WHERE pr.property_id = p.id
  AND pr.user_id <> p.user_id;


-- ---------------------------------------------------------------------------
-- STAGE 6: Re-enable listing-sync triggers.
-- ---------------------------------------------------------------------------
ALTER TABLE public.properties ENABLE TRIGGER trg_properties_sync_listing;
ALTER TABLE public.operaciones ENABLE TRIGGER trg_operaciones_sync_listing;
ALTER TABLE public.tokko_property_property_tag ENABLE TRIGGER trg_tags_sync_listing;
ALTER TABLE public.tokko_property_photo ENABLE TRIGGER trg_photos_sync_listing;


-- ---------------------------------------------------------------------------
-- STAGE 7: Add FK public.users.id -> auth.users(id). Guarantees permanent
--          parity and makes DELETE FROM auth.users cascade cleanly.
-- ---------------------------------------------------------------------------
ALTER TABLE public.users
  ADD CONSTRAINT users_id_auth_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- ---------------------------------------------------------------------------
-- STAGE 8: Verification - will ROLLBACK the whole migration if any check fails.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_mismatched    INTEGER;
  v_pr_bad        INTEGER;
  v_auth_orphans  INTEGER;
  v_public_orphans INTEGER;
BEGIN
  -- Every public.users row has id = auth_id
  SELECT COUNT(*) INTO v_mismatched FROM public.users WHERE id <> auth_id;
  IF v_mismatched > 0 THEN
    RAISE EXCEPTION 'FAIL: % public.users rows still have id <> auth_id', v_mismatched;
  END IF;

  -- properties_read.user_id matches properties.user_id
  SELECT COUNT(*) INTO v_pr_bad
  FROM public.properties_read pr
  JOIN public.properties p ON pr.property_id = p.id
  WHERE pr.user_id <> p.user_id;
  IF v_pr_bad > 0 THEN
    RAISE EXCEPTION 'FAIL: % properties_read rows have user_id <> properties.user_id', v_pr_bad;
  END IF;

  -- Every public.users.id exists in auth.users
  SELECT COUNT(*) INTO v_public_orphans
  FROM public.users p
  LEFT JOIN auth.users a ON a.id = p.id
  WHERE a.id IS NULL;
  IF v_public_orphans > 0 THEN
    RAISE EXCEPTION 'FAIL: % public.users rows have no matching auth.users row', v_public_orphans;
  END IF;

  -- Every auth.users.id has a matching public.users row
  SELECT COUNT(*) INTO v_auth_orphans
  FROM auth.users a
  LEFT JOIN public.users p ON p.id = a.id
  WHERE p.id IS NULL;
  IF v_auth_orphans > 0 THEN
    RAISE EXCEPTION 'FAIL: % auth.users rows have no matching public.users row', v_auth_orphans;
  END IF;

  RAISE NOTICE 'Migration verification passed: all users have unified IDs.';
END $$;
