import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Artículo",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Extracto",
      type: "text",
      rows: 3,
      description: "Resumen corto para tarjetas y meta description",
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "coverImage",
      title: "Imagen de portada",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Contenido",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Cita", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Negrita", value: "strong" },
              { title: "Cursiva", value: "em" },
              { title: "Subrayado", value: "underline" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (rule) =>
                      rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
                  },
                  {
                    name: "blank",
                    type: "boolean",
                    title: "Abrir en nueva pestaña",
                    initialValue: false,
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Texto alternativo",
              validation: (rule: any) => rule.required(),
            },
            {
              name: "caption",
              type: "string",
              title: "Pie de imagen",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "author",
      title: "Autor",
      type: "reference",
      to: [{ type: "author" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categories",
      title: "Categorías",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
    }),
    defineField({
      name: "publishedAt",
      title: "Fecha de publicación",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        {
          name: "metaTitle",
          title: "Meta título",
          type: "string",
          description: "Sobrescribe el título en <title> y OG. Dejar vacío para usar el título del artículo.",
        },
        {
          name: "metaDescription",
          title: "Meta descripción",
          type: "text",
          rows: 2,
          description: "Sobrescribe la meta description. Dejar vacío para usar el extracto.",
        },
        {
          name: "ogImage",
          title: "Imagen OG",
          type: "image",
          description: "Sobrescribe la imagen de Open Graph. Dejar vacío para usar la imagen de portada.",
        },
      ],
    }),
  ],
  orderings: [
    {
      title: "Fecha de publicación (más reciente)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "coverImage",
    },
    prepare({ title, author, media }) {
      return {
        title,
        subtitle: author ? `por ${author}` : "",
        media,
      };
    },
  },
});
