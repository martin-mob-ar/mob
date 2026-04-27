-- Replaces user_mailing_preferences + guest_mailing_preferences with a single
-- unified mailing_preferences table keyed by email.
-- Email is always available (leads.email is NOT NULL) and serves as the
-- universal identifier for both guests and registered users.

-- Drop old split tables
DROP TABLE IF EXISTS public.user_mailing_preferences;
DROP TABLE IF EXISTS public.guest_mailing_preferences;

-- Unified table keyed by email
CREATE TABLE public.mailing_preferences (
  email                text        PRIMARY KEY,
  user_id              uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  name                 text,
  avg_price_ars        numeric,
  state_ids            integer[]   NOT NULL DEFAULT '{}',
  interactions_count   integer     NOT NULL DEFAULT 0,
  unsubscribed         boolean     NOT NULL DEFAULT false,
  last_email_sent_at   timestamptz,
  last_recomputed_at   timestamptz NOT NULL DEFAULT now(),
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- Prevent two rows for the same registered user
CREATE UNIQUE INDEX mailing_preferences_user_id_idx
  ON public.mailing_preferences (user_id) WHERE user_id IS NOT NULL;

-- Auto-link an existing guest row when they register (any signup method:
-- email/password, Google OAuth, etc.)
CREATE OR REPLACE FUNCTION public.link_mailing_preferences_on_signup()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.mailing_preferences
  SET user_id = NEW.id
  WHERE email = NEW.email AND user_id IS NULL;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_link_mailing
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.link_mailing_preferences_on_signup();
