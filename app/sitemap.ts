import type { MetadataRoute } from "next";
import { sanityFetch } from "@/lib/sanity/client";
import { sitemapPostsQuery, sitemapCategoriesQuery } from "@/lib/sanity/queries";
import { createClient } from "@/lib/supabase/server-component";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.mob.ar";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${APP_URL}/buscar`, changeFrequency: "daily", priority: 0.9 },
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
      .select("slug, property_updated_at")
      .not("slug", "is", null);

    if (properties) {
      propertyPages = properties.map((p) => ({
        url: `${APP_URL}/propiedad/${p.slug}`,
        lastModified: p.property_updated_at || undefined,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  } catch {
    // Supabase unavailable — skip property entries
  }

  return [...staticPages, ...blogPages, ...categoryPages, ...propertyPages];
}
