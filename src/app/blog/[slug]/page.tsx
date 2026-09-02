import React from "react";
import { notFound } from "next/navigation";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/api";
import BlogPostLiveView from "@/components/blog/BlogPostLiveView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | Nose Creek Physiotherapy"
    };
  }

  return {
    title: `${post.seo?.title || post.title} | Nose Creek Physiotherapy`,
    description: post.seo?.description || post.excerpt,
    openGraph: {
      title: post.seo?.ogTitle || post.title,
      description: post.seo?.ogDescription || post.excerpt,
      images: [{ url: post.seo?.ogImage || post.featuredImage }]
    }
  };
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getBlogPosts();

  return (
    <>
      <SchemaMarkup type="Article" data={post} />
      <BlogPostLiveView initialPost={post} allPosts={allPosts} />
    </>
  );
}
