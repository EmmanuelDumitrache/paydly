import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.paydly.io';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/auth/',
          '/login',
          '/signup',
          '/settings/',
          '/invoices/',
          '/billing/',
          '/support/',
          '/templates/',
          '/history/',
          '/upcoming/',
          '/overdue/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

