-- Server-side phone lookup function for Truora webhook.
-- Matches by telefono directly, or by concatenating country code digits + telefono,
-- or by country code digits + '9' + telefono (Argentina mobile prefix).
CREATE OR REPLACE FUNCTION find_user_by_phone(p_phone text)
RETURNS TABLE(id uuid, name text, email text, telefono text, telefono_country_code text)
LANGUAGE sql STABLE AS $$
  SELECT u.id, u.name, u.email, u.telefono, u.telefono_country_code
  FROM public.users u
  WHERE u.telefono IS NOT NULL
  AND (
    u.telefono = p_phone
    OR regexp_replace(coalesce(u.telefono_country_code, ''), '[^0-9]', '', 'g') || u.telefono = p_phone
    OR regexp_replace(coalesce(u.telefono_country_code, ''), '[^0-9]', '', 'g') || '9' || u.telefono = p_phone
  )
  LIMIT 1;
$$;
