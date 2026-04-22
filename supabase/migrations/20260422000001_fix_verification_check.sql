-- Fix owner_verified check in rebuild_property_listing to use boolean flags
-- instead of date timestamps, matching the client-side isVerified logic.
-- Also update the trigger to watch the correct columns.

-- 1. Update rebuild_property_listing: use truora_document_verified and hoggax_approved
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
      WHEN u.account_type IN (1, 2) AND (u.truora_document_verified IS NOT TRUE OR u.hoggax_approved IS NOT TRUE) THEN false
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
           u.account_type, u.truora_document_verified, u.hoggax_approved, u.name
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

-- 2. Update trigger function to watch boolean flags instead of date columns
CREATE OR REPLACE FUNCTION public.sync_listings_on_user_verification_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.truora_document_verified IS DISTINCT FROM NEW.truora_document_verified
     OR OLD.hoggax_approved IS DISTINCT FROM NEW.hoggax_approved
     OR OLD.account_type IS DISTINCT FROM NEW.account_type THEN
    PERFORM rebuild_property_listing(p.id)
    FROM properties p
    WHERE p.user_id = NEW.id AND p.status = 2;
  END IF;
  RETURN NEW;
END;
$function$;
