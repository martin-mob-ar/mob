import type { Metadata } from "next";
import ProgrammaticSearchPage from "@/lib/seo/programmatic-page";
import { buildProgrammaticMetadata } from "@/lib/seo/programmatic-metadata";

export const revalidate = 3600;

export const metadata: Metadata = buildProgrammaticMetadata({ roomSlug: "4-ambientes" });

export default function Page() {
  return <ProgrammaticSearchPage roomSlug="4-ambientes" />;
}
