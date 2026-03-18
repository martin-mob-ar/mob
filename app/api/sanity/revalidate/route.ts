import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-sanity-secret");

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
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
