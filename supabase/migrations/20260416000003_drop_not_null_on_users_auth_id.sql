-- Make public.users.auth_id nullable so app code can stop writing it before
-- the next migration drops the column entirely. The trigger still writes
-- auth_id for new signups (harmless), but any manual INSERT/UPSERT that omits
-- auth_id (such as the getOrCreateUserFromAuth fallback in lib/supabase/server.ts)
-- will now succeed.
ALTER TABLE public.users ALTER COLUMN auth_id DROP NOT NULL;
