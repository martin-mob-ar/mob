-- ============================================================================
-- Drop the now-unused public.users.auth_id column.
-- ============================================================================
--
-- APPLY THIS MIGRATION ONLY AFTER THE CODE CHANGES FROM THE ID-UNIFICATION PR
-- HAVE BEEN DEPLOYED TO PRODUCTION.
--
-- Pre-check from the repo root:
--   grep -rn 'auth_id' app/ components/ lib/ contexts/
--   -> Should only match comments and types/supabase.ts (regenerate that
--      file after this migration via `npx supabase gen types typescript`).
--
-- Prereqs applied in order:
--   20260416000001  unify_user_ids_with_auth
--   20260416000002  simplify_rls_policies_post_id_unification
--   20260416000003  drop_not_null_on_users_auth_id
-- ============================================================================


-- 1. Rewrite the signup trigger so it no longer references auth_id.
--
-- Semantics vs. the previous version:
--   - Previously: ON CONFLICT (email) DO UPDATE SET auth_id = EXCLUDED.auth_id
--     which allowed a pre-existing public.users row with the same email to
--     be re-linked to a new auth.users row. That flow is no longer meaningful
--     (the row's id would no longer match the new auth.users.id, violating
--     our users_id_auth_fkey FK).
--   - Now: ON CONFLICT (id) DO NOTHING — the only legitimate conflict is the
--     trigger firing twice for the same auth user (idempotent no-op).
--   - An email collision from an admin-created stub now raises a unique
--     constraint error. This is intentional; such collisions indicate
--     upstream bugs and should surface rather than be silently merged.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;


-- 2. Drop the column. Its unique index (users_auth_id_key) is dropped with it.
ALTER TABLE public.users DROP COLUMN auth_id;


-- 3. Verify.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'auth_id'
  ) THEN
    RAISE EXCEPTION 'FAIL: auth_id column still exists on public.users';
  END IF;
  RAISE NOTICE 'auth_id column dropped successfully.';
END $$;


-- After applying, regenerate Supabase TypeScript types:
--   npx supabase gen types typescript > types/supabase.ts
