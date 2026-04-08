import type { MetadataRoute } from "next";
import { sanityFetch } from "@/lib/sanity/client";
import { sitemapPostsQuery, sitemapCategoriesQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { supabaseAdmin } from "@/lib/supabase/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.mob.ar";

// Minimum number of properties required to include a programmatic page in the sitemap.
// Prevents thin-content pages from diluting crawl budget.
const MIN_PROPERTIES_FOR_PROGRAMMATIC = 2;

// Next.js doesn't XML-escape & in <image:loc> URLs, so we must pre-escape them
function escapeXmlUrl(url: string): string {
  return url.replace(/&/g, "&amp;");
}

// ---------------------------------------------------------------------------
// Sitemap index – splits into 4 sub-sitemaps so Google can monitor each
// category independently and prioritize crawl budget.
//   0 = static + blog
//   1 = property detail pages
//   2 = location pages (state + state/location)
//   3 = programmatic pages (type/room combos)
// ---------------------------------------------------------------------------

export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }];
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  switch (id) {
    case 0:
      return buildStaticAndBlogSitemap();
    case 1:
      return buildPropertySitemap();
    case 2:
      return buildLocationSitemap();
    case 3:
      return buildProgrammaticSitemap();
    default:
      return [];
  }
}

// ---------------------------------------------------------------------------
// 0 – Static pages + blog
// ---------------------------------------------------------------------------
async function buildStaticAndBlogSitemap(): Promise<MetadataRoute.Sitemap> {
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

  return [...staticPages, ...blogPages, ...categoryPages];
}

// ---------------------------------------------------------------------------
// 1 – Property detail pages
// ---------------------------------------------------------------------------
async function buildPropertySitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const { data: allProps } = await supabaseAdmin
      .from("properties_read")
      .select("slug, property_updated_at, cover_photo_url")
      .eq("owner_verified", true);

    if (!allProps?.length) return [];

    return allProps
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${APP_URL}/propiedad/${p.slug}`,
        lastModified: p.property_updated_at || undefined,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        ...(p.cover_photo_url && { images: [escapeXmlUrl(p.cover_photo_url)] }),
      }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// 2 – Location pages (state-level + state/location-level)
// ---------------------------------------------------------------------------
async function buildLocationSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const { data: allProps } = await supabaseAdmin
      .from("properties_read")
      .select("state_slug, location_slug, property_updated_at")
      .eq("owner_verified", true);

    if (!allProps?.length) return [];

    // Track the most recent property update per state and per location
    const stateLastMod = new Map<string, string>();
    const locationLastMod = new Map<string, string>();

    for (const p of allProps) {
      if (!p.state_slug) continue;
      const date = p.property_updated_at || "";

      const curState = stateLastMod.get(p.state_slug) || "";
      if (date > curState) stateLastMod.set(p.state_slug, date);

      if (p.location_slug) {
        const locKey = `${p.state_slug}/${p.location_slug}`;
        const curLoc = locationLastMod.get(locKey) || "";
        if (date > curLoc) locationLastMod.set(locKey, date);
      }
    }

    const pages: MetadataRoute.Sitemap = [];

    for (const [stateSlug, lastMod] of stateLastMod) {
      pages.push({
        url: `${APP_URL}/alquileres/${stateSlug}`,
        lastModified: lastMod || undefined,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      });
    }

    for (const [path, lastMod] of locationLastMod) {
      pages.push({
        url: `${APP_URL}/alquileres/${path}`,
        lastModified: lastMod || undefined,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      });
    }

    return pages;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// 3 – Programmatic SEO pages (type / room / state / location combos)
// ---------------------------------------------------------------------------
async function buildProgrammaticSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const { data: allProps } = await supabaseAdmin
      .from("properties_read")
      .select("property_type_id, room_amount, state_slug, location_slug, property_updated_at")
      .eq("owner_verified", true);

    if (!allProps?.length) return [];

    const { data: types } = await supabaseAdmin
      .from("tokko_property_type")
      .select("id, slug")
      .not("slug", "is", null);

    const typeSlugMap = new Map<number, string>();
    types?.forEach((t) => {
      if (t.slug) typeSlugMap.set(t.id, t.slug);
    });

    const roomSlugs: Record<number, string> = {
      1: "monoambiente",
      2: "2-ambientes",
      3: "3-ambientes",
      4: "4-ambientes",
      5: "5-ambientes",
    };

    // Track count AND most-recent update per combo
    const comboData = new Map<string, { count: number; lastMod: string }>();

    const trackCombo = (key: string, date: string) => {
      const existing = comboData.get(key);
      if (existing) {
        existing.count++;
        if (date > existing.lastMod) existing.lastMod = date;
      } else {
        comboData.set(key, { count: 1, lastMod: date });
      }
    };

    for (const p of allProps) {
      const typeSlug = typeSlugMap.get(p.property_type_id);
      const stateSlug = p.state_slug;
      const locSlug = p.location_slug;
      const roomSlug = p.room_amount ? roomSlugs[p.room_amount] : null;
      const date = p.property_updated_at || "";

      // Type + state + location
      if (typeSlug && stateSlug && locSlug) {
        trackCombo(`${typeSlug}/${stateSlug}/${locSlug}`, date);
      }
      // Type + rooms + state + location
      if (typeSlug && roomSlug && stateSlug && locSlug) {
        trackCombo(`${typeSlug}/${roomSlug}/${stateSlug}/${locSlug}`, date);
      }
      // Rooms + state + location (any type)
      if (roomSlug && stateSlug && locSlug) {
        trackCombo(`${roomSlug}/${stateSlug}/${locSlug}`, date);
      }
    }

    const pages: MetadataRoute.Sitemap = [];

    // National type pages (always included — these are high-value)
    const activeSlugs = [
      ...new Set(
        allProps.map((p) => typeSlugMap.get(p.property_type_id)).filter(Boolean)
      ),
    ];
    for (const slug of activeSlugs) {
      pages.push({
        url: `${APP_URL}/alquileres/${slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      });
    }

    // Type + state pages (derived from qualifying combos)
    const typeStateData = new Map<string, string>(); // pair -> lastMod
    for (const [key, data] of comboData) {
      if (data.count < MIN_PROPERTIES_FOR_PROGRAMMATIC) continue;
      const parts = key.split("/");
      // Only from 3-part combos (type/state/location)
      if (parts.length !== 3) continue;
      const isTypeSlug = [...typeSlugMap.values()].includes(parts[0]);
      if (!isTypeSlug) continue;

      const pair = `${parts[0]}/${parts[1]}`;
      const curDate = typeStateData.get(pair) || "";
      if (data.lastMod > curDate) typeStateData.set(pair, data.lastMod);
    }
    for (const [pair, lastMod] of typeStateData) {
      pages.push({
        url: `${APP_URL}/alquileres/${pair}`,
        lastModified: lastMod || undefined,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      });
    }

    // All combos meeting the minimum threshold
    for (const [path, data] of comboData) {
      if (data.count < MIN_PROPERTIES_FOR_PROGRAMMATIC) continue;
      pages.push({
        url: `${APP_URL}/alquileres/${path}`,
        lastModified: data.lastMod || undefined,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      });
    }

    return pages;
  } catch {
    return [];
  }
}
