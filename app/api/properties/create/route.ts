import { NextResponse } from 'next/server';
import { supabaseAdmin, getOrCreateUserFromAuth } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/supabase/auth';
import { movePhoto, getPublicUrl } from '@/lib/storage/gcs';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, 'properties-create', 10, 60_000);
    if (!rl.success) return rateLimitResponse(rl.resetIn);

    // Auth: verify cookie-based session
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      profile_id,
      draftId,
      type_id,
      price,
      currency,
      expenses,
      address,
      address_complement,
      geo_lat,
      geo_long,
      location_id,
      gm_location_type,
      room_amount,
      bathroom_amount,
      toilet_amount,
      suite_amount,
      parking_lot_amount,
      total_surface,
      roofed_surface,
      semiroofed_surface,
      unroofed_surface,
      age,
      floors_amount,
      disposition,
      floor,
      apartment_door,
      photos: photosInput,
      photoUrls,
      videoUrls,
      tagIds,
      description,
      rich_description,
      publication_title,
      reference_code,
      available_date,
      key_coordination,
      visit_days,
      visit_hours,
      duration_months,
      ipc_adjustment,
      selectedPlan,
    } = body;

    // Use the authenticated user's ID, ignoring any profile_id from the body
    const effectiveAuthId = authUser.id;

    console.log('[properties/create] Resolving user for auth_id:', effectiveAuthId);
    const resolvedUserId = await getOrCreateUserFromAuth(effectiveAuthId);
    console.log('[properties/create] Resolved user_id:', resolvedUserId);

    let propertyId: number;

    if (draftId) {
      // Publishing a draft: update existing property to published status
      console.log('[properties/create] Publishing draft property:', draftId);
      const { data: updatedProp, error: updateError } = await supabaseAdmin
        .from('properties')
        .update({
          status: 2,
          draft_step: null,
          type_id: type_id ?? null,
          address: address ?? null,
          address_complement: address_complement ?? null,
          geo_lat: geo_lat ?? null,
          geo_long: geo_long ?? null,
          location_id: location_id ?? null,
          gm_location_type: gm_location_type ?? null,
          room_amount: room_amount ?? null,
          bathroom_amount: bathroom_amount ?? null,
          toilet_amount: toilet_amount ?? null,
          suite_amount: suite_amount ?? null,
          parking_lot_amount: parking_lot_amount ?? null,
          total_surface: total_surface ?? null,
          roofed_surface: roofed_surface ?? null,
          semiroofed_surface: semiroofed_surface ?? null,
          unroofed_surface: unroofed_surface ?? null,
          age: age ?? null,
          floors_amount: floors_amount ?? null,
          disposition: disposition ?? null,
          floor: floor ?? null,
          apartment_door: apartment_door ?? null,
          available_date: available_date ?? null,
          key_coordination: key_coordination ?? null,
          visit_days: visit_days ?? null,
          visit_hours: visit_hours ?? null,
          description: description ?? null,
          rich_description: rich_description ?? null,
          publication_title: publication_title ?? null,
          reference_code: reference_code ?? null,
          extra_attributes: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', draftId)
        .eq('user_id', resolvedUserId)
        .select('id')
        .single();

      if (updateError || !updatedProp) {
        console.error('[properties/create] Draft publish error:', updateError);
        return NextResponse.json(
          { error: updateError?.message || 'Error al publicar la propiedad' },
          { status: 500 }
        );
      }

      propertyId = updatedProp.id;
      console.log('[properties/create] Draft published as property:', propertyId);
    } else {
      // New property: insert fresh
      console.log('[properties/create] Inserting property...');
      const { data: property, error: propError } = await supabaseAdmin
        .from('properties')
        .insert({
          tokko_id: null,
          tokko: false,
          user_id: resolvedUserId,
          type_id: type_id ?? null,
          address: address ?? null,
          address_complement: address_complement ?? null,
          geo_lat: geo_lat ?? null,
          geo_long: geo_long ?? null,
          location_id: location_id ?? null,
          gm_location_type: gm_location_type ?? null,
          room_amount: room_amount ?? null,
          bathroom_amount: bathroom_amount ?? null,
          toilet_amount: toilet_amount ?? null,
          suite_amount: suite_amount ?? null,
          parking_lot_amount: parking_lot_amount ?? null,
          total_surface: total_surface ?? null,
          roofed_surface: roofed_surface ?? null,
          semiroofed_surface: semiroofed_surface ?? null,
          unroofed_surface: unroofed_surface ?? null,
          age: age ?? null,
          floors_amount: floors_amount ?? null,
          disposition: disposition ?? null,
          floor: floor ?? null,
          apartment_door: apartment_door ?? null,
          available_date: available_date ?? null,
          key_coordination: key_coordination ?? null,
          visit_days: visit_days ?? null,
          visit_hours: visit_hours ?? null,
          description: description ?? null,
          rich_description: rich_description ?? null,
          publication_title: publication_title ?? null,
          reference_code: reference_code ?? null,
          status: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (propError) {
        console.error('[properties/create] Property insert error:', propError);
        return NextResponse.json(
          { error: propError.message || 'Error al crear la propiedad' },
          { status: 500 }
        );
      }

      propertyId = property.id;
      console.log('[properties/create] Property created:', propertyId);
    }

    // Create operacion with pricing
    if (price != null || currency) {
      console.log('[properties/create] Inserting operacion...');
      const { error: opError } = await supabaseAdmin.from('operaciones').insert({
        property_id: propertyId,
        status: 'available',
        currency: currency || 'ARS',
        price: Number(price) || 0,
        period: '0',
        expenses: expenses != null ? Math.round(Number(expenses)) : null,
        duration_months: duration_months ?? null,
        ipc_adjustment: ipc_adjustment ?? null,
        min_start_date: available_date ?? null,
        planMobElegido: selectedPlan ?? null,
      });
      if (opError) {
        console.error('[properties/create] Operacion insert error:', opError);
      }
    }

    // For draft publishes, photos and tags are already in DB — skip re-insert
    if (draftId) {
      // Move any remaining temp photos to propertyId folder
      const { data: existingPhotos } = await supabaseAdmin
        .from('tokko_property_photo')
        .select('id, storage_path, image, original, thumb')
        .eq('property_id', propertyId);

      if (existingPhotos && existingPhotos.length > 0) {
        for (const photo of existingPhotos) {
          if (photo.storage_path?.startsWith('tmp/')) {
            const filename = photo.storage_path.split('/').slice(2).join('/');
            const toPath = `${propertyId}/${filename}`;
            try {
              const moved = await movePhoto(photo.storage_path, toPath);
              await supabaseAdmin
                .from('tokko_property_photo')
                .update({ storage_path: moved.storagePath, image: moved.publicUrl, original: moved.publicUrl, thumb: moved.publicUrl })
                .eq('id', photo.id);
            } catch (moveErr) {
              console.error('[properties/create] Failed to move temp photo:', photo.storage_path, moveErr);
            }
          }
        }
      }

      console.log('[properties/create] Done (draft publish). Property ID:', propertyId);
      return NextResponse.json({ id: propertyId });
    }

    // Insert photos — supports both structured (from PhotoUploader) and legacy URL format
    const structuredPhotos = Array.isArray(photosInput) ? photosInput : [];
    const legacyPhotos = Array.isArray(photoUrls) ? photoUrls.filter((u: string) => u && u.trim()) : [];

    if (structuredPhotos.length > 0) {
      console.log('[properties/create] Moving', structuredPhotos.length, 'photos to property folder...');
      // Move each photo from its temp folder (tmp/{uuid}/) to the real property folder ({propertyId}/)
      const finalPhotos = await Promise.all(
        structuredPhotos.map(async (photo: { publicUrl: string; storagePath: string; isCover: boolean; order: number }, i: number) => {
          let finalStoragePath = photo.storagePath;
          let finalPublicUrl = photo.publicUrl;

          if (photo.storagePath.startsWith('tmp/')) {
            const filename = photo.storagePath.split('/').slice(2).join('/');
            const toPath = `${propertyId}/${filename}`;
            try {
              const moved = await movePhoto(photo.storagePath, toPath);
              finalStoragePath = moved.storagePath;
              finalPublicUrl = moved.publicUrl;
            } catch (moveErr) {
              console.error('[properties/create] Failed to move photo:', photo.storagePath, moveErr);
              // Keep original path on failure rather than blocking property creation
            }
          }

          return {
            property_id: propertyId,
            image: finalPublicUrl,
            original: finalPublicUrl,
            thumb: finalPublicUrl,
            storage_path: finalStoragePath,
            description: null,
            is_blueprint: false,
            is_front_cover: photo.isCover ?? i === 0,
            order: photo.order ?? i,
          };
        })
      );

      const { error: photoError } = await supabaseAdmin
        .from('tokko_property_photo')
        .insert(finalPhotos);
      if (photoError) {
        console.error('[properties/create] Photos insert error:', photoError);
      }
    } else if (legacyPhotos.length > 0) {
      console.log('[properties/create] Inserting', legacyPhotos.length, 'photos (legacy URLs)...');
      const photoRows = legacyPhotos.map((url: string, i: number) => ({
        property_id: propertyId,
        image: url.trim(),
        original: url.trim(),
        thumb: url.trim(),
        description: null,
        is_blueprint: false,
        is_front_cover: i === 0,
        order: i,
      }));
      const { error: photoError } = await supabaseAdmin
        .from('tokko_property_photo')
        .insert(photoRows);
      if (photoError) {
        console.error('[properties/create] Photos insert error:', photoError);
      }
    }

    // Insert videos
    const videos = Array.isArray(videoUrls) ? videoUrls.filter((u: string) => u && u.trim()) : [];
    if (videos.length > 0) {
      console.log('[properties/create] Inserting', videos.length, 'videos...');
      const videoRows = videos.map((url: string, i: number) => ({
        property_id: propertyId,
        url: url.trim(),
        description: null,
        order: i,
      }));
      const { error: videoError } = await supabaseAdmin
        .from('tokko_property_video')
        .insert(videoRows);
      if (videoError) {
        console.error('[properties/create] Videos insert error:', videoError);
      }
    }

    // Insert tags
    const tagIdsArr = Array.isArray(tagIds) ? tagIds : [];
    if (tagIdsArr.length > 0) {
      console.log('[properties/create] Inserting', tagIdsArr.length, 'tags...');
      const tagRows = tagIdsArr.map((tagId: number) => ({
        property_id: propertyId,
        tag_id: Number(tagId),
      }));
      const { error: tagError } = await supabaseAdmin
        .from('tokko_property_property_tag')
        .insert(tagRows);
      if (tagError) {
        console.error('[properties/create] Tags insert error:', tagError);
      }
    }

    console.log('[properties/create] Done. Property ID:', propertyId);
    return NextResponse.json({ id: propertyId });
  } catch (e) {
    console.error('[properties/create] Unhandled error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error al crear la propiedad' },
      { status: 500 }
    );
  }
}
