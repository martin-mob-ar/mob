const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.mob.ar";

interface PropertyJsonLdProps {
  title: string;
  description: string | null;
  slug: string;
  datePosted: string | null;
  images: string[];
  price: number | null;
  currency: string | null;
  locationName: string | null;
  parentLocationName: string | null;
  geoLat: number | null;
  geoLong: number | null;
  totalSurface: number | null;
  roomAmount: number | null;
  bathroomAmount: number | null;
  isAvailable: boolean;
}

export default function PropertyJsonLd({
  title,
  description,
  slug,
  datePosted,
  images,
  price,
  currency,
  locationName,
  parentLocationName,
  geoLat,
  geoLong,
  totalSurface,
  roomAmount,
  bathroomAmount,
  isAvailable,
}: PropertyJsonLdProps) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: title,
    url: `${APP_URL}/propiedad/${slug}`,
  };

  if (description) {
    jsonLd.description = description;
  }

  if (datePosted) {
    jsonLd.datePosted = datePosted;
  }

  if (images.length > 0) {
    jsonLd.image = images;
  }

  if (price != null && currency) {
    jsonLd.offers = {
      "@type": "Offer",
      priceCurrency: currency === "$" ? "ARS" : "USD",
      price,
      availability: isAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
    };
  }

  const address: Record<string, string> = {
    "@type": "PostalAddress",
    addressCountry: "AR",
  };
  if (locationName) address.addressLocality = locationName;
  if (parentLocationName) address.addressRegion = parentLocationName;
  if (locationName || parentLocationName) {
    jsonLd.address = address;
  }

  if (geoLat != null && geoLong != null) {
    jsonLd.geo = {
      "@type": "GeoCoordinates",
      latitude: geoLat,
      longitude: geoLong,
    };
  }

  if (totalSurface != null) {
    jsonLd.floorSize = {
      "@type": "QuantitativeValue",
      value: totalSurface,
      unitCode: "MTK",
    };
  }

  if (roomAmount != null) {
    jsonLd.numberOfRooms = roomAmount;
  }

  if (bathroomAmount != null) {
    jsonLd.numberOfBathroomsTotal = bathroomAmount;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
