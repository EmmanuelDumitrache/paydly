import Script from 'next/script';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paydly.com';

interface StructuredDataProps {
  type: 'organization' | 'softwareApplication' | 'faq' | 'breadcrumb';
  data?: Record<string, unknown>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const getSchema = () => {
    switch (type) {
      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Paydly',
          url: baseUrl,
          logo: `${baseUrl}/logo.png`,
          description:
            'Automate invoice reminders from Xero. Get paid faster with automated follow-ups at custom intervals.',
          sameAs: [
            // Add social media profiles when available
            // 'https://twitter.com/paydly',
            // 'https://linkedin.com/company/paydly',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'hello@paydly.com',
            contactType: 'Customer Service',
          },
        };

      case 'softwareApplication':
        return {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Paydly',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '29',
            priceCurrency: 'USD',
            priceValidUntil: '2025-12-31',
            availability: 'https://schema.org/InStock',
            url: `${baseUrl}/signup`,
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '1',
          },
          description:
            'Automate invoice reminders from Xero. Connect your Xero account and let Paydly send polite reminders at custom intervals.',
          url: baseUrl,
          ...data,
        };

      case 'faq':
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: data?.faqs || [],
        };

      case 'breadcrumb':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data?.items || [],
        };

      default:
        return null;
    }
  };

  const schema = getSchema();

  if (!schema) return null;

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

