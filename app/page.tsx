import { createClient } from "@/lib/supabase/server-component";
import { transformPropertyReadList } from "@/lib/transforms/property";
import { sanityFetch } from "@/lib/sanity/client";
import { latestPostsQuery } from "@/lib/sanity/queries";
import type { Post } from "@/lib/sanity/types";
import Index from "@/views/Index";

export default async function IndexPage() {
  let featuredProperties;
  let latestProperties;
  let latestPosts: Post[] = [];

  try {
    const supabase = await createClient();

    // Propiedades destacadas: premium plans first (acompanado/experiencia), then rest
    const { data: featured } = await supabase
      .from("properties_read")
      .select("*")
      .eq("owner_verified", true)
      .order("sort_priority", { ascending: true })
      .order("property_created_at", { ascending: false })
      .limit(6);

    // Últimas propiedades: simply newest first
    const { data: latest } = await supabase
      .from("properties_read")
      .select("*")
      .eq("owner_verified", true)
      .order("property_created_at", { ascending: false })
      .limit(6);

    if (featured && featured.length > 0) {
      featuredProperties = transformPropertyReadList(featured);
    }
    if (latest && latest.length > 0) {
      latestProperties = transformPropertyReadList(latest);
    }
  } catch {
    // Fall back to mock data if DB fetch fails
  }

  try {
    latestPosts = await sanityFetch<Post[]>({
      query: latestPostsQuery,
      params: { limit: 3 },
      tags: ["post"],
    });
  } catch {
    // Sanity unavailable — skip blog posts
  }

  return <Index featuredProperties={featuredProperties} latestProperties={latestProperties} latestPosts={latestPosts} />;
}
