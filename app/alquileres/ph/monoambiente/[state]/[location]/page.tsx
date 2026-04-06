import type { Metadata } from "next";
import ProgrammaticSearchPage from "@/lib/seo/programmatic-page";
import { buildProgrammaticMetadata } from "@/lib/seo/programmatic-metadata";
import { buildStaticParamsForFilter } from "@/lib/seo/programmatic-static-params";
import { ROOM_COUNTS } from "@/lib/seo/programmatic-constants";
import { supabaseAdmin } from "@/lib/supabase/server";

export const revalidate = 3600;

interface PageProps { params: Promise<{ state: string; location: string }> }

export async function generateStaticParams() {
  return buildStaticParamsForFilter({ propertyTypeSlug: "ph", roomCount: ROOM_COUNTS["monoambiente"].count });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state, location } = await params;
  const { data: stateData } = await supabaseAdmin.from("tokko_state").select("id, name").eq("slug", state).single();
  const { data: locData } = await supabaseAdmin.from("tokko_location").select("name").eq("slug", location).eq("state_id", stateData?.id || 0).single();
  return buildProgrammaticMetadata({ propertyTypeSlug: "ph", roomSlug: "monoambiente", stateSlug: state, stateName: stateData?.name || state, locationSlug: location, locationName: locData?.name || location });
}

export default async function Page({ params }: PageProps) {
  const { state, location } = await params;
  return <ProgrammaticSearchPage propertyTypeSlug="ph" roomSlug="monoambiente" stateSlug={state} locationSlug={location} />;
}
