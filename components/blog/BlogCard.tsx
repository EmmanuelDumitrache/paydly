import Link from 'next/link';
import type { BlogPost } from '@/lib/blog/posts';

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>{post.category}</span>
        <span>•</span>
        <time dateTime={post.publishedAt}>
          {new Date(post.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        <span>•</span>
        <span>{post.readingTime} min read</span>
      </div>
      <h2 className="mt-3 text-xl font-semibold text-slate-900 group-hover:text-indigo-600 transition">
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      <p className="mt-2 text-sm text-slate-600 line-clamp-2">{post.description}</p>
      <Link
        href={`/blog/${post.slug}`}
        className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition"
      >
        Read more →
      </Link>
    </article>
  );
}

