import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity/image";
import type { Post } from "@/lib/sanity/types";
import { Badge } from "@/components/ui/badge";

function estimateReadingTime(excerpt: string): number {
  // Rough estimate: average blog post is ~4-6 min read
  // We only have excerpt, so default to a reasonable estimate
  return Math.max(3, Math.ceil(excerpt.split(/\s+/).length / 40));
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PostCard({ post }: { post: Post }) {
  const readingTime = estimateReadingTime(post.excerpt);

  return (
    <Link
      href={`/blog/${post.slug.current}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-card"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={urlFor(post.coverImage).width(600).height(338).url()}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-5">
        {post.categories && post.categories.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {post.categories.map((cat) => (
              <Badge
                key={cat.slug.current}
                variant="secondary"
                className="text-xs font-medium"
              >
                {cat.title}
              </Badge>
            ))}
          </div>
        )}
        <h3 className="font-display text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden="true">&middot;</span>
          <span>{readingTime} min de lectura</span>
        </div>
      </div>
    </Link>
  );
}
