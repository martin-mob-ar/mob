import { createClient, type QueryParams } from "next-sanity";
import { sanityConfig, isSanityConfigured } from "./config";

export const client = isSanityConfigured
  ? createClient({ ...sanityConfig, useCdn: true })
  : null;

export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
  fallback,
}: {
  query: string;
  params?: QueryParams;
  tags?: string[];
  fallback?: T;
}): Promise<T> {
  if (!client) {
    if (fallback !== undefined) return fallback;
    throw new Error("Sanity is not configured (missing NEXT_PUBLIC_SANITY_PROJECT_ID)");
  }
  try {
    return await client.fetch<T>(query, params, {
      next: {
        revalidate: tags.length ? undefined : 3600,
        tags,
      },
    });
  } catch (error) {
    if (fallback !== undefined) return fallback;
    throw error;
  }
}
