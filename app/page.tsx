import { createClient } from "@/lib/supabase/server-component";
import { transformPropertyReadList } from "@/lib/transforms/property";
import { sanityFetch } from "@/lib/sanity/client";
import { latestPostsQuery } from "@/lib/sanity/queries";
import type { Post } from "@/lib/sanity/types";
import Index from "@/views/Index";

export default async function IndexPage() {
  let properties;
  let latestPosts: Post[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("properties_read")
      .select("*")
      .eq("owner_verified", true)
      .order("property_created_at", { ascending: false })
      .limit(12);

    if (data && data.length > 0) {
      properties = transformPropertyReadList(data);
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

  return <Index properties={properties} latestPosts={latestPosts} />;
}
