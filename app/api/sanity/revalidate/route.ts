import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const expectedSecret = process.env.SANITY_REVALIDATE_SECRET;
  if (!expectedSecret) {
    return NextResponse.json({ message: "Webhook not configured" }, { status: 503 });
  }

  const secret = req.headers.get("x-sanity-secret") || "";
  try {
    const a = Buffer.from(secret);
    const b = Buffer.from(expectedSecret);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const type = body?._type as string | undefined;

    if (type === "post") {
      revalidateTag("post", { expire: 0 });
    } else if (type === "category") {
      revalidateTag("category", { expire: 0 });
    } else if (type === "author") {
      revalidateTag("author", { expire: 0 });
    }

    return NextResponse.json({ revalidated: true, type });
  } catch {
    return NextResponse.json(
      { message: "Error revalidating" },
      { status: 500 }
    );
  }
}
