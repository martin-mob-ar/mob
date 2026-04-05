import type { MetadataRoute } from "next";
import { sanityFetch } from "@/lib/sanity/client";
import { sitemapPostsQuery, sitemapCategoriesQuery } from "@/lib/sanity/queries";
import { createClient } from "@/lib/supabase/server-component";
import { supabaseAdmin } from "@/lib/supabase/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.mob.ar";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${APP_URL}/alquileres`, changeFrequency: "daily", priority: 0.9 },
    { url: `${APP_URL}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${APP_URL}/calculadora-ipc`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${APP_URL}/calculadora-creditos-hipotecarios`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${APP_URL}/inmobiliarias`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${APP_URL}/propietarios`, changeFrequency: "monthly", priority: 0.6 },
{ url: `${APP_URL}/terminos-y-condiciones`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/politica-de-privacidad`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Blog posts from Sanity
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await sanityFetch<
      { slug: string; publishedAt: string; _updatedAt: string }[]
    >({ query: sitemapPostsQuery, tags: ["post"], fallback: [] });

    blogPages = posts.map((post) => ({
      url: `${APP_URL}/blog/${post.slug}`,
      lastModified: post._updatedAt || post.publishedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Sanity unavailable — skip blog entries
  }

  // Blog categories from Sanity
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await sanityFetch<{ slug: string; _updatedAt: string }[]>(
      { query: sitemapCategoriesQuery, tags: ["category"], fallback: [] }
    );

    categoryPages = categories.map((cat) => ({
      url: `${APP_URL}/blog/categoria/${cat.slug}`,
      lastModified: cat._updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
  } catch {
    // Sanity unavailable — skip category entries
  }

  // Property pages from Supabase
  let propertyPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data: properties } = await supabase
      .from("properties_read")
      .select("slug, property_updated_at, cover_photo_url, title")
      .eq("owner_verified", true)
      .not("slug", "is", null);

    if (properties) {
      propertyPages = properties.map((p) => ({
        url: `${APP_URL}/propiedad/${p.slug}`,
        lastModified: p.property_updated_at || undefined,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        ...(p.cover_photo_url && {
          images: [p.cover_photo_url],
        }),
      }));
    }
  } catch {
    // Supabase unavailable — skip property entries
  }

  // Location pages (programmatic SEO)
  let locationPages: MetadataRoute.Sitemap = [];
  try {
    // Get all states and locations with verified properties
    const supabase = await createClient();
    const { data: locationsWithProps } = await supabase
      .from("properties_read")
      .select("location_id")
      .eq("owner_verified", true);

    if (locationsWithProps) {
      const locationIds = [...new Set(locationsWithProps.map((p) => p.location_id).filter(Boolean))];

      if (locationIds.length > 0) {
        const { data: locations } = await supabaseAdmin
          .from("tokko_location")
          .select("slug, state_id, tokko_state!state_id(slug)")
          .in("id", locationIds as number[])
          .not("slug", "is", null);

        const stateSet = new Set<string>();

        if (locations) {
          locations.forEach((loc: any) => {
            const stateSlug = loc.tokko_state?.slug;
            if (stateSlug && loc.slug) {
              stateSet.add(stateSlug);
              locationPages.push({
                url: `${APP_URL}/alquileres/${stateSlug}/${loc.slug}`,
                changeFrequency: "weekly" as const,
                priority: 0.6,
              });
            }
          });
        }

        // Add state-level pages
        const statePages: MetadataRoute.Sitemap = [...stateSet].map((stateSlug) => ({
          url: `${APP_URL}/alquileres/${stateSlug}`,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));

        locationPages = [...statePages, ...locationPages];
      }
    }
  } catch {
    // Supabase unavailable — skip location entries
  }

  // Programmatic SEO routes (property type + room count combinations)
  let programmaticPages: MetadataRoute.Sitemap = [];
  try {
    // Get all verified properties with type and room data
    const { data: allProps } = await supabaseAdmin
      .from("properties_read")
      .select("property_type_id, room_amount, location_id")
      .eq("owner_verified", true);

    if (allProps && allProps.length > 0) {
      // Get property type slugs
      const { data: types } = await supabaseAdmin
        .from("tokko_property_type")
        .select("id, slug")
        .not("slug", "is", null);

      // Get location → state slug mappings
      const locationIds = [...new Set(allProps.map((p) => p.location_id).filter(Boolean))];
      const { data: locations } = await supabaseAdmin
        .from("tokko_location")
        .select("id, slug, tokko_state!state_id(slug)")
        .in("id", locationIds as number[])
        .not("slug", "is", null);

      const typeSlugMap = new Map<number, string>();
      types?.forEach((t) => { if (t.slug) typeSlugMap.set(t.id, t.slug); });

      const locationMap = new Map<number, { locSlug: string; stateSlug: string }>();
      locations?.forEach((l: any) => {
        if (l.slug && l.tokko_state?.slug) {
          locationMap.set(l.id, { locSlug: l.slug, stateSlug: l.tokko_state.slug });
        }
      });

      const roomSlugs: Record<number, string> = {
        1: "monoambiente", 2: "2-ambientes", 3: "3-ambientes", 4: "4-ambientes", 5: "5-ambientes",
      };

      // Count properties per (typeSlug, roomSlug, stateSlug, locationSlug) combo
      const comboCounts = new Map<string, number>();
      for (const p of allProps) {
        const typeSlug = typeSlugMap.get(p.property_type_id);
        const loc = p.location_id ? locationMap.get(p.location_id) : null;
        const roomSlug = p.room_amount ? roomSlugs[p.room_amount] : null;

        // Type + state + location
        if (typeSlug && loc) {
          const key = `${typeSlug}/${loc.stateSlug}/${loc.locSlug}`;
          comboCounts.set(key, (comboCounts.get(key) || 0) + 1);
        }
        // Type + rooms + state + location
        if (typeSlug && roomSlug && loc) {
          const key = `${typeSlug}/${roomSlug}/${loc.stateSlug}/${loc.locSlug}`;
          comboCounts.set(key, (comboCounts.get(key) || 0) + 1);
        }
        // Rooms + state + location (any type)
        if (roomSlug && loc) {
          const key = `${roomSlug}/${loc.stateSlug}/${loc.locSlug}`;
          comboCounts.set(key, (comboCounts.get(key) || 0) + 1);
        }
      }

      // Add national type pages (always include)
      const activeSlugs = [...new Set(allProps.map((p) => typeSlugMap.get(p.property_type_id)).filter(Boolean))];
      for (const slug of activeSlugs) {
        programmaticPages.push({
          url: `${APP_URL}/alquileres/${slug}`,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        });
      }

      // Add type + state pages (derived from combos)
      const typeStatePairs = new Set<string>();
      for (const [key, count] of comboCounts) {
        if (count < 2) continue;
        const parts = key.split("/");
        // Only process type/state/location combos (3 parts with type slug)
        if (parts.length === 3 && typeSlugMap.has([...typeSlugMap.entries()].find(([, v]) => v === parts[0])?.[0] || -1)) {
          typeStatePairs.add(`${parts[0]}/${parts[1]}`);
        }
      }
      for (const pair of typeStatePairs) {
        programmaticPages.push({
          url: `${APP_URL}/alquileres/${pair}`,
          changeFrequency: "weekly" as const,
          priority: 0.6,
        });
      }

      // Add all combos with 2+ properties as sitemap entries
      for (const [path, count] of comboCounts) {
        if (count < 2) continue;
        programmaticPages.push({
          url: `${APP_URL}/alquileres/${path}`,
          changeFrequency: "weekly" as const,
          priority: 0.5,
        });
      }
    }
  } catch {
    // Skip programmatic routes on error
  }

  return [...staticPages, ...blogPages, ...categoryPages, ...propertyPages, ...locationPages, ...programmaticPages];
}
