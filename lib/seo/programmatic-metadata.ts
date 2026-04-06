import type { Metadata } from "next";
import { PROPERTY_TYPES, ROOM_COUNTS, type PropertyTypeSlug, type RoomSlug } from "./programmatic-constants";

interface ProgrammaticMetadataParams {
  propertyTypeSlug?: PropertyTypeSlug;
  roomSlug?: RoomSlug;
  stateName?: string;
  stateSlug?: string;
  locationName?: string;
  locationSlug?: string;
}

export function buildProgrammaticMetadata(params: ProgrammaticMetadataParams): Metadata {
  const { propertyTypeSlug, roomSlug, stateName, stateSlug, locationName, locationSlug } = params;

  const typeInfo = propertyTypeSlug ? PROPERTY_TYPES[propertyTypeSlug] : null;
  const roomInfo = roomSlug ? ROOM_COUNTS[roomSlug] : null;

  // Build canonical path
  const segments = ["/alquileres"];
  if (propertyTypeSlug) segments.push(propertyTypeSlug);
  if (roomSlug) segments.push(roomSlug);
  if (stateSlug) segments.push(stateSlug);
  if (locationSlug) segments.push(locationSlug);
  const canonical = segments.join("/");

  let title: string;
  let description: string;
  const locationLabel = locationName && stateName
    ? `${locationName}, ${stateName}`
    : stateName || "Argentina";

  if (typeInfo && roomInfo && locationName) {
    // Type + rooms + location
    title = `${typeInfo.display} ${roomInfo.label} en alquiler en ${locationLabel}`;
    description = `${typeInfo.display} de ${roomInfo.label} en alquiler en ${locationLabel}. Propiedades verificadas en Mob.`;
  } else if (typeInfo && locationName && stateName) {
    // Type + state + location
    title = `${typeInfo.display} en alquiler en ${locationLabel}`;
    description = `Encontra ${typeInfo.display.toLowerCase()} en alquiler en ${locationLabel}. Propiedades verificadas, visitas y contratos 100% online en Mob.`;
  } else if (typeInfo && stateName) {
    // Type + state
    title = `${typeInfo.display} en alquiler en ${stateName}`;
    description = `${typeInfo.display} en alquiler en ${stateName}. Propiedades verificadas con visitas, reservas y contratos 100% online en Mob.`;
  } else if (typeInfo) {
    // Type only (national)
    title = `${typeInfo.display} en alquiler en Argentina`;
    description = `Encontra ${typeInfo.display.toLowerCase()} en alquiler en Argentina. Propiedades verificadas con contratos 100% online en Mob.`;
  } else if (roomInfo && locationName && stateName) {
    // Rooms + state + location
    title = `Alquileres de ${roomInfo.label} en ${locationLabel}`;
    description = `${roomInfo.titleLabel} en alquiler en ${locationLabel}. Departamentos, casas y PH verificados con contratos 100% online en Mob.`;
  } else if (roomInfo && stateName) {
    // Rooms + state
    title = `Alquileres de ${roomInfo.label} en ${stateName}`;
    description = `${roomInfo.titleLabel} en alquiler en ${stateName}. Departamentos, casas y PH verificados con contratos 100% online en Mob.`;
  } else if (roomInfo) {
    // Rooms only (national)
    title = `Alquileres de ${roomInfo.label} en Argentina`;
    description = `${roomInfo.titleLabel} en alquiler en Argentina. Departamentos, casas y PH verificados con contratos 100% online en Mob.`;
  } else {
    title = "Alquileres en Argentina";
    description = "Encontra alquileres verificados en Argentina con Mob.";
  }

  return { title, description, alternates: { canonical } };
}
