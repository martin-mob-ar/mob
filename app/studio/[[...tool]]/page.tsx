"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/lib/sanity/studio-config";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
