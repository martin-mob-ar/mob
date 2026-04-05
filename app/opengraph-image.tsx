import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Mob - Alquileres 100% online en Argentina";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          background: "linear-gradient(135deg, #4F5FFF 0%, #6B7AFF 50%, #8B96FF 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Mob logo text */}
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
        {/* Tagline */}
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
    { ...size }
  );
}
