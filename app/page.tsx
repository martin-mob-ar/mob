import { createClient } from "@/lib/supabase/server-component";
import { transformPropertyReadList } from "@/lib/transforms/property";
import Index from "@/views/Index";

export default async function IndexPage() {
  let properties;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("properties_read")
      .select("*")
      .order("property_created_at", { ascending: false })
      .limit(12);

    if (data && data.length > 0) {
      properties = transformPropertyReadList(data);
    }
  } catch {
    // Fall back to mock data if DB fetch fails
  }

  return <Index properties={properties} />;
}
