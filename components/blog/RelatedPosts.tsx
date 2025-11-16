import Link from 'next/link';
import type { BlogPost } from '@/lib/blog/posts';

interface RelatedPostsProps {
  posts: BlogPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <div className="mt-12 border-t border-slate-200 pt-12">
      <h2 className="text-2xl font-semibold text-slate-900">Related Articles</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.slug} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{post.category}</span>
              <span>•</span>
              <span>{post.readingTime} min read</span>
            </div>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              <Link href={`/blog/${post.slug}`} className="hover:text-indigo-600 transition">
                {post.title}
              </Link>
            </h3>
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">{post.description}</p>
            <Link
              href={`/blog/${post.slug}`}
              className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition"
            >
              Read article →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

