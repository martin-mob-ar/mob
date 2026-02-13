import { createClient } from "@/lib/supabase/server-component";
import { transformToInmobiliariaPanelProperty } from "@/lib/transforms/property";
import InmobiliariaPropiedadesView from "@/views/panel-inmobiliaria/InmobiliariaPropiedadesView";

export default async function GestionInmobiliariaPropiedadesPage() {
  let properties;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("properties_read")
        .select("*")
        .eq("user_id", user.id)
        .eq("tokko", true)
        .order("property_created_at", { ascending: false });

      if (data && data.length > 0) {
        properties = data.map(transformToInmobiliariaPanelProperty);
      }
    }
  } catch {
    // Falls back to mock data
  }

  return <InmobiliariaPropiedadesView properties={properties} />;
}
