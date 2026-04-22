-- ============================================================================
-- BASELINE MIGRATION — Full production schema snapshot
-- Generated: 2026-04-22
-- ============================================================================
-- This migration captures the complete production schema so that a fresh
-- Supabase branch can be bootstrapped from a single file.
-- ============================================================================


-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto"  WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_trgm"   WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "unaccent"  WITH SCHEMA extensions;


-- ============================================================================
-- 2. UTILITY FUNCTIONS (no table dependencies)
-- ============================================================================

-- 2a. immutable_unaccent — used by generated columns & indexes
CREATE OR REPLACE FUNCTION public.immutable_unaccent(text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
 SET search_path TO 'public'
AS $function$
  SELECT extensions.unaccent($1);
$function$;

-- 2b. generate_slug — generic slug builder
CREATE OR REPLACE FUNCTION public.generate_slug(input_name text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  IF input_name IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN trim(BOTH '-' FROM
    regexp_replace(
      regexp_replace(
        lower(translate(input_name,
          'áéíóúüñÁÉÍÓÚÜÑàèìòùÀÈÌÒÙâêîôûÂÊÎÔÛäëïöÄËÏÖ',
          'aeiouunAEIOUUNaeiouAEIOUaeiouAEIOUaeioAEIO')),
        '[^a-z0-9]+', '-', 'g'),
      '-+', '-', 'g')
  );
END;
$function$;

-- 2c. generate_property_slug — builds SEO-friendly property slugs
CREATE OR REPLACE FUNCTION public.generate_property_slug(p_type_name text, p_room_amount integer, p_location_name text, p_parent_location_name text, p_location_depth integer, p_property_id bigint)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_slug TEXT;
  v_type_part TEXT;
  v_rooms_part TEXT;
  v_location_part TEXT;
  v_parent_part TEXT;
BEGIN
  IF p_type_name IS NOT NULL THEN
    v_type_part := LOWER(unaccent(p_type_name));
    v_type_part := REGEXP_REPLACE(v_type_part, '[^a-z0-9]+', '-', 'g');
    v_type_part := TRIM(BOTH '-' FROM v_type_part);
  ELSE
    v_type_part := 'propiedad';
  END IF;

  IF p_room_amount IS NOT NULL AND p_room_amount = 1 THEN
    v_rooms_part := '1-ambiente';
  ELSIF p_room_amount IS NOT NULL AND p_room_amount > 1 THEN
    v_rooms_part := p_room_amount || '-ambientes';
  ELSE
    v_rooms_part := NULL;
  END IF;

  IF p_location_name IS NOT NULL THEN
    v_location_part := LOWER(unaccent(p_location_name));
    v_location_part := REGEXP_REPLACE(v_location_part, '[^a-z0-9]+', '-', 'g');
    v_location_part := TRIM(BOTH '-' FROM v_location_part);
  ELSE
    v_location_part := NULL;
  END IF;

  IF p_location_depth IS NOT NULL AND p_location_depth != 3 AND p_parent_location_name IS NOT NULL THEN
    v_parent_part := LOWER(unaccent(p_parent_location_name));
    v_parent_part := REGEXP_REPLACE(v_parent_part, '[^a-z0-9]+', '-', 'g');
    v_parent_part := TRIM(BOTH '-' FROM v_parent_part);
  ELSE
    v_parent_part := NULL;
  END IF;

  v_slug := v_type_part;
  IF v_rooms_part IS NOT NULL THEN
    v_slug := v_slug || '-' || v_rooms_part;
  END IF;
  IF v_location_part IS NOT NULL THEN
    v_slug := v_slug || '-' || v_location_part;
  END IF;
  IF v_parent_part IS NOT NULL THEN
    v_slug := v_slug || '-' || v_parent_part;
  END IF;
  v_slug := v_slug || '-' || p_property_id::TEXT;

  RETURN v_slug;
END;
$function$;

-- 2d. update_updated_at_column — generic trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 2e. set_location_slug — trigger function for location/state slug
CREATE OR REPLACE FUNCTION public.set_location_slug()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF (NEW.slug IS NULL OR NEW.slug = '') AND NEW.name IS NOT NULL THEN
    NEW.slug := generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$function$;


-- ============================================================================
-- 3. TABLES — Group 1: No foreign-key dependencies
-- ============================================================================

-- 3.1 account_type
CREATE TABLE public.account_type (
  id   smallint NOT NULL,
  name text     NOT NULL,
  CONSTRAINT account_type_pkey PRIMARY KEY (id)
);

-- 3.2 exchange_rates
CREATE TABLE public.exchange_rates (
  currency_pair text      NOT NULL,
  rate          numeric   NOT NULL,
  updated_at    timestamptz DEFAULT now(),
  CONSTRAINT exchange_rates_pkey PRIMARY KEY (currency_pair)
);

-- 3.3 tokko_country
CREATE TABLE public.tokko_country (
  id           integer NOT NULL,
  iso_code     text    NOT NULL,
  name         text    NOT NULL,
  resource_uri text,
  CONSTRAINT tokko_country_pkey PRIMARY KEY (id),
  CONSTRAINT tokko_country_iso_code_key UNIQUE (iso_code)
);

-- 3.4 tokko_location_type
CREATE TABLE public.tokko_location_type (
  code        text NOT NULL,
  description text,
  CONSTRAINT tokko_location_type_pkey PRIMARY KEY (code)
);

-- 3.5 tokko_operation_type
CREATE TABLE public.tokko_operation_type (
  id   integer NOT NULL,
  name text    NOT NULL,
  CONSTRAINT tokko_operation_type_pkey PRIMARY KEY (id)
);

-- 3.6 tokko_property_tag
CREATE TABLE public.tokko_property_tag (
  id   integer  NOT NULL,
  name text     NOT NULL,
  type smallint NOT NULL,
  CONSTRAINT tokko_property_tag_pkey PRIMARY KEY (id)
);

-- 3.7 tokko_property_type
CREATE TABLE public.tokko_property_type (
  id   integer NOT NULL,
  code text    NOT NULL,
  name text    NOT NULL,
  slug text,
  CONSTRAINT tokko_property_type_pkey PRIMARY KEY (id)
);

-- 3.8 cron_job_log
CREATE TABLE public.cron_job_log (
  id            bigint      NOT NULL GENERATED ALWAYS AS IDENTITY,
  job_name      text        NOT NULL,
  started_at    timestamptz NOT NULL DEFAULT now(),
  finished_at   timestamptz,
  status        text        NOT NULL DEFAULT 'running',
  stats         jsonb,
  error_message text,
  CONSTRAINT cron_job_log_pkey PRIMARY KEY (id),
  CONSTRAINT cron_job_log_status_check CHECK (status IN ('running','completed','failed'))
);

-- 3.9 cron_sync_log
CREATE TABLE public.cron_sync_log (
  id                   bigint      NOT NULL GENERATED ALWAYS AS IDENTITY,
  started_at           timestamptz NOT NULL DEFAULT now(),
  finished_at          timestamptz,
  status               text        NOT NULL DEFAULT 'running',
  chain_index          integer     NOT NULL DEFAULT 0,
  resume_cursor        jsonb,
  users_processed      integer     DEFAULT 0,
  companies_processed  integer     DEFAULT 0,
  properties_updated   integer     DEFAULT 0,
  properties_deleted   integer     DEFAULT 0,
  photos_added         integer     DEFAULT 0,
  photos_removed       integer     DEFAULT 0,
  errors               text[]      DEFAULT '{}',
  error_message        text,
  CONSTRAINT cron_sync_log_pkey PRIMARY KEY (id),
  CONSTRAINT cron_sync_log_status_check CHECK (status IN ('running','completed','failed','chained'))
);

-- 3.10 webhook_debug_log
CREATE TABLE public.webhook_debug_log (
  id            serial       NOT NULL,
  created_at    timestamptz  DEFAULT now(),
  raw_payload   jsonb,
  matched_branch text,
  sender_phone  text,
  user_id       text,
  visita_id     integer,
  error         text,
  CONSTRAINT webhook_debug_log_pkey PRIMARY KEY (id)
);


-- ============================================================================
-- 4. TABLES — Group 2: Depends on Group 1
-- ============================================================================

-- 4.1 tokko_state
CREATE TABLE public.tokko_state (
  id           integer NOT NULL,
  country_id   integer NOT NULL,
  name         text    NOT NULL,
  sap_code     text,
  resource_uri text,
  name_search  text,
  slug         text,
  CONSTRAINT tokko_state_pkey PRIMARY KEY (id),
  CONSTRAINT tokko_state_country_id_fkey FOREIGN KEY (country_id)
    REFERENCES public.tokko_country(id) ON DELETE CASCADE
);

-- 4.2 users
CREATE TABLE public.users (
  id                           uuid        NOT NULL DEFAULT uuid_generate_v4(),
  tokko_api_hash               text,
  name                         text,
  created_at                   timestamptz NOT NULL DEFAULT now(),
  updated_at                   timestamptz NOT NULL DEFAULT now(),
  dni                          text,
  telefono                     text,
  telefono_country_code        text,
  telefono_extension           text,
  sync_status                  text        NOT NULL DEFAULT 'idle',
  sync_message                 text,
  sync_properties_count        integer,
  email                        text        NOT NULL,
  logo                         text,
  tokko_email                  text,
  tokko_api_key_enc            text,
  sync_started_at              timestamptz,
  account_type                 smallint,
  tokko_last_sync_at           timestamptz,
  hoggax_last_verification_date timestamptz,
  sync_progress                jsonb,
  hoggax_max_rent_plus_expenses integer,
  hoggax_approved              boolean,
  truora_last_verification_date timestamptz,
  truora_document_verified     boolean,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_tokko_api_hash_key UNIQUE (tokko_api_hash),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_account_type_fkey FOREIGN KEY (account_type)
    REFERENCES public.account_type(id)
);


-- ============================================================================
-- 5. TABLES — Group 3: Depends on Group 2
-- ============================================================================

-- 5.1 tokko_location
CREATE TABLE public.tokko_location (
  id                 integer     NOT NULL,
  country_id         integer,
  state_id           integer,
  parent_location_id integer,
  name               text        NOT NULL,
  type_code          text,
  depth              smallint,
  resource_uri       text,
  weight             integer,
  zip_code           text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  name_search        text,
  slug               text,
  CONSTRAINT tokko_location_pkey PRIMARY KEY (id),
  CONSTRAINT tokko_location_country_id_fkey FOREIGN KEY (country_id)
    REFERENCES public.tokko_country(id) ON DELETE SET NULL,
  CONSTRAINT tokko_location_state_id_fkey FOREIGN KEY (state_id)
    REFERENCES public.tokko_state(id) ON DELETE SET NULL,
  CONSTRAINT tokko_location_parent_location_id_fkey FOREIGN KEY (parent_location_id)
    REFERENCES public.tokko_location(id) ON DELETE SET NULL,
  CONSTRAINT tokko_location_type_code_fkey FOREIGN KEY (type_code)
    REFERENCES public.tokko_location_type(code) ON DELETE SET NULL
);

-- 5.2 tokko_company
CREATE TABLE public.tokko_company (
  id                        serial      NOT NULL,
  user_id                   uuid        NOT NULL,
  tokko_key_enc             text,
  name                      text        NOT NULL,
  logo                      text,
  contact_info              text,
  email                     text,
  phone                     text,
  phone_country_code        text,
  address                   text,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  last_incremental_sync_at  timestamptz,
  CONSTRAINT tokko_company_pkey PRIMARY KEY (id),
  CONSTRAINT tokko_company_name_user_id_key UNIQUE (name, user_id),
  CONSTRAINT tokko_company_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- 5.3 verificaciones_hoggax
CREATE TABLE public.verificaciones_hoggax (
  id                           uuid        NOT NULL DEFAULT uuid_generate_v4(),
  user_id                      uuid        NOT NULL,
  flow_name                    text        NOT NULL,
  hoggax_max_rent_plus_expenses integer,
  hoggax_approved              boolean,
  dni                          text,
  genero                       text,
  situacion_laboral            text,
  antiguedad                   text,
  ingresos_mensuales           integer,
  hoggax_raw_response          jsonb,
  created_at                   timestamptz NOT NULL DEFAULT now(),
  reason_code                  text,
  message                      text,
  property_rent_plus_expenses  integer,
  "case"                       smallint,
  CONSTRAINT verificaciones_hoggax_pkey PRIMARY KEY (id),
  CONSTRAINT verificaciones_hoggax_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- 5.4 verificaciones_truora
CREATE TABLE public.verificaciones_truora (
  id                     uuid        NOT NULL DEFAULT uuid_generate_v4(),
  user_id                uuid        NOT NULL,
  flow_name              text        NOT NULL,
  status                 text,
  truora_document_verified boolean,
  validation_id          text,
  document_number        text,
  name                   text,
  last_name              text,
  gender                 text,
  document_type          text,
  date_of_birth          text,
  raw_response           jsonb,
  created_at             timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT verificaciones_truora_pkey PRIMARY KEY (id),
  CONSTRAINT verificaciones_truora_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- 5.5 user_mailing_preferences
CREATE TABLE public.user_mailing_preferences (
  user_id            uuid        NOT NULL,
  avg_price_ars      numeric,
  state_ids          integer[]   NOT NULL DEFAULT '{}',
  interactions_count integer     NOT NULL DEFAULT 0,
  unsubscribed       boolean     NOT NULL DEFAULT false,
  last_email_sent_at timestamptz,
  last_recomputed_at timestamptz NOT NULL DEFAULT now(),
  created_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_mailing_preferences_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_mailing_preferences_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE
);


-- ============================================================================
-- 6. TABLES — Group 4: Depends on above
-- ============================================================================

-- 6.1 properties
CREATE TABLE public.properties (
  id                        bigserial   NOT NULL,
  tokko_id                  integer,
  tokko                     boolean     NOT NULL DEFAULT false,
  user_id                   uuid        NOT NULL,
  location_id               integer,
  parent_division_location_id integer,
  type_id                   integer,
  address                   text,
  address_complement        text,
  real_address              text,
  fake_address              text,
  geo_lat                   text,
  geo_long                  text,
  gm_location_type          text,
  block_number              text,
  lot_number                text,
  floor                     text,
  apartment_door            text,
  age                       integer,
  room_amount               integer,
  bathroom_amount           integer,
  toilet_amount             integer,
  suite_amount              integer,
  total_suites              integer,
  suites_with_closets       integer,
  roofed_surface            text,
  semiroofed_surface        text,
  unroofed_surface          text,
  total_surface             text,
  surface                   text,
  surface_measurement       text,
  livable_area              text,
  floors_amount             integer,
  front_measure             text,
  depth_measure             text,
  private_area              text,
  common_area               text,
  parking_lot_amount        integer,
  covered_parking_lot       integer,
  uncovered_parking_lot     integer,
  parking_lot_condition     text,
  parking_lot_type          text,
  status                    integer     NOT NULL,
  situation                 text,
  is_denounced              boolean     DEFAULT false,
  is_starred_on_web         boolean     DEFAULT false,
  quality_level             text,
  location_level            text,
  property_condition        text,
  legally_checked           text,
  disposition               text,
  orientation               text,
  dining_room               integer,
  living_amount             integer,
  tv_rooms                  integer,
  guests_amount             integer,
  appartments_per_floor     integer,
  building                  text,
  publication_title         text,
  public_url                text,
  seo_description           text,
  seo_keywords              text,
  portal_footer             text,
  rich_description          text,
  description               text,
  web_price                 boolean     DEFAULT false,
  reference_code            text,
  zonification              text,
  extra_attributes          jsonb,
  custom_tags               jsonb,
  internal_data             jsonb,
  development               jsonb,
  occupation                jsonb,
  files                     jsonb,
  videos                    jsonb,
  created_at                timestamptz NOT NULL,
  deleted_at                timestamptz,
  updated_at                timestamptz DEFAULT now(),
  available_date            date,
  key_coordination          text,
  visit_days                text[],
  visit_hours               text[],
  slug                      text,
  company_id                integer,
  contact_phone             text,
  draft_step                integer,
  producer_email            text,
  producer_name             text,
  CONSTRAINT properties_pkey PRIMARY KEY (id),
  CONSTRAINT properties_tokko_id_user_id_key UNIQUE (tokko_id, user_id),
  CONSTRAINT properties_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT properties_location_id_fkey FOREIGN KEY (location_id)
    REFERENCES public.tokko_location(id) ON DELETE SET NULL,
  CONSTRAINT properties_parent_division_location_id_fkey FOREIGN KEY (parent_division_location_id)
    REFERENCES public.tokko_location(id) ON DELETE SET NULL,
  CONSTRAINT properties_type_id_fkey FOREIGN KEY (type_id)
    REFERENCES public.tokko_property_type(id) ON DELETE SET NULL,
  CONSTRAINT properties_company_id_fkey FOREIGN KEY (company_id)
    REFERENCES public.tokko_company(id)
);

-- 6.2 certificados_inquilino
CREATE TABLE public.certificados_inquilino (
  id                      text        NOT NULL,
  user_id                 uuid        NOT NULL,
  nombre_completo         text        NOT NULL,
  monto_aprobado          integer     NOT NULL,
  fecha_emision           timestamptz NOT NULL DEFAULT now(),
  fecha_vencimiento       timestamptz NOT NULL,
  estado                  text        NOT NULL DEFAULT 'ACTIVO',
  verificacion_hoggax_id  uuid,
  verificacion_truora_id  uuid,
  created_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT certificados_inquilino_pkey PRIMARY KEY (id),
  CONSTRAINT certificados_inquilino_estado_check CHECK (estado IN ('ACTIVO','REVOCADO')),
  CONSTRAINT certificados_inquilino_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT certificados_inquilino_verificacion_hoggax_id_fkey FOREIGN KEY (verificacion_hoggax_id)
    REFERENCES public.verificaciones_hoggax(id) ON DELETE SET NULL,
  CONSTRAINT certificados_inquilino_verificacion_truora_id_fkey FOREIGN KEY (verificacion_truora_id)
    REFERENCES public.verificaciones_truora(id) ON DELETE SET NULL
);


-- ============================================================================
-- 7. TABLES — Group 5: Depends on properties
-- ============================================================================

-- 7.1 operaciones
CREATE TABLE public.operaciones (
  id                  bigserial   NOT NULL,
  property_id         bigint      NOT NULL,
  tenant_id           uuid,
  status              text        NOT NULL DEFAULT 'available',
  start_date          date,
  end_date            date,
  duration_months     integer,
  currency            text,
  price               numeric,
  period              text        DEFAULT '0',
  is_promotional      boolean     DEFAULT false,
  secondary_currency  text,
  secondary_price     numeric,
  expenses            integer,
  cleaning_tax        numeric,
  fire_insurance_cost numeric,
  down_payment        numeric,
  custom1             text,
  credit_eligible     text,
  iptu                text,
  tokko_operation_id  bigint,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  ipc_adjustment      text,
  "planMobElegido"    text,
  min_start_date      date,
  CONSTRAINT operaciones_pkey PRIMARY KEY (id),
  CONSTRAINT operaciones_status_check CHECK (status IN ('available','rented','finished','cancelled')),
  CONSTRAINT operaciones_property_id_fkey FOREIGN KEY (property_id)
    REFERENCES public.properties(id) ON DELETE CASCADE,
  CONSTRAINT operaciones_tenant_id_fkey FOREIGN KEY (tenant_id)
    REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- 7.2 tokko_property_photo
CREATE TABLE public.tokko_property_photo (
  id               bigserial   NOT NULL,
  image            text        NOT NULL,
  original         text        NOT NULL,
  thumb            text        NOT NULL,
  description      text,
  is_blueprint     boolean     DEFAULT false,
  is_front_cover   boolean     DEFAULT false,
  "order"          integer     NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  property_id      bigint,
  storage_path     text,
  tokko_source_url text,
  CONSTRAINT tokko_property_photo_pkey PRIMARY KEY (id),
  CONSTRAINT tokko_property_photo_property_id_fkey FOREIGN KEY (property_id)
    REFERENCES public.properties(id) ON DELETE CASCADE
);

-- 7.3 tokko_property_video
CREATE TABLE public.tokko_property_video (
  id          bigserial   NOT NULL,
  url         text        NOT NULL,
  description text,
  "order"     integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  property_id bigint,
  CONSTRAINT tokko_property_video_pkey PRIMARY KEY (id),
  CONSTRAINT tokko_property_video_property_id_fkey FOREIGN KEY (property_id)
    REFERENCES public.properties(id) ON DELETE CASCADE
);

-- 7.4 tokko_property_file
CREATE TABLE public.tokko_property_file (
  id          bigserial   NOT NULL,
  url         text        NOT NULL,
  filename    text,
  file_type   text,
  "order"     integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  property_id bigint,
  CONSTRAINT tokko_property_file_pkey PRIMARY KEY (id),
  CONSTRAINT tokko_property_file_property_id_fkey FOREIGN KEY (property_id)
    REFERENCES public.properties(id) ON DELETE CASCADE
);

-- 7.5 tokko_property_property_tag
CREATE TABLE public.tokko_property_property_tag (
  tag_id      integer NOT NULL,
  property_id bigint  NOT NULL,
  CONSTRAINT tokko_property_property_tag_pkey PRIMARY KEY (property_id, tag_id),
  CONSTRAINT tokko_property_property_tag_tag_id_fkey FOREIGN KEY (tag_id)
    REFERENCES public.tokko_property_tag(id) ON DELETE CASCADE,
  CONSTRAINT tokko_property_property_tag_property_id_fkey FOREIGN KEY (property_id)
    REFERENCES public.properties(id) ON DELETE CASCADE
);

-- 7.6 favoritos
CREATE TABLE public.favoritos (
  id          bigserial   NOT NULL,
  user_id     uuid        NOT NULL,
  property_id bigint      NOT NULL,
  created_at  timestamptz DEFAULT now(),
  CONSTRAINT favoritos_pkey PRIMARY KEY (id),
  CONSTRAINT favoritos_user_id_property_id_key UNIQUE (user_id, property_id),
  CONSTRAINT favoritos_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT favoritos_property_id_fkey FOREIGN KEY (property_id)
    REFERENCES public.properties(id) ON DELETE CASCADE
);

-- 7.7 leads
CREATE TABLE public.leads (
  id                bigint      NOT NULL GENERATED ALWAYS AS IDENTITY,
  property_id       bigint      NOT NULL,
  owner_id          uuid        NOT NULL,
  type              text        NOT NULL,
  name              text        NOT NULL,
  email             text        NOT NULL,
  phone             text,
  country_code      text        DEFAULT '+54',
  message           text,
  source            text        NOT NULL DEFAULT 'web',
  tokko_status      text,
  notion_status     text,
  email_status      text,
  created_at        timestamptz DEFAULT now(),
  submitter_user_id uuid,
  CONSTRAINT leads_pkey PRIMARY KEY (id),
  CONSTRAINT leads_type_check CHECK (type IN ('visita','reserva')),
  CONSTRAINT leads_tokko_status_check CHECK (tokko_status IN ('sent','failed','skipped')),
  CONSTRAINT leads_notion_status_check CHECK (notion_status IN ('sent','failed','skipped')),
  CONSTRAINT leads_email_status_check CHECK (email_status IN ('sent','failed','skipped')),
  CONSTRAINT leads_property_id_fkey FOREIGN KEY (property_id)
    REFERENCES public.properties(id) ON DELETE SET NULL,
  CONSTRAINT leads_user_id_fkey FOREIGN KEY (owner_id)
    REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT leads_submitter_user_id_fkey FOREIGN KEY (submitter_user_id)
    REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- 7.8 property_events
CREATE TABLE public.property_events (
  id          bigserial   NOT NULL,
  property_id integer     NOT NULL,
  event_type  text        NOT NULL,
  user_id     uuid,
  session_id  text,
  metadata    jsonb,
  ip_hash     text,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT property_events_pkey PRIMARY KEY (id),
  CONSTRAINT property_events_event_type_check CHECK (event_type IN ('property_view','agendar_visita_click','agendar_visita_submit_started','agendar_visita_verification_requested','agendar_visita_submit')),
  CONSTRAINT property_events_property_id_fkey FOREIGN KEY (property_id)
    REFERENCES public.properties(id) ON DELETE CASCADE,
  CONSTRAINT property_events_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users(id) ON DELETE SET NULL
);

-- 7.9 properties_read (denormalized — no FK constraints)
CREATE TABLE public.properties_read (
  property_id              bigint      NOT NULL,
  user_id                  uuid        NOT NULL,
  description              text,
  address                  text,
  geo_lat                  numeric,
  geo_long                 numeric,
  property_type_id         integer,
  property_type_name       text,
  location_id              integer,
  location_name            text,
  state_name               text,
  country_name             text,
  cover_photo_url          text,
  cover_photo_thumb        text,
  operacion_id             bigint,
  currency                 text,
  price                    numeric,
  secondary_currency       text,
  secondary_price          numeric,
  expenses                 integer,
  valor_total_primary      numeric,
  valor_total_secondary    numeric,
  room_amount              integer,
  bathroom_amount          integer,
  parking_lot_amount       integer,
  total_surface            numeric,
  tag_names_type_1         text[],
  tag_names_type_2         text[],
  tag_names_type_3         text[],
  all_tag_ids              integer[],
  property_status          integer,
  operacion_status         text,
  property_created_at      timestamptz,
  property_updated_at      timestamptz,
  listing_updated_at       timestamptz DEFAULT now(),
  suite_amount             integer,
  roofed_surface           numeric,
  slug                     text,
  parent_location_name     text,
  age                      integer,
  company_name             text,
  company_logo             text,
  contact_phone            text,
  min_start_date           date,
  mob_plan                 text        NOT NULL DEFAULT 'basico',
  owner_account_type       smallint,
  owner_verified           boolean     NOT NULL DEFAULT true,
  tokko_id                 bigint,
  sort_priority            integer     NOT NULL DEFAULT 2,
  visit_days               text[]      DEFAULT '{}',
  visit_hours              text[]      DEFAULT '{}',
  orientation              text,
  ipc_adjustment           text,
  duration_months          integer,
  owner_name               text,
  location_slug            text,
  state_slug               text,
  state_id                 integer,
  toilet_amount            integer,
  views_count              integer     NOT NULL DEFAULT 0,
  CONSTRAINT properties_read_pkey PRIMARY KEY (property_id)
);


-- ============================================================================
-- 8. TABLES — Group 6: Circular dependency (visitas <-> visita_proposals)
-- ============================================================================

-- 8.1 visitas (without the whatsapp_pending_proposal_id FK)
CREATE TABLE public.visitas (
  id                            bigint      NOT NULL GENERATED ALWAYS AS IDENTITY,
  property_id                   bigint      NOT NULL,
  operacion_id                  bigint,
  requester_user_id             uuid,
  requester_name                text        NOT NULL,
  requester_email               text        NOT NULL,
  requester_phone               text,
  requester_country_code        text        DEFAULT '+54',
  owner_user_id                 uuid        NOT NULL,
  status                        text        NOT NULL DEFAULT 'pending',
  confirmed_date                date,
  confirmed_time                time,
  created_at                    timestamptz NOT NULL DEFAULT now(),
  updated_at                    timestamptz NOT NULL DEFAULT now(),
  whatsapp_state                text,
  whatsapp_pending_proposal_id  bigint,
  reminder_24h_sent_at          timestamptz,
  reminder_2h_sent_at           timestamptz,
  postvisit_sent_at             timestamptz,
  owner_wa_context              text,
  requester_wa_context          text,
  owner_feedback                text,
  requester_feedback            text,
  CONSTRAINT visitas_pkey PRIMARY KEY (id),
  CONSTRAINT visitas_status_check CHECK (status IN ('pending','accepted','declined','cancelled','completed')),
  CONSTRAINT visitas_property_id_fkey FOREIGN KEY (property_id)
    REFERENCES public.properties(id) ON DELETE CASCADE,
  CONSTRAINT visitas_operacion_id_fkey FOREIGN KEY (operacion_id)
    REFERENCES public.operaciones(id) ON DELETE SET NULL,
  CONSTRAINT visitas_requester_user_id_fkey FOREIGN KEY (requester_user_id)
    REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT visitas_owner_user_id_fkey FOREIGN KEY (owner_user_id)
    REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- 8.2 visita_proposals
CREATE TABLE public.visita_proposals (
  id            bigint      NOT NULL GENERATED ALWAYS AS IDENTITY,
  visita_id     bigint      NOT NULL,
  proposed_by   text        NOT NULL,
  proposed_date date        NOT NULL,
  proposed_time time        NOT NULL,
  message       text,
  status        text        NOT NULL DEFAULT 'pending',
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT visita_proposals_pkey PRIMARY KEY (id),
  CONSTRAINT visita_proposals_proposed_by_check CHECK (proposed_by IN ('requester','owner')),
  CONSTRAINT visita_proposals_status_check CHECK (status IN ('pending','accepted','declined','superseded')),
  CONSTRAINT visita_proposals_visita_id_fkey FOREIGN KEY (visita_id)
    REFERENCES public.visitas(id) ON DELETE CASCADE
);

-- 8.3 Now add the circular FK from visitas → visita_proposals
ALTER TABLE public.visitas
  ADD CONSTRAINT visitas_whatsapp_pending_proposal_id_fkey
  FOREIGN KEY (whatsapp_pending_proposal_id)
  REFERENCES public.visita_proposals(id);


-- ============================================================================
-- 9. FK: users.id → auth.users(id)
--    (auth.users always exists in Supabase; adding as ALTER TABLE at the end)
-- ============================================================================

ALTER TABLE public.users
  ADD CONSTRAINT users_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- ============================================================================
-- 10. INDEXES (non-PK, non-unique-constraint)
-- ============================================================================

-- certificados_inquilino
CREATE INDEX idx_certificados_inquilino_active ON public.certificados_inquilino USING btree (user_id, estado) WHERE (estado = 'ACTIVO');
CREATE INDEX idx_certificados_inquilino_user_id ON public.certificados_inquilino USING btree (user_id);

-- cron_job_log
CREATE INDEX idx_cron_job_log_job_started ON public.cron_job_log USING btree (job_name, started_at DESC);

-- cron_sync_log
CREATE INDEX idx_cron_sync_log_started_at ON public.cron_sync_log USING btree (started_at DESC);

-- favoritos
CREATE INDEX favoritos_property_id_idx ON public.favoritos USING btree (property_id);
CREATE INDEX favoritos_user_id_idx ON public.favoritos USING btree (user_id);

-- leads
CREATE INDEX idx_leads_property_id ON public.leads USING btree (property_id);
CREATE INDEX idx_leads_submitter_user_id ON public.leads USING btree (submitter_user_id);
CREATE INDEX idx_leads_user_id ON public.leads USING btree (owner_id);

-- operaciones
CREATE INDEX idx_operaciones_price ON public.operaciones USING btree (price);
CREATE INDEX idx_operaciones_property_id ON public.operaciones USING btree (property_id);
CREATE INDEX idx_operaciones_status ON public.operaciones USING btree (status);
CREATE INDEX idx_operaciones_tenant_id ON public.operaciones USING btree (tenant_id);

-- properties
CREATE INDEX idx_properties_company_id ON public.properties USING btree (company_id);
CREATE INDEX idx_properties_location_id ON public.properties USING btree (location_id);
CREATE INDEX idx_properties_parent_division_location_id ON public.properties USING btree (parent_division_location_id);
CREATE INDEX idx_properties_status ON public.properties USING btree (status);
CREATE INDEX idx_properties_tokko_id ON public.properties USING btree (tokko_id);
CREATE INDEX idx_properties_type_id ON public.properties USING btree (type_id);
CREATE INDEX idx_properties_user_id ON public.properties USING btree (user_id);

-- properties_read
CREATE INDEX idx_properties_read_bathrooms ON public.properties_read USING btree (bathroom_amount);
CREATE INDEX idx_properties_read_currency ON public.properties_read USING btree (currency);
CREATE INDEX idx_properties_read_location ON public.properties_read USING btree (location_id);
CREATE INDEX idx_properties_read_operacion_status ON public.properties_read USING btree (operacion_status);
CREATE INDEX idx_properties_read_owner_verified ON public.properties_read USING btree (owner_verified) WHERE (owner_verified = true);
CREATE INDEX idx_properties_read_parking ON public.properties_read USING btree (parking_lot_amount);
CREATE INDEX idx_properties_read_price ON public.properties_read USING btree (price);
CREATE INDEX idx_properties_read_property_type ON public.properties_read USING btree (property_type_id);
CREATE INDEX idx_properties_read_rooms ON public.properties_read USING btree (room_amount);
CREATE UNIQUE INDEX idx_properties_read_slug ON public.properties_read USING btree (slug);
CREATE INDEX idx_properties_read_sort_priority_created ON public.properties_read USING btree (sort_priority, property_created_at DESC);
CREATE INDEX idx_properties_read_state_name ON public.properties_read USING btree (state_name);
CREATE INDEX idx_properties_read_suite_amount ON public.properties_read USING btree (suite_amount) WHERE (suite_amount IS NOT NULL);
CREATE INDEX idx_properties_read_surface ON public.properties_read USING btree (total_surface);
CREATE INDEX idx_properties_read_user_id ON public.properties_read USING btree (user_id);
CREATE INDEX idx_properties_read_valor_total_primary ON public.properties_read USING btree (valor_total_primary);

-- property_events
CREATE INDEX property_events_created_at_idx ON public.property_events USING btree (created_at DESC);
CREATE INDEX property_events_property_type_date_idx ON public.property_events USING btree (property_id, event_type, created_at DESC);

-- tokko_company
CREATE INDEX idx_tokko_company_user_id ON public.tokko_company USING btree (user_id);

-- tokko_location
CREATE INDEX idx_tokko_location_country_id ON public.tokko_location USING btree (country_id);
CREATE INDEX idx_tokko_location_name_search ON public.tokko_location USING gin (name_search gin_trgm_ops);
CREATE INDEX idx_tokko_location_parent_id ON public.tokko_location USING btree (parent_location_id);
CREATE INDEX idx_tokko_location_slug ON public.tokko_location USING btree (slug) WHERE (slug IS NOT NULL);
CREATE INDEX idx_tokko_location_state_id ON public.tokko_location USING btree (state_id);
CREATE INDEX idx_tokko_location_type_code ON public.tokko_location USING btree (type_code);

-- tokko_property_file
CREATE INDEX idx_tokko_property_file_property_id ON public.tokko_property_file USING btree (property_id);

-- tokko_property_photo
CREATE INDEX idx_tokko_property_photo_property_id ON public.tokko_property_photo USING btree (property_id);
CREATE UNIQUE INDEX uq_property_photo_storage_path ON public.tokko_property_photo USING btree (property_id, storage_path) WHERE (storage_path IS NOT NULL);

-- tokko_property_property_tag
CREATE INDEX idx_tokko_property_property_tag_tag_id ON public.tokko_property_property_tag USING btree (tag_id);

-- tokko_property_type
CREATE UNIQUE INDEX idx_property_type_slug ON public.tokko_property_type USING btree (slug) WHERE (slug IS NOT NULL);

-- tokko_property_video
CREATE INDEX idx_tokko_property_video_property_id ON public.tokko_property_video USING btree (property_id);

-- tokko_state
CREATE INDEX idx_tokko_state_country_id ON public.tokko_state USING btree (country_id);
CREATE INDEX idx_tokko_state_name_search ON public.tokko_state USING gin (name_search gin_trgm_ops);
CREATE INDEX idx_tokko_state_slug ON public.tokko_state USING btree (slug) WHERE (slug IS NOT NULL);

-- user_mailing_preferences
CREATE INDEX idx_user_mailing_prefs_active ON public.user_mailing_preferences USING btree (unsubscribed, interactions_count) WHERE (unsubscribed = false AND interactions_count >= 2);

-- users
CREATE INDEX idx_users_account_type ON public.users USING btree (account_type);
CREATE UNIQUE INDEX users_telefono_unique ON public.users USING btree (telefono_country_code, telefono) WHERE (telefono IS NOT NULL);

-- verificaciones_hoggax
CREATE INDEX idx_verificaciones_hoggax_user_id ON public.verificaciones_hoggax USING btree (user_id);

-- verificaciones_truora
CREATE INDEX idx_verificaciones_truora_user_id ON public.verificaciones_truora USING btree (user_id);

-- visita_proposals
CREATE INDEX idx_visita_proposals_visita_id ON public.visita_proposals USING btree (visita_id);

-- visitas
CREATE INDEX idx_visitas_operacion_id ON public.visitas USING btree (operacion_id);
CREATE INDEX idx_visitas_owner_user_id ON public.visitas USING btree (owner_user_id);
CREATE INDEX idx_visitas_property_id ON public.visitas USING btree (property_id);
CREATE INDEX idx_visitas_requester_user_id ON public.visitas USING btree (requester_user_id);
CREATE INDEX idx_visitas_status ON public.visitas USING btree (status);
CREATE INDEX idx_visitas_whatsapp_pending_proposal_id ON public.visitas USING btree (whatsapp_pending_proposal_id);


-- ============================================================================
-- 11. FUNCTIONS (that depend on tables)
-- ============================================================================

-- 11.1 check_email_exists
CREATE OR REPLACE FUNCTION public.check_email_exists(email_input text)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists(
    select 1 from auth.users where lower(email) = lower(email_input)
  );
$function$;

-- 11.2 handle_new_auth_user
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

-- 11.3 get_usd_ars_rate
CREATE OR REPLACE FUNCTION public.get_usd_ars_rate()
 RETURNS numeric
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT rate FROM exchange_rates WHERE currency_pair = 'USD_ARS'),
    1
  );
$function$;

-- 11.4 get_unique_tags_from_listings
CREATE OR REPLACE FUNCTION public.get_unique_tags_from_listings(p_user_id uuid)
 RETURNS text[]
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  WITH all_tags AS (
    SELECT DISTINCT unnest(tag_names_type_1) as tag_name
    FROM properties_read
    WHERE user_id = p_user_id
      AND tag_names_type_1 IS NOT NULL
      AND array_length(tag_names_type_1, 1) > 0

    UNION

    SELECT DISTINCT unnest(tag_names_type_2) as tag_name
    FROM properties_read
    WHERE user_id = p_user_id
      AND tag_names_type_2 IS NOT NULL
      AND array_length(tag_names_type_2, 1) > 0

    UNION

    SELECT DISTINCT unnest(tag_names_type_3) as tag_name
    FROM properties_read
    WHERE user_id = p_user_id
      AND tag_names_type_3 IS NOT NULL
      AND array_length(tag_names_type_3, 1) > 0
  )
  SELECT array_agg(tag_name ORDER BY tag_name)
  FROM all_tags
  WHERE tag_name IS NOT NULL
$function$;

-- 11.5 rebuild_property_listing
CREATE OR REPLACE FUNCTION public.rebuild_property_listing(p_property_id bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_user_id UUID;
  v_status INTEGER;
  v_slug TEXT;
BEGIN
  SELECT user_id, status INTO v_user_id, v_status
  FROM properties WHERE id = p_property_id;

  IF NOT FOUND OR v_status != 2 THEN
    DELETE FROM properties_read WHERE property_id = p_property_id;
    RETURN;
  END IF;

  INSERT INTO properties_read (
    property_id, user_id, tokko_id, description, address,
    geo_lat, geo_long, property_type_id, property_type_name,
    location_id, location_name, parent_location_name, state_name, country_name,
    cover_photo_url, cover_photo_thumb,
    operacion_id, currency, price, secondary_currency, secondary_price, expenses,
    valor_total_primary, valor_total_secondary,
    room_amount, bathroom_amount, suite_amount, parking_lot_amount, toilet_amount, total_surface, roofed_surface,
    tag_names_type_1, tag_names_type_2, tag_names_type_3, all_tag_ids,
    property_status, operacion_status,
    property_created_at, property_updated_at, listing_updated_at,
    slug, age, company_name, company_logo, contact_phone,
    min_start_date, mob_plan,
    owner_verified, owner_account_type,
    sort_priority,
    visit_days, visit_hours, orientation,
    ipc_adjustment, duration_months,
    owner_name, location_slug, state_slug, state_id,
    views_count
  )
  SELECT
    p.id, p.user_id, p.tokko_id, p.description,
    COALESCE(NULLIF(p.fake_address, ''), p.address, p.real_address),
    CASE WHEN p.geo_lat ~ '^-?[0-9]+\.?[0-9]*$' THEN p.geo_lat::NUMERIC ELSE NULL END,
    CASE WHEN p.geo_long ~ '^-?[0-9]+\.?[0-9]*$' THEN p.geo_long::NUMERIC ELSE NULL END,
    pt.id, pt.name, l.id, l.name, pl.name, s.name, c.name,
    photo.image, photo.thumb,
    o.id, o.currency, o.price, o.secondary_currency, o.secondary_price, o.expenses,
    CASE WHEN o.currency = 'USD' THEN o.price * get_usd_ars_rate() + COALESCE(o.expenses,0)
         ELSE o.price + COALESCE(o.expenses,0) END,
    COALESCE(o.secondary_price,0) + COALESCE(o.expenses,0),
    p.room_amount, p.bathroom_amount, p.suite_amount, p.parking_lot_amount, p.toilet_amount,
    CASE WHEN p.total_surface ~ '^[0-9]+\.?[0-9]*$' THEN p.total_surface::NUMERIC ELSE NULL END,
    CASE WHEN p.roofed_surface ~ '^[0-9]+\.?[0-9]*$' THEN p.roofed_surface::NUMERIC ELSE NULL END,
    COALESCE(ARRAY_AGG(DISTINCT tag1.name) FILTER (WHERE tag1.type=1),'{}'),
    COALESCE(ARRAY_AGG(DISTINCT tag2.name) FILTER (WHERE tag2.type=2),'{}'),
    COALESCE(ARRAY_AGG(DISTINCT tag3.name) FILTER (WHERE tag3.type=3),'{}'),
    COALESCE(ARRAY_AGG(DISTINCT ppt.tag_id) FILTER (WHERE ppt.tag_id IS NOT NULL),'{}'),
    p.status, o.status,
    p.created_at, p.updated_at, NOW(),
    generate_property_slug(pt.name, p.room_amount, l.name, pl.name, l.depth, p.id),
    p.age, tc.name, tc.logo, p.contact_phone,
    o.min_start_date,
    COALESCE(o."planMobElegido", 'basico'),
    CASE
      WHEN u.account_type IN (1, 2) AND (u.hoggax_last_verification_date IS NULL OR u.truora_last_verification_date IS NULL) THEN false
      ELSE true
    END,
    u.account_type,
    CASE
      WHEN COALESCE(o."planMobElegido", 'basico') = 'experiencia' AND u.account_type IN (1, 2) THEN 1
      WHEN COALESCE(o."planMobElegido", 'basico') = 'experiencia' AND u.account_type IN (3, 4) THEN 2
      WHEN COALESCE(o."planMobElegido", 'basico') = 'acompanado'  AND u.account_type IN (1, 2) THEN 3
      WHEN COALESCE(o."planMobElegido", 'basico') = 'acompanado'  AND u.account_type IN (3, 4) THEN 4
      WHEN u.account_type IN (1, 2) THEN 5
      ELSE 6
    END,
    p.visit_days, p.visit_hours, p.orientation,
    o.ipc_adjustment, o.duration_months,
    u.name, l.slug, s.slug, s.id,
    COALESCE((
      SELECT SUM(CASE
        WHEN pe.metadata->>'source' = 'clarity_backfill' THEN (pe.metadata->>'count')::int
        ELSE 1
      END)
      FROM property_events pe
      WHERE pe.property_id = p_property_id AND pe.event_type = 'property_view'
    ), 0)::integer
  FROM properties p
  LEFT JOIN users u ON p.user_id = u.id
  LEFT JOIN tokko_property_type pt ON p.type_id = pt.id
  LEFT JOIN tokko_location l ON p.location_id = l.id
  LEFT JOIN tokko_location pl ON l.parent_location_id = pl.id
  LEFT JOIN tokko_state s ON l.state_id = s.id
  LEFT JOIN tokko_country c ON l.country_id = c.id
  LEFT JOIN LATERAL (
    SELECT image, thumb FROM tokko_property_photo
    WHERE property_id = p.id ORDER BY "order" LIMIT 1
  ) photo ON true
  LEFT JOIN LATERAL (
    SELECT * FROM operaciones WHERE property_id = p.id ORDER BY created_at DESC LIMIT 1
  ) o ON true
  LEFT JOIN tokko_property_property_tag ppt ON p.id = ppt.property_id
  LEFT JOIN tokko_property_tag tag1 ON ppt.tag_id = tag1.id AND tag1.type = 1
  LEFT JOIN tokko_property_tag tag2 ON ppt.tag_id = tag2.id AND tag2.type = 2
  LEFT JOIN tokko_property_tag tag3 ON ppt.tag_id = tag3.id AND tag3.type = 3
  LEFT JOIN tokko_company tc ON p.company_id = tc.id
  WHERE p.id = p_property_id AND p.status = 2
  GROUP BY p.id, p.tokko_id, pt.id, pt.name, l.id, l.name, l.depth, l.slug, pl.name, s.name, s.id, s.slug, c.name,
           photo.image, photo.thumb,
           o.id, o.currency, o.price, o.secondary_currency, o.secondary_price,
           o.expenses, o.status, o.min_start_date, o."planMobElegido", o.ipc_adjustment, o.duration_months,
           tc.name, tc.logo,
           u.account_type, u.hoggax_last_verification_date, u.truora_last_verification_date, u.name
  ON CONFLICT (property_id) DO UPDATE SET
    user_id=EXCLUDED.user_id, tokko_id=EXCLUDED.tokko_id, description=EXCLUDED.description,
    address=EXCLUDED.address, geo_lat=EXCLUDED.geo_lat, geo_long=EXCLUDED.geo_long,
    property_type_id=EXCLUDED.property_type_id, property_type_name=EXCLUDED.property_type_name,
    location_id=EXCLUDED.location_id, location_name=EXCLUDED.location_name,
    parent_location_name=EXCLUDED.parent_location_name,
    state_name=EXCLUDED.state_name, country_name=EXCLUDED.country_name,
    cover_photo_url=EXCLUDED.cover_photo_url, cover_photo_thumb=EXCLUDED.cover_photo_thumb,
    operacion_id=EXCLUDED.operacion_id, currency=EXCLUDED.currency, price=EXCLUDED.price,
    secondary_currency=EXCLUDED.secondary_currency, secondary_price=EXCLUDED.secondary_price,
    expenses=EXCLUDED.expenses, valor_total_primary=EXCLUDED.valor_total_primary,
    valor_total_secondary=EXCLUDED.valor_total_secondary,
    room_amount=EXCLUDED.room_amount, bathroom_amount=EXCLUDED.bathroom_amount,
    suite_amount=EXCLUDED.suite_amount, parking_lot_amount=EXCLUDED.parking_lot_amount,
    toilet_amount=EXCLUDED.toilet_amount,
    total_surface=EXCLUDED.total_surface, roofed_surface=EXCLUDED.roofed_surface,
    tag_names_type_1=EXCLUDED.tag_names_type_1, tag_names_type_2=EXCLUDED.tag_names_type_2,
    tag_names_type_3=EXCLUDED.tag_names_type_3, all_tag_ids=EXCLUDED.all_tag_ids,
    property_status=EXCLUDED.property_status, operacion_status=EXCLUDED.operacion_status,
    property_created_at=EXCLUDED.property_created_at, property_updated_at=EXCLUDED.property_updated_at,
    listing_updated_at=NOW(), slug=EXCLUDED.slug, age=EXCLUDED.age,
    company_name=EXCLUDED.company_name, company_logo=EXCLUDED.company_logo,
    contact_phone=EXCLUDED.contact_phone, min_start_date=EXCLUDED.min_start_date,
    mob_plan=EXCLUDED.mob_plan,
    owner_verified=EXCLUDED.owner_verified,
    owner_account_type=EXCLUDED.owner_account_type,
    sort_priority=EXCLUDED.sort_priority,
    visit_days=EXCLUDED.visit_days, visit_hours=EXCLUDED.visit_hours, orientation=EXCLUDED.orientation,
    ipc_adjustment=EXCLUDED.ipc_adjustment, duration_months=EXCLUDED.duration_months,
    owner_name=EXCLUDED.owner_name, location_slug=EXCLUDED.location_slug,
    state_slug=EXCLUDED.state_slug, state_id=EXCLUDED.state_id,
    views_count=EXCLUDED.views_count;

  SELECT slug INTO v_slug FROM properties_read WHERE property_id = p_property_id;
  IF v_slug IS NOT NULL THEN
    UPDATE properties SET slug = v_slug WHERE id = p_property_id;
  END IF;
END;
$function$;

-- 11.6 rebuild_all_property_listings
CREATE OR REPLACE FUNCTION public.rebuild_all_property_listings()
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  row_count INTEGER;
  prop_record RECORD;
BEGIN
  TRUNCATE properties_read;

  FOR prop_record IN
    SELECT id FROM properties WHERE status = 2
  LOOP
    PERFORM rebuild_property_listing(prop_record.id);
  END LOOP;

  SELECT COUNT(*) INTO row_count FROM properties_read;

  RAISE NOTICE 'Rebuilt % property listings', row_count;

  RETURN row_count;
END;
$function$;

-- 11.7 rebuild_user_property_listings
CREATE OR REPLACE FUNCTION public.rebuild_user_property_listings(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  row_count INTEGER := 0;
  prop_record RECORD;
BEGIN
  DELETE FROM properties_read WHERE user_id = p_user_id;

  FOR prop_record IN
    SELECT id FROM properties WHERE status = 2 AND user_id = p_user_id
  LOOP
    PERFORM rebuild_property_listing(prop_record.id);
    row_count := row_count + 1;
  END LOOP;

  RETURN row_count;
END;
$function$;

-- 11.8 rebuild_usd_property_listings
CREATE OR REPLACE FUNCTION public.rebuild_usd_property_listings()
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  row_count INTEGER := 0;
  prop_id BIGINT;
BEGIN
  FOR prop_id IN
    SELECT DISTINCT p.id
    FROM properties p
    JOIN operaciones o ON o.property_id = p.id
    WHERE p.status = 2
      AND o.currency = 'USD'
  LOOP
    PERFORM rebuild_property_listing(prop_id);
    row_count := row_count + 1;
  END LOOP;

  RAISE NOTICE 'Rebuilt % USD property listings', row_count;
  RETURN row_count;
END;
$function$;

-- 11.9 batch_sync_properties
CREATE OR REPLACE FUNCTION public.batch_sync_properties(p_user_id uuid, p_company_id integer, p_properties jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_prop JSONB;
  v_property_id BIGINT;
  v_location_id INTEGER;
  v_parent_div_id INTEGER;
  v_parent_div_match TEXT;
  v_rent_ops JSONB;
  v_op JSONB;
  v_prices JSONB;
  v_primary_price JSONB;
  v_secondary_price JSONB;
  v_synced INTEGER := 0;
  v_skipped INTEGER := 0;
  v_errors TEXT[] := '{}';
BEGIN
  INSERT INTO tokko_property_type (id, code, name)
  SELECT DISTINCT
    (p->'type'->>'id')::INTEGER,
    p->'type'->>'code',
    p->'type'->>'name'
  FROM jsonb_array_elements(p_properties) AS p
  WHERE p->'type' IS NOT NULL
    AND p->'type'->>'id' IS NOT NULL
    AND (p->'type'->>'id')::TEXT != 'null'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO tokko_property_tag (id, name, type)
  SELECT DISTINCT
    (tag->>'id')::INTEGER,
    tag->>'name',
    (tag->>'type')::SMALLINT
  FROM jsonb_array_elements(p_properties) AS p,
       jsonb_array_elements(COALESCE(p->'tags', '[]'::jsonb)) AS tag
  WHERE tag->>'id' IS NOT NULL
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type;

  INSERT INTO tokko_operation_type (id, name)
  SELECT DISTINCT
    (op->>'operation_id')::INTEGER,
    op->>'operation_type'
  FROM jsonb_array_elements(p_properties) AS p,
       jsonb_array_elements(COALESCE(p->'operations', '[]'::jsonb)) AS op
  WHERE op->>'operation_id' IS NOT NULL
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  FOR v_prop IN SELECT * FROM jsonb_array_elements(p_properties)
  LOOP
    BEGIN
      v_location_id := NULL;
      v_parent_div_id := NULL;

      IF v_prop->'location' IS NOT NULL AND v_prop->'location'->>'id' IS NOT NULL THEN
        SELECT id INTO v_location_id
        FROM tokko_location
        WHERE id = (v_prop->'location'->>'id')::INTEGER;

        IF v_location_id IS NULL THEN
          v_skipped := v_skipped + 1;
          CONTINUE;
        END IF;

        v_parent_div_match := v_prop->'location'->>'parent_division';
        IF v_parent_div_match IS NOT NULL THEN
          v_parent_div_match := (regexp_match(v_parent_div_match, '/location/(\d+)/'))[1];
          IF v_parent_div_match IS NOT NULL THEN
            SELECT id INTO v_parent_div_id
            FROM tokko_location
            WHERE id = v_parent_div_match::INTEGER;
          END IF;
        END IF;
      END IF;

      INSERT INTO properties (
        tokko_id, tokko, user_id, company_id,
        location_id, parent_division_location_id, type_id,
        address, address_complement, real_address, fake_address,
        geo_lat, geo_long, gm_location_type,
        block_number, lot_number, floor, apartment_door,
        age, room_amount, bathroom_amount, toilet_amount,
        suite_amount, total_suites, suites_with_closets,
        roofed_surface, semiroofed_surface, unroofed_surface,
        total_surface, surface, surface_measurement, livable_area,
        floors_amount, front_measure, depth_measure,
        private_area, common_area,
        parking_lot_amount, covered_parking_lot, uncovered_parking_lot,
        parking_lot_condition, parking_lot_type,
        status, situation, is_denounced, is_starred_on_web,
        quality_level, location_level, property_condition, legally_checked,
        disposition, orientation,
        dining_room, living_amount, tv_rooms, guests_amount, appartments_per_floor,
        building, publication_title, public_url,
        seo_description, seo_keywords, portal_footer,
        rich_description, description,
        web_price, reference_code, zonification,
        extra_attributes, custom_tags, internal_data,
        development, occupation, files, videos,
        contact_phone, producer_email, producer_name,
        created_at, deleted_at, updated_at
      )
      VALUES (
        (v_prop->>'id')::INTEGER,
        TRUE,
        p_user_id,
        p_company_id,
        v_location_id,
        v_parent_div_id,
        CASE WHEN v_prop->'type' IS NOT NULL AND v_prop->'type'->>'id' IS NOT NULL
             THEN (v_prop->'type'->>'id')::INTEGER ELSE NULL END,
        v_prop->>'address',
        v_prop->>'address_complement',
        v_prop->>'real_address',
        v_prop->>'fake_address',
        v_prop->>'geo_lat',
        v_prop->>'geo_long',
        v_prop->>'gm_location_type',
        v_prop->>'block_number',
        v_prop->>'lot_number',
        v_prop->>'floor',
        v_prop->>'apartment_door',
        (v_prop->>'age')::INTEGER,
        (v_prop->>'room_amount')::INTEGER,
        (v_prop->>'bathroom_amount')::INTEGER,
        (v_prop->>'toilet_amount')::INTEGER,
        (v_prop->>'suite_amount')::INTEGER,
        (v_prop->>'total_suites')::INTEGER,
        (v_prop->>'suites_with_closets')::INTEGER,
        v_prop->>'roofed_surface',
        v_prop->>'semiroofed_surface',
        v_prop->>'unroofed_surface',
        v_prop->>'total_surface',
        v_prop->>'surface',
        v_prop->>'surface_measurement',
        v_prop->>'livable_area',
        (v_prop->>'floors_amount')::INTEGER,
        v_prop->>'front_measure',
        v_prop->>'depth_measure',
        v_prop->>'private_area',
        v_prop->>'common_area',
        (v_prop->>'parking_lot_amount')::INTEGER,
        (v_prop->>'covered_parking_lot')::INTEGER,
        (v_prop->>'uncovered_parking_lot')::INTEGER,
        v_prop->>'parking_lot_condition',
        v_prop->>'parking_lot_type',
        (v_prop->>'status')::INTEGER,
        v_prop->>'situation',
        COALESCE((v_prop->>'is_denounced')::BOOLEAN, FALSE),
        COALESCE((v_prop->>'is_starred_on_web')::BOOLEAN, FALSE),
        v_prop->>'quality_level',
        v_prop->>'location_level',
        v_prop->>'property_condition',
        v_prop->>'legally_checked',
        v_prop->>'disposition',
        v_prop->>'orientation',
        (v_prop->>'dining_room')::INTEGER,
        (v_prop->>'living_amount')::INTEGER,
        (v_prop->>'tv_rooms')::INTEGER,
        (v_prop->>'guests_amount')::INTEGER,
        (v_prop->>'appartments_per_floor')::INTEGER,
        v_prop->>'building',
        v_prop->>'publication_title',
        v_prop->>'public_url',
        v_prop->>'seo_description',
        v_prop->>'seo_keywords',
        v_prop->>'portal_footer',
        v_prop->>'rich_description',
        v_prop->>'description',
        COALESCE((v_prop->>'web_price')::BOOLEAN, FALSE),
        v_prop->>'reference_code',
        v_prop->>'zonification',
        CASE WHEN jsonb_typeof(v_prop->'extra_attributes') = 'array' THEN v_prop->'extra_attributes' ELSE NULL END,
        CASE WHEN jsonb_typeof(v_prop->'custom_tags') = 'array' THEN v_prop->'custom_tags' ELSE NULL END,
        CASE WHEN jsonb_typeof(v_prop->'internal_data') = 'object' THEN v_prop->'internal_data' ELSE NULL END,
        CASE WHEN v_prop->'development' IS NOT NULL AND jsonb_typeof(v_prop->'development') != 'null' THEN v_prop->'development' ELSE NULL END,
        CASE WHEN jsonb_typeof(v_prop->'occupation') = 'array' THEN v_prop->'occupation' ELSE NULL END,
        CASE WHEN jsonb_typeof(v_prop->'files') = 'array' THEN v_prop->'files' ELSE NULL END,
        CASE WHEN jsonb_typeof(v_prop->'videos') = 'array' THEN v_prop->'videos' ELSE NULL END,
        COALESCE(
          NULLIF(v_prop->'producer'->>'cellphone', ''),
          NULLIF(v_prop->'producer'->>'phone', ''),
          NULLIF(TRIM(
            COALESCE(v_prop->'branch'->>'phone_country_code', '') ||
            COALESCE(v_prop->'branch'->>'phone_area', '') ||
            COALESCE(v_prop->'branch'->>'phone', '')
          ), '')
        ),
        NULLIF(v_prop->'producer'->>'email', ''),
        NULLIF(v_prop->'producer'->>'name', ''),
        (v_prop->>'created_at')::TIMESTAMPTZ,
        CASE WHEN v_prop->>'deleted_at' IS NOT NULL AND v_prop->>'deleted_at' != '' THEN (v_prop->>'deleted_at')::TIMESTAMPTZ ELSE NULL END,
        CASE WHEN v_prop->>'updated_at' IS NOT NULL AND v_prop->>'updated_at' != '' THEN (v_prop->>'updated_at')::TIMESTAMPTZ ELSE NULL END
      )
      ON CONFLICT (tokko_id, user_id) DO UPDATE SET
        company_id = EXCLUDED.company_id,
        location_id = EXCLUDED.location_id,
        parent_division_location_id = EXCLUDED.parent_division_location_id,
        type_id = EXCLUDED.type_id,
        address = EXCLUDED.address,
        address_complement = EXCLUDED.address_complement,
        real_address = EXCLUDED.real_address,
        fake_address = EXCLUDED.fake_address,
        geo_lat = EXCLUDED.geo_lat,
        geo_long = EXCLUDED.geo_long,
        gm_location_type = EXCLUDED.gm_location_type,
        block_number = EXCLUDED.block_number,
        lot_number = EXCLUDED.lot_number,
        floor = EXCLUDED.floor,
        apartment_door = EXCLUDED.apartment_door,
        age = EXCLUDED.age,
        room_amount = EXCLUDED.room_amount,
        bathroom_amount = EXCLUDED.bathroom_amount,
        toilet_amount = EXCLUDED.toilet_amount,
        suite_amount = EXCLUDED.suite_amount,
        total_suites = EXCLUDED.total_suites,
        suites_with_closets = EXCLUDED.suites_with_closets,
        roofed_surface = EXCLUDED.roofed_surface,
        semiroofed_surface = EXCLUDED.semiroofed_surface,
        unroofed_surface = EXCLUDED.unroofed_surface,
        total_surface = EXCLUDED.total_surface,
        surface = EXCLUDED.surface,
        surface_measurement = EXCLUDED.surface_measurement,
        livable_area = EXCLUDED.livable_area,
        floors_amount = EXCLUDED.floors_amount,
        front_measure = EXCLUDED.front_measure,
        depth_measure = EXCLUDED.depth_measure,
        private_area = EXCLUDED.private_area,
        common_area = EXCLUDED.common_area,
        parking_lot_amount = EXCLUDED.parking_lot_amount,
        covered_parking_lot = EXCLUDED.covered_parking_lot,
        uncovered_parking_lot = EXCLUDED.uncovered_parking_lot,
        parking_lot_condition = EXCLUDED.parking_lot_condition,
        parking_lot_type = EXCLUDED.parking_lot_type,
        status = EXCLUDED.status,
        situation = EXCLUDED.situation,
        is_denounced = EXCLUDED.is_denounced,
        is_starred_on_web = EXCLUDED.is_starred_on_web,
        quality_level = EXCLUDED.quality_level,
        location_level = EXCLUDED.location_level,
        property_condition = EXCLUDED.property_condition,
        legally_checked = EXCLUDED.legally_checked,
        disposition = EXCLUDED.disposition,
        orientation = EXCLUDED.orientation,
        dining_room = EXCLUDED.dining_room,
        living_amount = EXCLUDED.living_amount,
        tv_rooms = EXCLUDED.tv_rooms,
        guests_amount = EXCLUDED.guests_amount,
        appartments_per_floor = EXCLUDED.appartments_per_floor,
        building = EXCLUDED.building,
        publication_title = EXCLUDED.publication_title,
        public_url = EXCLUDED.public_url,
        seo_description = EXCLUDED.seo_description,
        seo_keywords = EXCLUDED.seo_keywords,
        portal_footer = EXCLUDED.portal_footer,
        rich_description = EXCLUDED.rich_description,
        description = EXCLUDED.description,
        web_price = EXCLUDED.web_price,
        reference_code = EXCLUDED.reference_code,
        zonification = EXCLUDED.zonification,
        extra_attributes = EXCLUDED.extra_attributes,
        custom_tags = EXCLUDED.custom_tags,
        internal_data = EXCLUDED.internal_data,
        development = EXCLUDED.development,
        occupation = EXCLUDED.occupation,
        files = EXCLUDED.files,
        videos = EXCLUDED.videos,
        contact_phone = EXCLUDED.contact_phone,
        producer_email = EXCLUDED.producer_email,
        producer_name = EXCLUDED.producer_name,
        created_at = EXCLUDED.created_at,
        deleted_at = EXCLUDED.deleted_at,
        updated_at = EXCLUDED.updated_at
      RETURNING id INTO v_property_id;

      DELETE FROM operaciones
      WHERE property_id = v_property_id AND status = 'available';

      IF v_prop->'operations' IS NOT NULL AND jsonb_array_length(v_prop->'operations') > 0 THEN
        SELECT COALESCE(jsonb_agg(op), '[]'::jsonb)
        INTO v_rent_ops
        FROM jsonb_array_elements(v_prop->'operations') AS op
        WHERE (op->>'operation_id')::INTEGER = 2;

        IF jsonb_array_length(v_rent_ops) > 0 THEN
          FOR v_op IN SELECT * FROM jsonb_array_elements(v_rent_ops)
          LOOP
            v_prices := COALESCE(v_op->'prices', '[]'::jsonb);
            v_primary_price := v_prices->0;
            v_secondary_price := v_prices->1;

            INSERT INTO operaciones (
              property_id, tokko_operation_id, status,
              currency, price, period, is_promotional,
              secondary_currency, secondary_price,
              expenses, cleaning_tax, fire_insurance_cost,
              down_payment, custom1, credit_eligible, iptu,
              "planMobElegido"
            ) VALUES (
              v_property_id,
              (v_op->>'operation_id')::BIGINT,
              'available',
              v_primary_price->>'currency',
              (v_primary_price->>'price')::NUMERIC,
              COALESCE(
                CASE WHEN v_primary_price->>'period' IS NOT NULL
                     THEN (v_primary_price->>'period')::TEXT
                     ELSE NULL END,
                '0'
              ),
              COALESCE((v_primary_price->>'is_promotional')::BOOLEAN, FALSE),
              v_secondary_price->>'currency',
              (v_secondary_price->>'price')::NUMERIC,
              (v_prop->>'expenses')::INTEGER,
              CASE WHEN v_prop->>'cleaning_tax' ~ '^\d+\.?\d*$'
                   THEN (v_prop->>'cleaning_tax')::NUMERIC ELSE NULL END,
              CASE WHEN v_prop->>'fire_insurance_cost' ~ '^\d+\.?\d*$'
                   THEN (v_prop->>'fire_insurance_cost')::NUMERIC ELSE NULL END,
              CASE WHEN v_prop->>'down_payment' ~ '^\d+\.?\d*$'
                   THEN (v_prop->>'down_payment')::NUMERIC ELSE NULL END,
              v_prop->>'custom1',
              v_prop->>'credit_eligible',
              v_prop->>'iptu',
              'basico'
            );
          END LOOP;
        ELSE
          INSERT INTO operaciones (
            property_id, status,
            expenses, cleaning_tax, fire_insurance_cost,
            down_payment, custom1, credit_eligible, iptu,
            "planMobElegido"
          ) VALUES (
            v_property_id, 'available',
            (v_prop->>'expenses')::INTEGER,
            CASE WHEN v_prop->>'cleaning_tax' ~ '^\d+\.?\d*$' THEN (v_prop->>'cleaning_tax')::NUMERIC ELSE NULL END,
            CASE WHEN v_prop->>'fire_insurance_cost' ~ '^\d+\.?\d*$' THEN (v_prop->>'fire_insurance_cost')::NUMERIC ELSE NULL END,
            CASE WHEN v_prop->>'down_payment' ~ '^\d+\.?\d*$' THEN (v_prop->>'down_payment')::NUMERIC ELSE NULL END,
            v_prop->>'custom1',
            v_prop->>'credit_eligible',
            v_prop->>'iptu',
            'basico'
          );
        END IF;
      ELSE
        INSERT INTO operaciones (
          property_id, status,
          expenses, cleaning_tax, fire_insurance_cost,
          down_payment, custom1, credit_eligible, iptu,
          "planMobElegido"
        ) VALUES (
          v_property_id, 'available',
          (v_prop->>'expenses')::INTEGER,
          CASE WHEN v_prop->>'cleaning_tax' ~ '^\d+\.?\d*$' THEN (v_prop->>'cleaning_tax')::NUMERIC ELSE NULL END,
          CASE WHEN v_prop->>'fire_insurance_cost' ~ '^\d+\.?\d*$' THEN (v_prop->>'fire_insurance_cost')::NUMERIC ELSE NULL END,
          CASE WHEN v_prop->>'down_payment' ~ '^\d+\.?\d*$' THEN (v_prop->>'down_payment')::NUMERIC ELSE NULL END,
          v_prop->>'custom1',
          v_prop->>'credit_eligible',
          v_prop->>'iptu',
          'basico'
        );
      END IF;

      IF v_prop->'tags' IS NOT NULL AND jsonb_array_length(v_prop->'tags') > 0 THEN
        INSERT INTO tokko_property_property_tag (property_id, tag_id)
        SELECT v_property_id, (tag->>'id')::INTEGER
        FROM jsonb_array_elements(v_prop->'tags') AS tag
        ON CONFLICT (property_id, tag_id) DO NOTHING;
      END IF;

      DELETE FROM tokko_property_photo WHERE property_id = v_property_id;

      IF v_prop->'photos' IS NOT NULL AND jsonb_array_length(v_prop->'photos') > 0 THEN
        INSERT INTO tokko_property_photo (
          property_id, image, original, thumb,
          description, is_blueprint, is_front_cover, "order", storage_path,
          tokko_source_url
        )
        SELECT
          v_property_id,
          photo->>'image',
          photo->>'original',
          photo->>'thumb',
          photo->>'description',
          COALESCE((photo->>'is_blueprint')::BOOLEAN, FALSE),
          (photo->>'order')::INTEGER = 0,
          (photo->>'order')::INTEGER,
          NULL,
          photo->>'original'
        FROM jsonb_array_elements(v_prop->'photos') AS photo;
      END IF;

      v_synced := v_synced + 1;

    EXCEPTION WHEN OTHERS THEN
      v_errors := array_append(v_errors, format('Property %s: %s', v_prop->>'id', SQLERRM));
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'synced', v_synced,
    'skipped', v_skipped,
    'errors', to_jsonb(v_errors)
  );
END;
$function$;

-- 11.10 bulk_update_photo_urls
CREATE OR REPLACE FUNCTION public.bulk_update_photo_urls(p_updates jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE tokko_property_photo AS t
  SET
    storage_path = u.storage_path,
    image = u.url,
    original = u.url,
    thumb = u.url
  FROM jsonb_to_recordset(p_updates) AS u(id BIGINT, storage_path TEXT, url TEXT)
  WHERE t.id = u.id;
END;
$function$;

-- 11.11 disable_listing_triggers
CREATE OR REPLACE FUNCTION public.disable_listing_triggers()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  ALTER TABLE properties DISABLE TRIGGER trg_properties_sync_listing;
  ALTER TABLE operaciones DISABLE TRIGGER trg_operaciones_sync_listing;
  ALTER TABLE tokko_property_property_tag DISABLE TRIGGER trg_tags_sync_listing;
  ALTER TABLE tokko_property_photo DISABLE TRIGGER trg_photos_sync_listing;
END;
$function$;

-- 11.12 enable_listing_triggers
CREATE OR REPLACE FUNCTION public.enable_listing_triggers()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  ALTER TABLE properties ENABLE TRIGGER trg_properties_sync_listing;
  ALTER TABLE operaciones ENABLE TRIGGER trg_operaciones_sync_listing;
  ALTER TABLE tokko_property_property_tag ENABLE TRIGGER trg_tags_sync_listing;
  ALTER TABLE tokko_property_photo ENABLE TRIGGER trg_photos_sync_listing;
END;
$function$;

-- 11.13 increment_property_views_count
CREATE OR REPLACE FUNCTION public.increment_property_views_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.event_type = 'property_view' THEN
    IF NEW.user_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM properties WHERE id = NEW.property_id AND user_id = NEW.user_id
    ) THEN
      RETURN NEW;
    END IF;

    UPDATE properties_read
       SET views_count = views_count + 1
     WHERE property_id = NEW.property_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- 11.14 sync_listing_on_property_change
CREATE OR REPLACE FUNCTION public.sync_listing_on_property_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    DELETE FROM properties_read WHERE property_id = OLD.id;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.status != 2 THEN
      DELETE FROM properties_read WHERE property_id = NEW.id;
    ELSE
      PERFORM rebuild_property_listing(NEW.id);
    END IF;
    RETURN NEW;
  END IF;
END;
$function$;

-- 11.15 sync_listing_on_operacion_change
CREATE OR REPLACE FUNCTION public.sync_listing_on_operacion_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM rebuild_property_listing(OLD.property_id);
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM rebuild_property_listing(NEW.property_id);
    RETURN NEW;
  END IF;
END;
$function$;

-- 11.16 sync_listing_on_tag_change
CREATE OR REPLACE FUNCTION public.sync_listing_on_tag_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM rebuild_property_listing(OLD.property_id);
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    PERFORM rebuild_property_listing(NEW.property_id);
    RETURN NEW;
  END IF;
END;
$function$;

-- 11.17 sync_listing_on_photo_change
CREATE OR REPLACE FUNCTION public.sync_listing_on_photo_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM rebuild_property_listing(OLD.property_id);
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM rebuild_property_listing(NEW.property_id);
    RETURN NEW;
  END IF;
END;
$function$;

-- 11.18 sync_listings_on_user_verification_change
CREATE OR REPLACE FUNCTION public.sync_listings_on_user_verification_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.hoggax_last_verification_date IS DISTINCT FROM NEW.hoggax_last_verification_date
     OR OLD.truora_last_verification_date IS DISTINCT FROM NEW.truora_last_verification_date
     OR OLD.account_type IS DISTINCT FROM NEW.account_type THEN
    PERFORM rebuild_property_listing(p.id)
    FROM properties p
    WHERE p.user_id = NEW.id AND p.status = 2;
  END IF;
  RETURN NEW;
END;
$function$;


-- ============================================================================
-- 12. TRIGGERS
-- ============================================================================

-- operaciones
CREATE TRIGGER trg_operaciones_sync_listing
  AFTER INSERT OR DELETE OR UPDATE ON public.operaciones
  FOR EACH ROW EXECUTE FUNCTION public.sync_listing_on_operacion_change();

CREATE TRIGGER update_operaciones_updated_at
  BEFORE UPDATE ON public.operaciones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- properties
CREATE TRIGGER trg_properties_sync_listing
  AFTER INSERT OR DELETE OR UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.sync_listing_on_property_change();

-- property_events
CREATE TRIGGER trg_increment_views_count
  AFTER INSERT ON public.property_events
  FOR EACH ROW EXECUTE FUNCTION public.increment_property_views_count();

-- tokko_location
CREATE TRIGGER trg_location_slug
  BEFORE INSERT OR UPDATE OF name ON public.tokko_location
  FOR EACH ROW EXECUTE FUNCTION public.set_location_slug();

-- tokko_property_photo
CREATE TRIGGER trg_photos_sync_listing
  AFTER INSERT OR DELETE OR UPDATE ON public.tokko_property_photo
  FOR EACH ROW EXECUTE FUNCTION public.sync_listing_on_photo_change();

-- tokko_property_property_tag
CREATE TRIGGER trg_tags_sync_listing
  AFTER INSERT OR DELETE ON public.tokko_property_property_tag
  FOR EACH ROW EXECUTE FUNCTION public.sync_listing_on_tag_change();

-- tokko_state
CREATE TRIGGER trg_state_slug
  BEFORE INSERT OR UPDATE OF name ON public.tokko_state
  FOR EACH ROW EXECUTE FUNCTION public.set_location_slug();

-- users
CREATE TRIGGER trg_user_verification_sync_listings
  AFTER UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_listings_on_user_verification_change();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- visitas
CREATE TRIGGER set_visitas_updated_at
  BEFORE UPDATE ON public.visitas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================================
-- 13. AUTH TRIGGER (on auth.users)
-- ============================================================================

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


-- ============================================================================
-- 14. ROW-LEVEL SECURITY — Enable on all tables
-- ============================================================================

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
ALTER TABLE public.user_mailing_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verificaciones_hoggax ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verificaciones_truora ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visita_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_debug_log ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 15. RLS POLICIES
-- ============================================================================

-- account_type
CREATE POLICY "Anyone can view account_type"
  ON public.account_type FOR SELECT
  TO anon, authenticated
  USING (true);

-- cron_job_log
CREATE POLICY "Anyone can read cron_job_log"
  ON public.cron_job_log FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role full access"
  ON public.cron_job_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- cron_sync_log
CREATE POLICY "Service role only"
  ON public.cron_sync_log FOR ALL
  TO public
  USING (false);

-- exchange_rates
CREATE POLICY "Anyone can view exchange_rates"
  ON public.exchange_rates FOR SELECT
  TO anon, authenticated
  USING (true);

-- favoritos
CREATE POLICY "User can manage own favoritos"
  ON public.favoritos FOR ALL
  TO public
  USING (user_id = (SELECT auth.uid()));

-- leads
CREATE POLICY "Users can view own leads"
  ON public.leads FOR SELECT
  TO public
  USING (owner_id = (SELECT auth.uid()) OR submitter_user_id = (SELECT auth.uid()));

-- operaciones
CREATE POLICY "Users can view own operaciones"
  ON public.operaciones FOR SELECT
  TO public
  USING (tenant_id = (SELECT auth.uid()) OR property_id IN (SELECT id FROM properties WHERE user_id = (SELECT auth.uid())));

-- properties
CREATE POLICY "Users can view own properties"
  ON public.properties FOR SELECT
  TO public
  USING (user_id = (SELECT auth.uid()));

-- properties_read
CREATE POLICY "Anyone can view properties_read"
  ON public.properties_read FOR SELECT
  TO public
  USING (true);

-- tokko_company
CREATE POLICY "Users can view own company"
  ON public.tokko_company FOR SELECT
  TO public
  USING (user_id = (SELECT auth.uid()));

-- tokko_country
CREATE POLICY "Anyone can view tokko_country"
  ON public.tokko_country FOR SELECT
  TO anon, authenticated
  USING (true);

-- tokko_location
CREATE POLICY "Anyone can view tokko_location"
  ON public.tokko_location FOR SELECT
  TO anon, authenticated
  USING (true);

-- tokko_location_type
CREATE POLICY "Anyone can view tokko_location_type"
  ON public.tokko_location_type FOR SELECT
  TO anon, authenticated
  USING (true);

-- tokko_operation_type
CREATE POLICY "Anyone can view tokko_operation_type"
  ON public.tokko_operation_type FOR SELECT
  TO anon, authenticated
  USING (true);

-- tokko_property_file
CREATE POLICY "Users can view own property files"
  ON public.tokko_property_file FOR SELECT
  TO public
  USING (property_id IN (SELECT id FROM properties WHERE user_id = (SELECT auth.uid())));

-- tokko_property_photo
CREATE POLICY "Anyone can view photos"
  ON public.tokko_property_photo FOR SELECT
  TO public
  USING (true);

-- tokko_property_property_tag
CREATE POLICY "Users can view own property tags"
  ON public.tokko_property_property_tag FOR SELECT
  TO public
  USING (property_id IN (SELECT id FROM properties WHERE user_id = (SELECT auth.uid())));

-- tokko_property_tag
CREATE POLICY "Anyone can view tokko_property_tag"
  ON public.tokko_property_tag FOR SELECT
  TO anon, authenticated
  USING (true);

-- tokko_property_type
CREATE POLICY "Anyone can view property types"
  ON public.tokko_property_type FOR SELECT
  TO public
  USING (true);

-- tokko_property_video
CREATE POLICY "Users can view own property videos"
  ON public.tokko_property_video FOR SELECT
  TO public
  USING (property_id IN (SELECT id FROM properties WHERE user_id = (SELECT auth.uid())));

-- tokko_state
CREATE POLICY "Anyone can view tokko_state"
  ON public.tokko_state FOR SELECT
  TO anon, authenticated
  USING (true);

-- users
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  TO public
  USING (id = (SELECT auth.uid()));

-- verificaciones_hoggax
CREATE POLICY "Service role only"
  ON public.verificaciones_hoggax FOR ALL
  TO public
  USING (false);

-- verificaciones_truora
CREATE POLICY "Service role only"
  ON public.verificaciones_truora FOR ALL
  TO public
  USING (false);

-- visita_proposals
CREATE POLICY "Users can view own visita proposals"
  ON public.visita_proposals FOR SELECT
  TO public
  USING (visita_id IN (SELECT id FROM visitas WHERE owner_user_id = (SELECT auth.uid()) OR requester_user_id = (SELECT auth.uid())));

-- visitas
CREATE POLICY "Users can view own visitas"
  ON public.visitas FOR SELECT
  TO public
  USING (owner_user_id = (SELECT auth.uid()) OR requester_user_id = (SELECT auth.uid()));

-- webhook_debug_log
CREATE POLICY "Service role only"
  ON public.webhook_debug_log FOR ALL
  TO public
  USING (false);

-- NOTE: Tables without policies (property_events, user_mailing_preferences,
-- certificados_inquilino) have RLS enabled but NO policies — meaning only
-- service_role can access them. This is intentional.
