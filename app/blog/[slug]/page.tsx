import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { getBlogPost, getRelatedPosts } from '@/lib/blog/posts';
import { RelatedPosts } from '@/components/blog/RelatedPosts';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { getAllBlogPosts } = await import('@/lib/blog/posts');
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} • Paydly Blog`,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

function parseMarkdown(content: string): React.ReactNode {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let listItems: React.ReactNode[] = [];
  let inList = false;
  let keyCounter = 0;

  function flushParagraph() {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ');
      elements.push(renderParagraph(text, keyCounter++));
      currentParagraph = [];
    }
  }

  function flushList() {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`ul-${keyCounter++}`} className="mt-4 list-disc list-inside space-y-2 text-slate-600">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  }

  function renderParagraph(text: string, key: number): React.ReactNode {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const boldRegex = /\*\*([^*]+)\*\*/g;
    
    if (!linkRegex.test(text) && !boldRegex.test(text)) {
      return (
        <p key={key} className="mt-4 text-slate-600">
          {text}
        </p>
      );
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const allMatches: Array<{ index: number; length: number; type: 'link' | 'bold'; content: string; href?: string }> = [];

    // Find all links
    linkRegex.lastIndex = 0;
    let match;
    while ((match = linkRegex.exec(text)) !== null) && match.index !== undefined) {
      allMatches.push({
        index: match.index,
        length: match[0].length,
        type: 'link',
        content: match[1],
        href: match[2],
      });
    }

    // Find all bold text
    boldRegex.lastIndex = 0;
    while ((match = boldRegex.exec(text)) !== null && match.index !== undefined) {
      allMatches.push({
        index: match.index,
        length: match[0].length,
        type: 'bold',
        content: match[1],
      });
    }

    // Sort by index
    allMatches.sort((a, b) => a.index - b.index);

    // Build parts
    allMatches.forEach((m) => {
      if (m.index > lastIndex) {
        parts.push(text.substring(lastIndex, m.index));
      }
      if (m.type === 'link' && m.href) {
        const href = m.href.startsWith('/') ? m.href : m.href;
        parts.push(
          <Link key={`link-${key}-${m.index}`} href={href} className="text-indigo-600 hover:text-indigo-500 font-semibold">
            {m.content}
          </Link>
        );
      } else if (m.type === 'bold') {
        parts.push(
          <strong key={`bold-${key}-${m.index}`} className="font-semibold text-slate-900">
            {m.content}
          </strong>
        );
      }
      lastIndex = m.index + m.length;
    });

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return (
      <p key={key} className="mt-4 text-slate-600">
        {parts}
      </p>
    );
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('# ')) {
      flushList();
      flushParagraph();
      elements.push(
        <h1 key={`h1-${keyCounter++}`} className="mt-8 text-3xl font-bold text-slate-900">
          {line.substring(2)}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      flushList();
      flushParagraph();
      elements.push(
        <h2 key={`h2-${keyCounter++}`} className="mt-8 text-2xl font-semibold text-slate-900">
          {line.substring(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      flushList();
      flushParagraph();
      elements.push(
        <h3 key={`h3-${keyCounter++}`} className="mt-6 text-xl font-semibold text-slate-900">
          {line.substring(4)}
        </h3>
      );
    } else if (line.startsWith('- ')) {
      flushParagraph();
      if (!inList) {
        inList = true;
      }
      const listItem = line.substring(2);
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const hasLinks = linkRegex.test(listItem);
      
      if (hasLinks) {
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        const matches = Array.from(listItem.matchAll(linkRegex));
        matches.forEach((match) => {
          if (match.index !== undefined) {
            if (match.index > lastIndex) {
              parts.push(listItem.substring(lastIndex, match.index));
            }
            const href = match[2].startsWith('/') ? match[2] : match[2];
            parts.push(
              <Link key={`link-${keyCounter}-${match.index}`} href={href} className="text-indigo-600 hover:text-indigo-500 font-semibold">
                {match[1]}
              </Link>
            );
            lastIndex = match.index + match[0].length;
          }
        });
        if (lastIndex < listItem.length) {
          parts.push(listItem.substring(lastIndex));
        }
        listItems.push(<li key={`li-${keyCounter++}`}>{parts}</li>);
      } else {
        listItems.push(<li key={`li-${keyCounter++}`}>{listItem}</li>);
      }
    } else if (line.length > 0) {
      if (inList) {
        flushList();
      }
      currentParagraph.push(line);
    } else {
      flushList();
      flushParagraph();
    }
  }

  flushList();
  flushParagraph();

  return <>{elements}</>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(slug, 2);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.paydly.io';

  const blogPostSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.slug}`,
    },
  };

  return (
    <>
      <Script
        id="blog-post-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }}
      />
      <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <Link
              href="/blog"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition"
            >
              ← Back to Blog
            </Link>
            <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600">
                {post.category}
              </span>
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <span>•</span>
              <span>{post.readingTime} min read</span>
              <span>•</span>
              <span>By {post.author}</span>
            </div>
            <h1 className="mt-4 text-4xl font-bold text-slate-900 sm:text-5xl">{post.title}</h1>
            <p className="mt-4 text-xl text-slate-600">{post.description}</p>
          </div>

          <div className="prose prose-slate max-w-none border-t border-slate-200 pt-8">
            {parseMarkdown(post.content)}
          </div>

          <div className="mt-12 rounded-2xl border border-indigo-200 bg-indigo-50 p-8">
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

          {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}
        </div>
      </article>
    </>
  );
}

