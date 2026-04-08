import { sanityFetch } from "@/lib/sanity/client";
import {
  sitemapPostsQuery,
  sitemapCategoriesQuery,
} from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { supabaseAdmin } from "@/lib/supabase/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.mob.ar";

// Minimum number of properties required to include a programmatic page.
const MIN_PROPERTIES_FOR_PROGRAMMATIC = 2;

// ---------------------------------------------------------------------------
// Types & XML serialisation
// ---------------------------------------------------------------------------
export interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency?: string;
  priority?: number;
  images?: string[];
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function toSitemapXml(entries: SitemapEntry[]): string {
  const hasImages = entries.some((e) => e.images?.length);
  const nsImage = hasImages
    ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
    : "";

  const urls = entries
    .map((e) => {
      const parts = [`    <loc>${escapeXml(e.url)}</loc>`];
      if (e.lastModified) parts.push(`    <lastmod>${e.lastModified}</lastmod>`);
      if (e.changeFrequency)
        parts.push(`    <changefreq>${e.changeFrequency}</changefreq>`);
      if (e.priority != null)
        parts.push(`    <priority>${e.priority}</priority>`);
      if (e.images) {
        for (const img of e.images) {
          parts.push(
            `    <image:image>\n      <image:loc>${escapeXml(img)}</image:loc>\n    </image:image>`
          );
        }
      }
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${nsImage}>\n${urls}\n</urlset>`;
}

// ---------------------------------------------------------------------------
// 0 – Static pages + blog
// ---------------------------------------------------------------------------
export async function buildStaticAndBlogSitemap(): Promise<SitemapEntry[]> {
  const staticPages: SitemapEntry[] = [
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

  let blogPages: SitemapEntry[] = [];
  try {
    const posts = await sanityFetch<
      { slug: string; publishedAt: string; _updatedAt: string; coverImage?: any }[]
    >({ query: sitemapPostsQuery, tags: ["post"], fallback: [] });

    blogPages = posts.map((post) => ({
      url: `${APP_URL}/blog/${post.slug}`,
      lastModified: post._updatedAt || post.publishedAt,
      changeFrequency: "weekly",
      priority: 0.7,
      ...(post.coverImage && {
        images: [urlFor(post.coverImage).width(1200).height(630).url()],
      }),
    }));
  } catch {
    // Sanity unavailable
  }

  let categoryPages: SitemapEntry[] = [];
  try {
    const categories = await sanityFetch<{ slug: string; _updatedAt: string }[]>(
      { query: sitemapCategoriesQuery, tags: ["category"], fallback: [] }
    );
    categoryPages = categories.map((cat) => ({
      url: `${APP_URL}/blog/categoria/${cat.slug}`,
      lastModified: cat._updatedAt,
      changeFrequency: "weekly",
      priority: 0.5,
    }));
  } catch {
    // Sanity unavailable
  }

  return [...staticPages, ...blogPages, ...categoryPages];
}

// ---------------------------------------------------------------------------
// 1 – Property detail pages
// ---------------------------------------------------------------------------
export async function buildPropertySitemap(): Promise<SitemapEntry[]> {
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
        changeFrequency: "weekly",
        priority: 0.8,
        ...(p.cover_photo_url && { images: [p.cover_photo_url] }),
      }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// 2 – Location pages (state-level + state/location-level)
// ---------------------------------------------------------------------------
export async function buildLocationSitemap(): Promise<SitemapEntry[]> {
  try {
    const { data: allProps } = await supabaseAdmin
      .from("properties_read")
      .select("state_slug, location_slug, property_updated_at")
      .eq("owner_verified", true);

    if (!allProps?.length) return [];

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

    const pages: SitemapEntry[] = [];

    for (const [stateSlug, lastMod] of stateLastMod) {
      pages.push({
        url: `${APP_URL}/alquileres/${stateSlug}`,
        lastModified: lastMod || undefined,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    for (const [path, lastMod] of locationLastMod) {
      pages.push({
        url: `${APP_URL}/alquileres/${path}`,
        lastModified: lastMod || undefined,
        changeFrequency: "weekly",
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
export async function buildProgrammaticSitemap(): Promise<SitemapEntry[]> {
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
    types?.forEach((t) => { if (t.slug) typeSlugMap.set(t.id, t.slug); });

    const roomSlugs: Record<number, string> = {
      1: "monoambiente", 2: "2-ambientes", 3: "3-ambientes", 4: "4-ambientes", 5: "5-ambientes",
    };

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

      if (typeSlug && stateSlug && locSlug)
        trackCombo(`${typeSlug}/${stateSlug}/${locSlug}`, date);
      if (typeSlug && roomSlug && stateSlug && locSlug)
        trackCombo(`${typeSlug}/${roomSlug}/${stateSlug}/${locSlug}`, date);
      if (roomSlug && stateSlug && locSlug)
        trackCombo(`${roomSlug}/${stateSlug}/${locSlug}`, date);
    }

    const pages: SitemapEntry[] = [];

    // National type pages (always included — high-value)
    const activeSlugs = [...new Set(
      allProps.map((p) => typeSlugMap.get(p.property_type_id)).filter(Boolean)
    )];
    for (const slug of activeSlugs) {
      pages.push({ url: `${APP_URL}/alquileres/${slug}`, changeFrequency: "weekly", priority: 0.7 });
    }

    // Type + state pages (derived from qualifying combos)
    const typeStateData = new Map<string, string>();
    for (const [key, data] of comboData) {
      if (data.count < MIN_PROPERTIES_FOR_PROGRAMMATIC) continue;
      const parts = key.split("/");
      if (parts.length !== 3) continue;
      if (![...typeSlugMap.values()].includes(parts[0])) continue;
      const pair = `${parts[0]}/${parts[1]}`;
      const curDate = typeStateData.get(pair) || "";
      if (data.lastMod > curDate) typeStateData.set(pair, data.lastMod);
    }
    for (const [pair, lastMod] of typeStateData) {
      pages.push({
        url: `${APP_URL}/alquileres/${pair}`,
        lastModified: lastMod || undefined,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }

    // All combos meeting the minimum threshold
    for (const [path, data] of comboData) {
      if (data.count < MIN_PROPERTIES_FOR_PROGRAMMATIC) continue;
      pages.push({
        url: `${APP_URL}/alquileres/${path}`,
        lastModified: data.lastMod || undefined,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }

    return pages;
  } catch {
    return [];
  }
}
