import { NextResponse } from 'next/server';
import { supabaseAdmin, getOrCreateUserFromAuth } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      profile_id,
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
    } = body;

    if (!profile_id) {
      return NextResponse.json({ error: 'profile_id es requerido' }, { status: 400 });
    }

    console.log('[properties/create] Resolving user for profile_id:', profile_id);
    const resolvedUserId = await getOrCreateUserFromAuth(profile_id);
    console.log('[properties/create] Resolved user_id:', resolvedUserId);

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

    const propertyId = property.id;
    console.log('[properties/create] Property created:', propertyId);

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
      });
      if (opError) {
        console.error('[properties/create] Operacion insert error:', opError);
      }
    }

    // Insert photos — supports both structured (from PhotoUploader) and legacy URL format
    const structuredPhotos = Array.isArray(photosInput) ? photosInput : [];
    const legacyPhotos = Array.isArray(photoUrls) ? photoUrls.filter((u: string) => u && u.trim()) : [];

    if (structuredPhotos.length > 0) {
      console.log('[properties/create] Inserting', structuredPhotos.length, 'photos (structured)...');
      const photoRows = structuredPhotos.map((photo: { publicUrl: string; storagePath: string; isCover: boolean; order: number }, i: number) => ({
        property_id: propertyId,
        image: photo.publicUrl,
        original: photo.publicUrl,
        thumb: photo.publicUrl,
        storage_path: photo.storagePath,
        description: null,
        is_blueprint: false,
        is_front_cover: photo.isCover ?? i === 0,
        order: photo.order ?? i,
      }));
      const { error: photoError } = await supabaseAdmin
        .from('tokko_property_photo')
        .insert(photoRows);
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
