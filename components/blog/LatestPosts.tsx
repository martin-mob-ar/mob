import Link from "next/link";
import type { Post } from "@/lib/sanity/types";
import PostCard from "./PostCard";
import { ArrowRight } from "lucide-react";

export default function LatestPosts({ posts }: { posts: Post[] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Últimos artículos
            </h2>
            <p className="mt-2 text-muted-foreground">
              Consejos, novedades y guías sobre alquileres
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden items-center gap-1.5 text-sm font-medium text-primary hover:underline md:flex"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Ver todos los artículos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
