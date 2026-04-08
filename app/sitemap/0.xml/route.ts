import { NextResponse } from "next/server";
import { buildStaticAndBlogSitemap, toSitemapXml } from "@/lib/sitemap/builders";

export const dynamic = "force-dynamic";

export async function GET() {
  const entries = await buildStaticAndBlogSitemap();
  return new NextResponse(toSitemapXml(entries), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
