import type { Metadata } from "next";
import ProgrammaticSearchPage from "@/lib/seo/programmatic-page";
import { buildProgrammaticMetadata } from "@/lib/seo/programmatic-metadata";
import { buildStateParamsForFilter } from "@/lib/seo/programmatic-static-params";
import { ROOM_COUNTS } from "@/lib/seo/programmatic-constants";
import { supabaseAdmin } from "@/lib/supabase/server";

export const revalidate = 3600;

interface PageProps { params: Promise<{ state: string }> }

export async function generateStaticParams() {
  return buildStateParamsForFilter({ roomCount: ROOM_COUNTS["4-ambientes"].count });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state } = await params;
  const { data } = await supabaseAdmin.from("tokko_state").select("name").eq("slug", state).single();
  return buildProgrammaticMetadata({ roomSlug: "4-ambientes", stateSlug: state, stateName: data?.name || state });
}

export default async function Page({ params }: PageProps) {
  const { state } = await params;
  return <ProgrammaticSearchPage roomSlug="4-ambientes" stateSlug={state} />;
}