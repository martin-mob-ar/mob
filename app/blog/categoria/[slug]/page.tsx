import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/blog/PostCard";
import { Badge } from "@/components/ui/badge";
import { sanityFetch } from "@/lib/sanity/client";
import {
  categoryBySlugQuery,
  postsByCategoryQuery,
  allCategorySlugsQuery,
  allCategoriesQuery,
} from "@/lib/sanity/queries";
import type { Post, Category } from "@/lib/sanity/types";
import { ArrowLeft } from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.mob.ar";

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>({
    query: allCategorySlugsQuery,
    tags: ["category"],
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
  const category = await sanityFetch<Category | null>({
    query: categoryBySlugQuery,
    params: { slug },
    tags: ["category"],
  });

  if (!category) {
    return { title: "Categoría no encontrada | Mob.ar" };
  }

  const title = `${category.title} | Blog | Mob.ar`;
  const description =
    category.description ||
    `Artículos sobre ${category.title.toLowerCase()} en el blog de Mob.ar`;

  return {
    title,
    description,
    alternates: { canonical: `${APP_URL}/blog/categoria/${category.slug.current}` },
    openGraph: {
      title,
      description,
      url: `${APP_URL}/blog/categoria/${category.slug.current}`,
      siteName: "Mob",
      type: "website",
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [category, posts, allCategories] = await Promise.all([
    sanityFetch<Category | null>({
      query: categoryBySlugQuery,
      params: { slug },
      tags: ["category"],
      fallback: null,
    }),
    sanityFetch<Post[]>({
      query: postsByCategoryQuery,
      params: { categorySlug: slug },
      tags: ["post"],
      fallback: [],
    }),
    sanityFetch<Category[]>({
      query: allCategoriesQuery,
      tags: ["category"],
      fallback: [],
    }),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12 md:py-16">
        <nav className="mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al blog
          </Link>
        </nav>

        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            {category.title}
          </h1>
          {category.description && (
            <p className="mt-3 text-lg text-muted-foreground">
              {category.description}
            </p>
          )}
        </div>

        {allCategories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link href="/blog">
              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                Todos
              </Badge>
            </Link>
            {allCategories.map((cat) => (
              <Link
                key={cat._id}
                href={`/blog/categoria/${cat.slug.current}`}
              >
                <Badge
                  variant={cat.slug.current === slug ? "default" : "outline"}
                  className="cursor-pointer hover:bg-secondary"
                >
                  {cat.title}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">
              Aún no hay artículos en esta categoría.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
