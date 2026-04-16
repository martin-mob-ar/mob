import { ImageResponse } from "next/og";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const revalidate = 3600; // Cache for 1 hour

export const alt = "Propiedad en alquiler | Mob.ar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function extractPropertyId(slugOrId: string): number | null {
  if (/^\d+$/.test(slugOrId)) return parseInt(slugOrId);
  const match = slugOrId.match(/-(\d+)$/);
  return match ? parseInt(match[1]) : null;
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const propertyId = extractPropertyId(slug);

  if (!propertyId) return defaultImage();

  const { data } = await supabaseAdmin
    .from("properties_read")
    .select(
      "cover_photo_url, property_type_name, room_amount, location_name, parent_location_name, currency, price, valor_total_primary, total_surface"
    )
    .eq("property_id", propertyId)
    .single();

  if (!data?.cover_photo_url) return defaultImage();

  const typeName = data.property_type_name || "Propiedad";
  const ambientes =
    data.room_amount && data.room_amount > 0
      ? `${data.room_amount} ${data.room_amount === 1 ? "ambiente" : "ambientes"}`
      : "";
  const headline = [typeName, ambientes].filter(Boolean).join(" ");
  const location = [data.location_name, data.parent_location_name]
    .filter(Boolean)
    .join(", ");

  const totalPrice = Number(data.valor_total_primary || data.price || 0);
  const priceText =
    totalPrice > 0 && data.currency
      ? `$${totalPrice.toLocaleString("es-AR")}`
      : "";

  const surfaceText = data.total_surface ? `${data.total_surface} m²` : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Property photo background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.cover_photo_url}
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Dark gradient overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "65%",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
            display: "flex",
          }}
        />

        {/* Mob badge */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 32,
            display: "flex",
            alignItems: "center",
            background: "rgba(0,0,0,0.55)",
            padding: "10px 22px",
            borderRadius: 14,
          }}
        >
          <span
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            mob
          </span>
        </div>

        {/* Property info */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "0 48px 44px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Type + ambientes */}
          <div
            style={{
              display: "flex",
              fontSize: 46,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.2,
            }}
          >
            {headline}
          </div>

          {/* Location */}
          {location && (
            <div
              style={{
                display: "flex",
                fontSize: 28,
                color: "rgba(255,255,255,0.8)",
                marginTop: 8,
              }}
            >
              {location}
            </div>
          )}

          {/* Price + surface */}
          {(priceText || surfaceText) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginTop: 16,
              }}
            >
              {priceText && (
                <div
                  style={{
                    display: "flex",
                    fontSize: 34,
                    fontWeight: 700,
                    color: "#818cf8",
                  }}
                >
                  {priceText}
                </div>
              )}
              {priceText && surfaceText && (
                <div
                  style={{
                    display: "flex",
                    fontSize: 24,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  |
                </div>
              )}
              {surfaceText && (
                <div
                  style={{
                    display: "flex",
                    fontSize: 28,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {surfaceText}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}

function defaultImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #4F5FFF 0%, #6B7AFF 50%, #8B96FF 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 140,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.03em",
            marginBottom: 20,
          }}
        >
          mob
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            color: "rgba(255, 255, 255, 0.9)",
            fontWeight: 500,
          }}
        >
          Alquileres 100% online
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
