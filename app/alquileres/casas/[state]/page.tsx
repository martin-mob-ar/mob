import type { Metadata } from "next";
import ProgrammaticSearchPage from "@/lib/seo/programmatic-page";
import { buildProgrammaticMetadata } from "@/lib/seo/programmatic-metadata";
import { buildStateParamsForFilter } from "@/lib/seo/programmatic-static-params";
import { supabaseAdmin } from "@/lib/supabase/server";

export const revalidate = 3600;

interface PageProps { params: Promise<{ state: string }> }

export async function generateStaticParams() {
  return buildStateParamsForFilter({ propertyTypeSlug: "casas" });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state } = await params;
  const { data } = await supabaseAdmin.from("tokko_state").select("name").eq("slug", state).single();
  return buildProgrammaticMetadata({ propertyTypeSlug: "casas", stateSlug: state, stateName: data?.name || state });
}

export default async function Page({ params }: PageProps) {
  const { state } = await params;
  return <ProgrammaticSearchPage propertyTypeSlug="casas" stateSlug={state} />;
}
