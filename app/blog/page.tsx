import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/blog/PostCard";
import { Badge } from "@/components/ui/badge";
import { sanityFetch } from "@/lib/sanity/client";
import { allPostsQuery, allCategoriesQuery } from "@/lib/sanity/queries";
import type { Post, Category } from "@/lib/sanity/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.mob.ar";

export const metadata: Metadata = {
  title: "Blog | Mob.ar",
  description:
    "Artículos sobre alquileres, mercado inmobiliario, guías de barrios y consejos para inquilinos y propietarios.",
  alternates: {
    canonical: `${APP_URL}/blog`,
  },
  openGraph: {
    title: "Blog | Mob.ar",
    description:
      "Artículos sobre alquileres, mercado inmobiliario, guías de barrios y consejos para inquilinos y propietarios.",
    url: `${APP_URL}/blog`,
    siteName: "Mob",
    type: "website",
  },
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    sanityFetch<Post[]>({ query: allPostsQuery, tags: ["post"], fallback: [] }),
    sanityFetch<Category[]>({ query: allCategoriesQuery, tags: ["category"], fallback: [] }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12 md:py-16">
        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold md:text-4xl">Blog</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Guías, consejos y novedades sobre el mercado de alquileres
          </p>
        </div>

        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link href="/blog">
              <Badge variant="default" className="cursor-pointer">
                Todos
              </Badge>
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/blog/categoria/${cat.slug.current}`}
              >
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
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
              Próximamente publicaremos artículos. ¡Volvé pronto!
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
