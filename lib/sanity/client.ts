import { createClient, type QueryParams } from "next-sanity";
import { sanityConfig } from "./config";

export const client = createClient({
  ...sanityConfig,
  useCdn: true,
});

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
