# Google Search Console Setup Guide

This guide walks you through setting up Google Search Console (GSC) for Paydly to monitor search performance and ensure proper indexing.

## Prerequisites

- Your domain is live and accessible (e.g., `https://paydly.com` or `https://paydly.vercel.app`)
- You have access to your website's HTML source or can modify the root layout

## Step 1: Create a Google Search Console Account

1. Go to [https://search.google.com/search-console](https://search.google.com/search-console)
2. Sign in with your Google account
3. Click **"Add Property"**

## Step 2: Add Your Property

You have two options:

### Option A: Domain Property (Recommended)
- Enter your domain: `paydly.com` (without https:// or www)
- This covers all subdomains and protocols
- Requires DNS verification

### Option B: URL Prefix Property
- Enter your full URL: `https://paydly.com` or `https://paydly.vercel.app`
- More specific, easier to verify
- Use this if you're on a subdomain or specific deployment

**For Vercel deployments, use URL Prefix with your Vercel domain.**

## Step 3: Verify Ownership

Google will show several verification methods. We'll use the **HTML tag method**:

1. Select **"HTML tag"** verification method
2. You'll see a meta tag like:
   ```html
   <meta name="google-site-verification" content="ABC123xyz..." />
   ```
3. Copy the **content value** (the part after `content="`)

## Step 4: Add Verification to Paydly

### Method 1: Using Metadata (Recommended)

Edit `app/layout.tsx` and update the verification field:

```typescript
export const metadata: Metadata = {
  // ... other metadata
  verification: {
    google: 'your-verification-code-here', // Paste the content value here
  },
};
```

### Method 2: Using VerificationMeta Component

If you prefer using the component, add it to your root layout:

```tsx
import { VerificationMeta } from '@/components/seo/VerificationMeta';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <VerificationMeta google="your-verification-code-here" />
      </head>
      {/* ... */}
    </html>
  );
}
```

**Note:** In Next.js 14 App Router, metadata is preferred over manual head tags.

## Step 5: Verify in Google Search Console

1. Go back to Google Search Console
2. Click **"Verify"**
3. If successful, you'll see: ✅ **"Ownership verified"**

## Step 6: Submit Your Sitemap

1. In Google Search Console, go to **"Sitemaps"** in the left sidebar
2. Enter your sitemap URL: `https://yourdomain.com/sitemap.xml`
3. Click **"Submit"**
4. Google will start crawling your site

## Step 7: Request Indexing (Optional but Recommended)

1. Go to **"URL Inspection"** in the left sidebar
2. Enter your homepage URL: `https://yourdomain.com`
3. Click **"Request Indexing"**
4. Repeat for key pages:
   - `/about`
   - `/pricing`
   - `/privacy`
   - `/terms`

## Step 8: Monitor Performance

After a few days, check:

- **Performance**: See which keywords bring traffic
- **Coverage**: Check for indexing errors
- **Core Web Vitals**: Monitor page speed metrics
- **Mobile Usability**: Ensure mobile-friendly pages

## Troubleshooting

### Verification Fails

- **Check deployment**: Ensure your site is live and the meta tag is visible
- **View source**: Right-click → View Page Source → Search for `google-site-verification`
- **Wait a few minutes**: Sometimes it takes time for changes to propagate
- **Try alternative method**: Use DNS verification if HTML tag doesn't work

### Sitemap Not Found

- Verify `https://yourdomain.com/sitemap.xml` is accessible
- Check that `app/sitemap.ts` is properly configured
- Ensure `NEXT_PUBLIC_APP_URL` environment variable is set correctly

### Pages Not Indexing

- Check robots.txt: Ensure pages aren't blocked
- Verify noindex meta tags: Dashboard/auth pages should be noindex (already configured)
- Request indexing manually for important pages
- Be patient: Indexing can take days to weeks

## Next Steps

1. **Set up Google Analytics 4** (optional but recommended)
   - Link GA4 to GSC for better insights
   - Add GA4 tracking code to your site

2. **Monitor regularly**
   - Check GSC weekly for errors
   - Review search queries and click-through rates
   - Optimize based on performance data

3. **Submit updated sitemap** after major content changes

## Resources

- [Google Search Console Help](https://support.google.com/webmasters)
- [Rich Results Test](https://search.google.com/test/rich-results) - Test structured data
- [PageSpeed Insights](https://pagespeed.web.dev/) - Check Core Web Vitals

---

**Status**: ✅ Ready for GSC setup  
**Estimated Time**: 10-15 minutes  
**Last Updated**: 2025-01-20

