import { createClient } from "@/lib/supabase/server-component";
import { transformToOwnerPanelProperty } from "@/lib/transforms/property";
import ResumenView from "@/views/panel/ResumenView";

export default async function GestionResumenPage() {
  let properties;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("properties_read")
        .select("*")
        .eq("user_id", user.id)
        .eq("tokko", false)
        .order("property_created_at", { ascending: false });

      if (data && data.length > 0) {
        properties = data.map(transformToOwnerPanelProperty);
      }
    }
  } catch {
    // Falls back to mock data
  }

  return <ResumenView properties={properties} />;
}
