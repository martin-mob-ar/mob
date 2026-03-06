import { NextResponse } from 'next/server';
import { supabaseAdmin, getOrCreateUserFromAuth } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      profile_id,
      draftId,
      draft_step,
      type_id,
      address,
      geo_lat,
      geo_long,
      location_id,
      floor,
      apartment_door,
      room_amount,
      bathroom_amount,
      toilet_amount,
      suite_amount,
      parking_lot_amount,
      roofed_surface,
      total_surface,
      unroofed_surface,
      age,
      disposition,
      available_date,
      visit_days,
      visit_hours,
      description,
      publication_title,
      tagIds,
      photos,
      draftExtra,
    } = body;

    if (!profile_id) {
      return NextResponse.json({ error: 'profile_id es requerido' }, { status: 400 });
    }

    const resolvedUserId = await getOrCreateUserFromAuth(profile_id);

    // Merge draftExtra into extra_attributes.draft
    const extraAttributes = draftExtra ? { draft: draftExtra } : undefined;

    let propertyId: number;

    if (draftId) {
      // UPDATE existing draft — verify ownership first
      const { data: existing } = await supabaseAdmin
        .from('properties')
        .select('id, user_id')
        .eq('id', draftId)
        .eq('user_id', resolvedUserId)
        .not('draft_step', 'is', null)
        .maybeSingle();

      if (!existing) {
        return NextResponse.json({ error: 'Borrador no encontrado' }, { status: 404 });
      }

      const updateData: Record<string, unknown> = {
        draft_step: draft_step ?? null,
        updated_at: new Date().toISOString(),
      };
      if (type_id !== undefined) updateData.type_id = type_id ?? null;
      if (address !== undefined) updateData.address = address ?? null;
      if (geo_lat !== undefined) updateData.geo_lat = geo_lat ?? null;
      if (geo_long !== undefined) updateData.geo_long = geo_long ?? null;
      if (location_id !== undefined) updateData.location_id = location_id ?? null;
      if (floor !== undefined) updateData.floor = floor ?? null;
      if (apartment_door !== undefined) updateData.apartment_door = apartment_door ?? null;
      if (room_amount !== undefined) updateData.room_amount = room_amount ?? null;
      if (bathroom_amount !== undefined) updateData.bathroom_amount = bathroom_amount ?? null;
      if (toilet_amount !== undefined) updateData.toilet_amount = toilet_amount ?? null;
      if (suite_amount !== undefined) updateData.suite_amount = suite_amount ?? null;
      if (parking_lot_amount !== undefined) updateData.parking_lot_amount = parking_lot_amount ?? null;
      if (roofed_surface !== undefined) updateData.roofed_surface = roofed_surface ?? null;
      if (total_surface !== undefined) updateData.total_surface = total_surface ?? null;
      if (unroofed_surface !== undefined) updateData.unroofed_surface = unroofed_surface ?? null;
      if (age !== undefined) updateData.age = age ?? null;
      if (disposition !== undefined) updateData.disposition = disposition ?? null;
      if (available_date !== undefined) updateData.available_date = available_date ?? null;
      if (visit_days !== undefined) updateData.visit_days = visit_days ?? null;
      if (visit_hours !== undefined) updateData.visit_hours = visit_hours ?? null;
      if (description !== undefined) updateData.description = description ?? null;
      if (publication_title !== undefined) updateData.publication_title = publication_title ?? null;
      if (extraAttributes !== undefined) updateData.extra_attributes = extraAttributes;

      const { error: updateError } = await supabaseAdmin
        .from('properties')
        .update(updateData)
        .eq('id', draftId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      propertyId = draftId;
    } else {
      // INSERT new draft
      const { data: newProp, error: insertError } = await supabaseAdmin
        .from('properties')
        .insert({
          tokko: false,
          user_id: resolvedUserId,
          status: 0,
          draft_step: draft_step ?? 2,
          type_id: type_id ?? null,
          address: address ?? null,
          geo_lat: geo_lat ?? null,
          geo_long: geo_long ?? null,
          location_id: location_id ?? null,
          floor: floor ?? null,
          apartment_door: apartment_door ?? null,
          room_amount: room_amount ?? null,
          bathroom_amount: bathroom_amount ?? null,
          toilet_amount: toilet_amount ?? null,
          suite_amount: suite_amount ?? null,
          parking_lot_amount: parking_lot_amount ?? null,
          roofed_surface: roofed_surface ?? null,
          total_surface: total_surface ?? null,
          unroofed_surface: unroofed_surface ?? null,
          age: age ?? null,
          disposition: disposition ?? null,
          available_date: available_date ?? null,
          visit_days: visit_days ?? null,
          visit_hours: visit_hours ?? null,
          description: description ?? null,
          publication_title: publication_title ?? null,
          extra_attributes: extraAttributes ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (insertError || !newProp) {
        return NextResponse.json({ error: insertError?.message ?? 'Error al crear borrador' }, { status: 500 });
      }

      propertyId = newProp.id;
    }

    // Upsert tags: delete existing + insert new
    if (Array.isArray(tagIds)) {
      await supabaseAdmin
        .from('tokko_property_property_tag')
        .delete()
        .eq('property_id', propertyId);

      if (tagIds.length > 0) {
        const tagRows = tagIds.map((tagId: number) => ({
          property_id: propertyId,
          tag_id: Number(tagId),
        }));
        await supabaseAdmin.from('tokko_property_property_tag').insert(tagRows);
      }
    }

    // Upsert photos by storage_path
    if (Array.isArray(photos) && photos.length > 0) {
      for (const photo of photos as { publicUrl: string; storagePath: string; order: number; isCover: boolean }[]) {
        if (!photo.storagePath) continue;

        const { data: existing } = await supabaseAdmin
          .from('tokko_property_photo')
          .select('id')
          .eq('property_id', propertyId)
          .eq('storage_path', photo.storagePath)
          .maybeSingle();

        if (!existing) {
          await supabaseAdmin.from('tokko_property_photo').insert({
            property_id: propertyId,
            image: photo.publicUrl,
            original: photo.publicUrl,
            thumb: photo.publicUrl,
            storage_path: photo.storagePath,
            is_front_cover: photo.isCover ?? false,
            order: photo.order ?? 0,
            is_blueprint: false,
          });
        } else {
          // Update order and cover status
          await supabaseAdmin
            .from('tokko_property_photo')
            .update({ order: photo.order, is_front_cover: photo.isCover ?? false })
            .eq('id', existing.id);
        }
      }

      // Remove photos that are no longer in the list
      const currentPaths = photos.map((p: { storagePath: string }) => p.storagePath).filter(Boolean);
      if (currentPaths.length > 0) {
        await supabaseAdmin
          .from('tokko_property_photo')
          .delete()
          .eq('property_id', propertyId)
          .not('storage_path', 'in', `(${currentPaths.map(p => `"${p}"`).join(',')})`);
      }
    }

    return NextResponse.json({ id: propertyId });
  } catch (e) {
    console.error('[save-draft] Unhandled error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error al guardar borrador' },
      { status: 500 }
    );
  }
}
