import { PortableText, type PortableTextReactComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const components: Partial<PortableTextReactComponents> = {
  block: {
    h2: ({ children, value }) => {
      const text = value.children?.map((c: any) => c.text).join("") || "";
      return (
        <h2 id={slugify(text)} className="scroll-mt-24">
          {children}
        </h2>
      );
    },
    h3: ({ children, value }) => {
      const text = value.children?.map((c: any) => c.text).join("") || "";
      return (
        <h3 id={slugify(text)} className="scroll-mt-24">
          {children}
        </h3>
      );
    },
    h4: ({ children, value }) => {
      const text = value.children?.map((c: any) => c.text).join("") || "";
      return (
        <h4 id={slugify(text)} className="scroll-mt-24">
          {children}
        </h4>
      );
    },
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href || "";
      const isExternal = href.startsWith("http");
      return (
        <a
          href={href}
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-8">
          <Image
            src={urlFor(value).width(1200).url()}
            alt={value.alt || ""}
            width={1200}
            height={675}
            className="rounded-lg"
            sizes="(max-width: 768px) 100vw, 720px"
          />
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

export default function PostBody({ body }: { body: PortableTextBlock[] }) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-blockquote:border-l-primary">
      <PortableText value={body} components={components} />
    </div>
  );
}
