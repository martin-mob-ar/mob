import { urlFor } from "@/lib/sanity/image";
import type { Post } from "@/lib/sanity/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.mob.ar";

export default function BlogJsonLd({ post }: { post: Post }) {
  const imageUrl = post.seo?.ogImage
    ? urlFor(post.seo.ogImage).width(1200).height(630).url()
    : urlFor(post.coverImage).width(1200).height(630).url();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    image: imageUrl,
    datePublished: post.publishedAt,
    ...(post._updatedAt && { dateModified: post._updatedAt }),
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "Mob",
      logo: {
        "@type": "ImageObject",
        url: `${APP_URL}/assets/mob-logo-new.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${APP_URL}/blog/${post.slug.current}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/<\//g, '<\\/') }}
    />
  );
}
