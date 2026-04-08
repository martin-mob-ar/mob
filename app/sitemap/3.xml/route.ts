import { NextResponse } from "next/server";
import { buildProgrammaticSitemap, toSitemapXml } from "@/lib/sitemap/builders";

export const dynamic = "force-dynamic";

export async function GET() {
  const entries = await buildProgrammaticSitemap();
  return new NextResponse(toSitemapXml(entries), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
