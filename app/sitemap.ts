import type { MetadataRoute } from "next";
import { sanityFetch } from "@/lib/sanity/client";
import { sitemapPostsQuery, sitemapCategoriesQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { supabaseAdmin } from "@/lib/supabase/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.mob.ar";

// Next.js doesn't XML-escape & in <image:loc> URLs, so we must pre-escape them
function escapeXmlUrl(url: string): string {
  return url.replace(/&/g, "&amp;");
}

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
      { slug: string; publishedAt: string; _updatedAt: string; coverImage?: any }[]
    >({ query: sitemapPostsQuery, tags: ["post"], fallback: [] });

    blogPages = posts.map((post) => ({
      url: `${APP_URL}/blog/${post.slug}`,
      lastModified: post._updatedAt || post.publishedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      ...(post.coverImage && {
        images: [escapeXmlUrl(urlFor(post.coverImage).width(1200).height(630).url())],
      }),
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

  // Fetch all verified properties once — only needed columns
  let propertyPages: MetadataRoute.Sitemap = [];
  let locationPages: MetadataRoute.Sitemap = [];
  let programmaticPages: MetadataRoute.Sitemap = [];

  try {
    const { data: allProps } = await supabaseAdmin
      .from("properties_read")
      .select("slug, property_updated_at, cover_photo_url, property_type_id, room_amount, location_slug, state_slug")
      .eq("owner_verified", true);

    if (allProps && allProps.length > 0) {
      // 1. Property detail pages
      propertyPages = allProps
        .filter((p) => p.slug)
        .map((p) => ({
          url: `${APP_URL}/propiedad/${p.slug}`,
          lastModified: p.property_updated_at || undefined,
          changeFrequency: "weekly" as const,
          priority: 0.8,
          ...(p.cover_photo_url && { images: [escapeXmlUrl(p.cover_photo_url)] }),
        }));

      // 2. Location & state pages (derived from denormalized slugs)
      const stateSet = new Set<string>();
      const locationSet = new Set<string>();

      for (const p of allProps) {
        if (p.state_slug) stateSet.add(p.state_slug);
        if (p.state_slug && p.location_slug) {
          locationSet.add(`${p.state_slug}/${p.location_slug}`);
        }
      }

      // State-level pages
      for (const stateSlug of stateSet) {
        locationPages.push({
          url: `${APP_URL}/alquileres/${stateSlug}`,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        });
      }

      // Location-level pages
      for (const path of locationSet) {
        locationPages.push({
          url: `${APP_URL}/alquileres/${path}`,
          changeFrequency: "weekly" as const,
          priority: 0.6,
        });
      }

      // 3. Programmatic SEO routes (type + room combos)
      const { data: types } = await supabaseAdmin
        .from("tokko_property_type")
        .select("id, slug")
        .not("slug", "is", null);

      const typeSlugMap = new Map<number, string>();
      types?.forEach((t) => { if (t.slug) typeSlugMap.set(t.id, t.slug); });

      const roomSlugs: Record<number, string> = {
        1: "monoambiente", 2: "2-ambientes", 3: "3-ambientes", 4: "4-ambientes", 5: "5-ambientes",
      };

      // Count properties per combo
      const comboCounts = new Map<string, number>();
      for (const p of allProps) {
        const typeSlug = typeSlugMap.get(p.property_type_id);
        const stateSlug = p.state_slug;
        const locSlug = p.location_slug;
        const roomSlug = p.room_amount ? roomSlugs[p.room_amount] : null;

        // Type + state + location
        if (typeSlug && stateSlug && locSlug) {
          const key = `${typeSlug}/${stateSlug}/${locSlug}`;
          comboCounts.set(key, (comboCounts.get(key) || 0) + 1);
        }
        // Type + rooms + state + location
        if (typeSlug && roomSlug && stateSlug && locSlug) {
          const key = `${typeSlug}/${roomSlug}/${stateSlug}/${locSlug}`;
          comboCounts.set(key, (comboCounts.get(key) || 0) + 1);
        }
        // Rooms + state + location (any type)
        if (roomSlug && stateSlug && locSlug) {
          const key = `${roomSlug}/${stateSlug}/${locSlug}`;
          comboCounts.set(key, (comboCounts.get(key) || 0) + 1);
        }
      }

      // National type pages
      const activeSlugs = [...new Set(allProps.map((p) => typeSlugMap.get(p.property_type_id)).filter(Boolean))];
      for (const slug of activeSlugs) {
        programmaticPages.push({
          url: `${APP_URL}/alquileres/${slug}`,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        });
      }

      // Type + state pages (derived from combos)
      const typeStatePairs = new Set<string>();
      for (const [key, count] of comboCounts) {
        if (count < 2) continue;
        const parts = key.split("/");
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

      // All combos with 2+ properties
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
    // Supabase unavailable — skip property/location/programmatic entries
  }

  return [...staticPages, ...blogPages, ...categoryPages, ...propertyPages, ...locationPages, ...programmaticPages];
}
