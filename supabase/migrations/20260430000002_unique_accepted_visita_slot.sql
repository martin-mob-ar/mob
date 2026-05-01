-- Prevent double-booking: ensure no two accepted visitas occupy the same
-- property + date + time slot.  This acts as a database-level safety net
-- against race conditions that application-level checks cannot fully prevent.

CREATE UNIQUE INDEX idx_visitas_unique_accepted_slot
  ON public.visitas (property_id, confirmed_date, confirmed_time)
  WHERE status = 'accepted'
    AND confirmed_date IS NOT NULL
    AND confirmed_time IS NOT NULL;
