import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";
import { sanityConfig } from "./config";

export default defineConfig({
  name: "mob-blog",
  title: "Mob Blog",
  ...sanityConfig,
  basePath: sanityConfig.studioUrl,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
