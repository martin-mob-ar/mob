import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server-component";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    const numericId = Number(propertyId);

    // Auth: verify cookie-based session
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Resolve auth UUID → public user
    const { data: publicUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", authUser.id)
      .maybeSingle();

    if (!publicUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verify ownership + not a tokko property
    const { data: existingProp } = await supabaseAdmin
      .from("properties")
      .select("id, user_id, tokko")
      .eq("id", numericId)
      .single();

    if (!existingProp || existingProp.user_id !== publicUser.id) {
      return NextResponse.json(
        { error: "Propiedad no encontrada" },
        { status: 404 }
      );
    }

    if (existingProp.tokko) {
      return NextResponse.json(
        { error: "No se puede editar una propiedad de Tokko" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      type_id,
      price,
      currency,
      expenses,
      address,
      fake_address,
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

    // 1. Update properties table
    const { error: propError } = await supabaseAdmin
      .from("properties")
      .update({
        type_id: type_id ?? null,
        address: address ?? null,
        fake_address: fake_address ?? null,
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
        description: description ?? null,
        rich_description: rich_description ?? null,
        publication_title: publication_title ?? null,
        reference_code: reference_code ?? null,
        available_date: available_date ?? null,
        key_coordination: key_coordination ?? null,
        visit_days: visit_days ?? null,
        visit_hours: visit_hours ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", numericId);

    if (propError) {
      console.error("[properties/update] property update:", propError);
      return NextResponse.json(
        { error: propError.message || "Error al actualizar la propiedad" },
        { status: 500 }
      );
    }

    // 2. Upsert operacion
    const { data: latestOp } = await supabaseAdmin
      .from("operaciones")
      .select("id, status")
      .eq("property_id", numericId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestOp && latestOp.status === "available") {
      // Update the existing available operation
      await supabaseAdmin
        .from("operaciones")
        .update({
          price: price != null ? Number(price) : 0,
          currency: currency || "ARS",
          expenses: expenses ?? null,
          duration_months: duration_months ?? null,
          ipc_adjustment: ipc_adjustment ?? null,
        })
        .eq("id", latestOp.id);
    } else if (price != null || currency) {
      // Create new operation (preserve history of non-available ones)
      await supabaseAdmin.from("operaciones").insert({
        property_id: numericId,
        status: "available",
        currency: currency || "ARS",
        price: Number(price) || 0,
        period: 0,
        expenses: expenses ?? null,
        duration_months: duration_months ?? null,
        ipc_adjustment: ipc_adjustment ?? null,
      });
    }

    // 3. Replace photos (delete all, then re-insert)
    // Supports structured photos (from PhotoUploader) or legacy URL strings
    await supabaseAdmin
      .from("tokko_property_photo")
      .delete()
      .eq("property_id", numericId);

    const structuredPhotos = Array.isArray(photosInput) ? photosInput : [];
    const legacyPhotos = Array.isArray(photoUrls)
      ? photoUrls.filter((u: string) => u && u.trim())
      : [];

    if (structuredPhotos.length > 0) {
      const photoRows = structuredPhotos.map(
        (photo: { publicUrl: string; storagePath: string; isCover: boolean; order: number }, i: number) => ({
          property_id: numericId,
          image: photo.publicUrl,
          original: photo.publicUrl,
          thumb: photo.publicUrl,
          storage_path: photo.storagePath,
          description: null,
          is_blueprint: false,
          is_front_cover: photo.isCover ?? i === 0,
          order: photo.order ?? i,
        })
      );
      const { error: photoError } = await supabaseAdmin
        .from("tokko_property_photo")
        .insert(photoRows);
      if (photoError) {
        console.error("[properties/update] Photos insert error:", photoError);
      }
    } else if (legacyPhotos.length > 0) {
      const legacyPhotoRows = legacyPhotos.map((url: string, i: number) => ({
        property_id: numericId,
        image: url.trim(),
        original: url.trim(),
        thumb: url.trim(),
        description: null,
        is_blueprint: false,
        is_front_cover: i === 0,
        order: i,
      }));
      const { error: legacyPhotoError } = await supabaseAdmin
        .from("tokko_property_photo")
        .insert(legacyPhotoRows);
      if (legacyPhotoError) {
        console.error("[properties/update] Legacy photos insert error:", legacyPhotoError);
      }
    }

    // 4. Replace videos (delete all, then re-insert as batch)
    await supabaseAdmin
      .from("tokko_property_video")
      .delete()
      .eq("property_id", numericId);

    const videos = Array.isArray(videoUrls)
      ? videoUrls.filter((u: string) => u && u.trim())
      : [];
    if (videos.length > 0) {
      const videoRows = videos.map((url: string, i: number) => ({
        property_id: numericId,
        url: url.trim(),
        description: null,
        order: i,
      }));
      const { error: videoError } = await supabaseAdmin
        .from("tokko_property_video")
        .insert(videoRows);
      if (videoError) {
        console.error("[properties/update] Videos insert error:", videoError);
      }
    }

    // 5. Replace tags (delete all, then re-insert as batch)
    await supabaseAdmin
      .from("tokko_property_property_tag")
      .delete()
      .eq("property_id", numericId);

    const tagIdsArr = Array.isArray(tagIds) ? tagIds : [];
    if (tagIdsArr.length > 0) {
      const tagRows = tagIdsArr.map((tagId: number) => ({
        property_id: numericId,
        tag_id: Number(tagId),
      }));
      const { error: tagError } = await supabaseAdmin
        .from("tokko_property_property_tag")
        .insert(tagRows);
      if (tagError) {
        console.error("[properties/update] Tags insert error:", tagError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[properties/update]", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Error al actualizar la propiedad",
      },
      { status: 500 }
    );
  }
}
