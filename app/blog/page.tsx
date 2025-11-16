import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/blog/posts';
import { BlogCard } from '@/components/blog/BlogCard';

export const metadata: Metadata = {
  title: 'Blog — Invoice Reminder Tips, Xero Automation & Getting Paid Faster',
  description:
    'Learn how to get paid faster with automated invoice reminders. Expert tips on Xero automation, invoice follow-up best practices, and accounts receivable management.',
  keywords: [
    'invoice reminders',
    'Xero automation',
    'get paid faster',
    'invoice follow-up',
    'accounts receivable',
    'late payment prevention',
  ],
  openGraph: {
    title: 'Paydly Blog — Invoice Reminder Tips & Best Practices',
    description: 'Expert tips on automated invoice reminders, Xero integration, and getting paid faster.',
    url: '/blog',
  },
  alternates: {
    canonical: '/blog',
  },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">Paydly Blog</h1>
          <p className="mt-4 text-lg text-slate-600">
            Expert tips on automated invoice reminders, Xero integration, and getting paid faster.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-indigo-200 bg-indigo-50 p-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">Ready to Get Paid Faster?</h2>
          <p className="mt-2 text-slate-600">
            Start automating your invoice reminders today with Paydly. Connect your Xero account and get paid 40% faster.
          </p>
          <div className="mt-6">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

