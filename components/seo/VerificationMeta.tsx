import Script from 'next/script';

interface VerificationMetaProps {
  google?: string;
  bing?: string;
  yandex?: string;
}

/**
 * Google Search Console Verification Meta Tag Component
 * 
 * Usage:
 * 1. Go to https://search.google.com/search-console
 * 2. Add your property (domain or URL prefix)
 * 3. Choose "HTML tag" verification method
 * 4. Copy the content value from the meta tag
 * 5. Add it to app/layout.tsx in the metadata.verification.google field
 * 6. Or use this component: <VerificationMeta google="your-verification-code" />
 */
export function VerificationMeta({ google, bing, yandex }: VerificationMetaProps) {
  return (
    <>
      {google && (
        <meta name="google-site-verification" content={google} />
      )}
      {bing && (
        <meta name="msvalidate.01" content={bing} />
      )}
      {yandex && (
        <meta name="yandex-verification" content={yandex} />
      )}
    </>
  );
}

