import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server-component";
import { transformPropertyReadList } from "@/lib/transforms/property";
import SearchResults from "@/views/SearchResults";

export default async function BuscarPage() {
  let initialProperties;
  let initialTotal = 0;

  try {
    const supabase = await createClient();
    const { data, count } = await supabase
      .from("properties_read")
      .select("*", { count: "exact" })
      .order("property_created_at", { ascending: false })
      .range(0, 19);

    if (data && data.length > 0) {
      initialProperties = transformPropertyReadList(data);
      initialTotal = count || data.length;
    }
  } catch {
    // Falls back to empty on error
  }

  return (
    <Suspense>
      <SearchResults
        initialProperties={initialProperties}
        initialTotal={initialTotal}
      />
    </Suspense>
  );
}
