import { NextResponse } from "next/server";
import { buildPropertySitemap, toSitemapXml } from "@/lib/sitemap/builders";

export const dynamic = "force-dynamic";

export async function GET() {
  const entries = await buildPropertySitemap();
  return new NextResponse(toSitemapXml(entries), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
