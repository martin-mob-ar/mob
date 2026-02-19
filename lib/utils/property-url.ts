/**
 * Returns the canonical URL path for a property detail page.
 * Uses slug if available, falls back to numeric ID.
 */
export function getPropertyUrl(property: { id: string; slug?: string }): string {
  return `/propiedad/${property.slug || property.id}`;
}
