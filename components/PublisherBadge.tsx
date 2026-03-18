"use client";

import { BadgeCheck } from "lucide-react";
import type { PublisherType, BadgeContext } from "@/lib/publisher";
import { getPublisherBadgeConfig } from "@/lib/publisher";

interface PublisherBadgeProps {
  publisherType?: PublisherType;
  /** Backward-compat fallback when publisherType is not available */
  legacyType?: "inmobiliaria" | "dueno";
  context: BadgeContext;
  compact?: boolean;
}

export function PublisherBadge({
  publisherType,
  legacyType,
  context,
  compact,
}: PublisherBadgeProps) {
  // Resolve publisher type: prefer explicit, fallback to legacy
  const resolvedType: PublisherType =
    publisherType ??
    (legacyType === "inmobiliaria" ? "inmobiliaria-red" : "dueno-directo");

  const config = getPublisherBadgeConfig(resolvedType, context, compact);

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-background text-primary border border-border shadow-sm">
      {config.showCheckmark && <BadgeCheck className="h-3 w-3" />}
      {config.label}
    </span>
  );
}
