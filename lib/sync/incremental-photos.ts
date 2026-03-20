import { supabaseAdmin } from '@/lib/supabase/server';
import { deletePhoto } from '@/lib/storage/gcs';

interface TokkoPhoto {
  image: string;
  original: string;
  thumb: string;
  description?: string;
  is_blueprint: boolean;
  is_front_cover: boolean;
  order: number;
}

export interface PhotoDiffResult {
  added: number;
  removed: number;
}

/**
 * Smart photo diff: compare Tokko photos against DB photos using tokko_source_url.
 * Only removes/adds what actually changed. Preserves GCS-migrated photos that haven't changed.
 */
export async function diffAndSyncPhotos(
  propertyId: number,
  tkkPhotos: TokkoPhoto[] | undefined,
): Promise<PhotoDiffResult> {
  const newPhotos = tkkPhotos ?? [];

  // Get current DB photos
  const { data: dbPhotos } = await supabaseAdmin
    .from('tokko_property_photo')
    .select('id, tokko_source_url, storage_path, order, is_front_cover')
    .eq('property_id', propertyId);

  // No existing photos -> insert all
  if (!dbPhotos || dbPhotos.length === 0) {
    if (newPhotos.length === 0) return { added: 0, removed: 0 };
    await insertPhotos(propertyId, newPhotos);
    return { added: newPhotos.length, removed: 0 };
  }

  // If any DB photos lack tokko_source_url (pre-migration) -> full replacement (one-time cost)
  const allHaveSourceUrl = dbPhotos.every(p => p.tokko_source_url);
  if (!allHaveSourceUrl) {
    return fullReplacePhotos(propertyId, dbPhotos, newPhotos);
  }

  // Smart diff using tokko_source_url as matching key
  const dbByUrl = new Map(dbPhotos.map(p => [p.tokko_source_url!, p]));
  const newUrlSet = new Set(newPhotos.map(p => p.original));

  const toRemove = dbPhotos.filter(p => !newUrlSet.has(p.tokko_source_url!));
  const toAdd = newPhotos.filter(p => !dbByUrl.has(p.original));
  const toReorder = newPhotos.filter(p => {
    const existing = dbByUrl.get(p.original);
    if (!existing) return false;
    return existing.order !== p.order || existing.is_front_cover !== (p.order === 0);
  });

  // Remove photos no longer in Tokko
  if (toRemove.length > 0) {
    for (const photo of toRemove) {
      if (photo.storage_path) {
        try { await deletePhoto(photo.storage_path); } catch (e) {
          console.warn(`[Incremental Photos] GCS delete failed for ${photo.storage_path}:`, e);
        }
      }
    }
    await supabaseAdmin
      .from('tokko_property_photo')
      .delete()
      .in('id', toRemove.map(p => p.id));
  }

  // Add new photos from Tokko
  if (toAdd.length > 0) {
    await insertPhotos(propertyId, toAdd);
  }

  // Reorder existing photos (parallel to reduce wall time)
  if (toReorder.length > 0) {
    await Promise.all(toReorder.map(photo => {
      const existing = dbByUrl.get(photo.original)!;
      return supabaseAdmin
        .from('tokko_property_photo')
        .update({ order: photo.order, is_front_cover: photo.order === 0 })
        .eq('id', existing.id);
    }));
  }

  return { added: toAdd.length, removed: toRemove.length };
}

async function insertPhotos(propertyId: number, photos: TokkoPhoto[]): Promise<void> {
  const rows = photos.map(photo => ({
    property_id: propertyId,
    image: photo.image,
    original: photo.original,
    thumb: photo.thumb,
    description: photo.description || null,
    is_blueprint: photo.is_blueprint ?? false,
    is_front_cover: photo.order === 0,
    order: photo.order,
    storage_path: null,
    tokko_source_url: photo.original,
  }));
  await supabaseAdmin.from('tokko_property_photo').insert(rows);
}

/**
 * Full replacement for photos that lack tokko_source_url (pre-migration data).
 * This is a one-time cost per property on the first incremental sync.
 */
async function fullReplacePhotos(
  propertyId: number,
  dbPhotos: Array<{ id: number; storage_path: string | null }>,
  newPhotos: TokkoPhoto[],
): Promise<PhotoDiffResult> {
  // Delete GCS files for old photos
  for (const photo of dbPhotos) {
    if (photo.storage_path) {
      try { await deletePhoto(photo.storage_path); } catch {}
    }
  }

  // Delete all DB photos for this property
  await supabaseAdmin
    .from('tokko_property_photo')
    .delete()
    .eq('property_id', propertyId);

  // Insert new photos with tokko_source_url
  if (newPhotos.length > 0) {
    await insertPhotos(propertyId, newPhotos);
  }

  return { added: newPhotos.length, removed: dbPhotos.length };
}
