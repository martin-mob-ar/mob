import { groq } from "next-sanity";

// Shared post fields projection
const postFields = `
  _id,
  title,
  slug,
  excerpt,
  coverImage,
  publishedAt,
  "author": author->{ name, slug, image, bio },
  "categories": categories[]->{ title, slug },
  seo
`;

// All published posts, newest first
export const allPostsQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    ${postFields}
  }
`;

// Single post by slug (includes body)
export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    ${postFields},
    body
  }
`;

// Posts by category slug
export const postsByCategoryQuery = groq`
  *[_type == "post" && defined(slug.current) && $categorySlug in categories[]->slug.current] | order(publishedAt desc) {
    ${postFields}
  }
`;

// Latest N posts
export const latestPostsQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0...$limit] {
    ${postFields}
  }
`;

// All categories
export const allCategoriesQuery = groq`
  *[_type == "category" && defined(slug.current)] | order(title asc) {
    _id,
    title,
    slug,
    description
  }
`;

// Single category by slug
export const categoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description
  }
`;

// All post slugs (for generateStaticParams)
export const allPostSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)].slug.current
`;

// All category slugs (for generateStaticParams)
export const allCategorySlugsQuery = groq`
  *[_type == "category" && defined(slug.current)].slug.current
`;

// Sitemap data: all posts with slug and updated date
export const sitemapPostsQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    "slug": slug.current,
    publishedAt,
    _updatedAt
  }
`;

// Sitemap data: all categories with slug
export const sitemapCategoriesQuery = groq`
  *[_type == "category" && defined(slug.current)] {
    "slug": slug.current,
    _updatedAt
  }
`;
