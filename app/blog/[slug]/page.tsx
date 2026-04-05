import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostBody from "@/components/blog/PostBody";
import BlogJsonLd from "@/components/blog/BlogJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { Badge } from "@/components/ui/badge";
import { sanityFetch } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import {
  postBySlugQuery,
  allPostSlugsQuery,
} from "@/lib/sanity/queries";
import type { Post } from "@/lib/sanity/types";
import { ArrowLeft } from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.mob.ar";

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>({
    query: allPostSlugsQuery,
    tags: ["post"],
    fallback: [],
  });
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await sanityFetch<Post | null>({
    query: postBySlugQuery,
    params: { slug },
    tags: ["post"],
  });

  if (!post) {
    return { title: "Artículo no encontrado | Mob.ar" };
  }

  const title = (post.seo?.metaTitle || post.title) + " | Mob.ar";
  const description = post.seo?.metaDescription || post.excerpt;
  const ogImage = post.seo?.ogImage || post.coverImage;
  const imageUrl = urlFor(ogImage).width(1200).height(630).url();
  const canonicalUrl = `${APP_URL}/blog/${post.slug.current}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Mob",
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function estimateReadingTime(body: any[]): number {
  const text = body
    .filter((block: any) => block._type === "block")
    .map((block: any) =>
      block.children?.map((c: any) => c.text).join("") || ""
    )
    .join(" ");
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await sanityFetch<Post | null>({
    query: postBySlugQuery,
    params: { slug },
    tags: ["post"],
  });

  if (!post || !post.body) {
    notFound();
  }

  const readingTime = estimateReadingTime(post.body);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BlogJsonLd post={post} />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", href: "/" },
          { name: "Blog", href: "/blog" },
          ...(post.categories?.[0]
            ? [{ name: post.categories[0].title, href: `/blog/categoria/${post.categories[0].slug.current}` }]
            : []),
          { name: post.title, href: `/blog/${post.slug.current}` },
        ]}
      />

      <main className="container py-12 md:py-16">
        <article className="mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al blog
            </Link>
          </nav>

          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {post.categories.map((cat) => (
                <Link
                  key={cat.slug.current}
                  href={`/blog/categoria/${cat.slug.current}`}
                >
                  <Badge variant="secondary" className="cursor-pointer text-xs">
                    {cat.title}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="font-display text-3xl font-bold leading-tight md:text-4xl lg:text-[2.75rem]">
            {post.title}
          </h1>

          {/* Meta: author, date, reading time */}
          <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
            {post.author.image && (
              <Image
                src={urlFor(post.author.image).width(40).height(40).url()}
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-foreground">{post.author.name}</p>
              <p>
                <time dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
                {" · "}
                {readingTime} min de lectura
              </p>
            </div>
          </div>

          {/* Cover image */}
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={urlFor(post.coverImage).width(1200).height(675).url()}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>

          {/* Body */}
          <div className="mt-10">
            <PostBody body={post.body} />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
