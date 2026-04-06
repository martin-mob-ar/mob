/**
 * Convert a location name to a URL-safe slug.
 * Mirrors the Postgres `generate_slug()` function.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric → hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, ""); // trim leading/trailing hyphens
}
