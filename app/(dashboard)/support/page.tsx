// @ts-nocheck - Supabase generic types cause issues with type inference
import { Mail, Clock, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { sendSupportEmail } from './actions';

export default function SupportPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const success = searchParams.success === 'true';
  const error = typeof searchParams.error === 'string' ? searchParams.error : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Support</h1>
        <p className="mt-1 text-sm text-slate-500">
          Get help with Paydly or send us your feedback
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">Message sent successfully!</p>
              <p className="text-sm text-emerald-700">We&apos;ll get back to you within 24-48 hours.</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <div>
              <p className="text-sm font-semibold text-rose-900">Failed to send message</p>
              <p className="text-sm text-rose-700">
                {error === 'missing_fields' && 'Please fill in all fields'}
                {error === 'email_not_configured' && 'Email service not configured'}
                {error === 'send_failed' && 'Something went wrong. Please try again or email us directly at support@paydly.io'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Info Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
              <Mail className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Email</p>
              <p className="text-xs text-slate-500">support@paydly.io</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <Clock className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Response Time</p>
              <p className="text-xs text-slate-500">24-48 hours</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <MessageSquare className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Support Hours</p>
              <p className="text-xs text-slate-500">Mon-Fri, 9am-5pm AEST</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Send us a message</h2>
        <p className="mt-1 text-sm text-slate-500">
          We&apos;ll get back to you as soon as possible
        </p>

        <form action={sendSupportEmail} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-700">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="How can we help?"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Tell us more about your question or issue..."
            />
          </div>

          <button
            type="submit"
            className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            Send Message
          </button>
        </form>
      </div>

      {/* FAQ Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Frequently Asked Questions</h2>
        <p className="mt-1 text-sm text-slate-500">
          Quick answers to common questions
        </p>

        <div className="mt-6 space-y-4">
          <details className="group rounded-xl border border-slate-200 bg-slate-50 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900 list-none flex items-center justify-between">
              How do I connect my Xero account?
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm text-slate-600">
              Go to Settings, find the &quot;Xero connection&quot; section, and click &quot;Connect Xero&quot;. You&apos;ll be redirected to Xero to authorize the connection. Once connected, click &quot;Sync now&quot; to import your invoices.
            </p>
          </details>

          <details className="group rounded-xl border border-slate-200 bg-slate-50 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900 list-none flex items-center justify-between">
              When are reminders sent automatically?
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm text-slate-600">
              Paydly automatically checks for overdue invoices and sends reminders daily at 9:00 AM AEST. You can customize when reminders are sent (e.g., 7, 14, 21 days after due date) in Settings under &quot;Custom Reminder Schedule&quot;.
            </p>
          </details>

          <details className="group rounded-xl border border-slate-200 bg-slate-50 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900 list-none flex items-center justify-between">
              Can I pause reminders temporarily?
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm text-slate-600">
              Yes! Go to Settings and use the &quot;Global Reminder Control&quot; toggle to pause all automated reminders. You can resume them at any time. This is useful if you&apos;re on vacation or need to temporarily stop all emails.
            </p>
          </details>

          <details className="group rounded-xl border border-slate-200 bg-slate-50 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900 list-none flex items-center justify-between">
              How do I cancel my subscription?
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm text-slate-600">
              Go to Billing and click &quot;Manage subscription&quot;. You&apos;ll be taken to the Stripe customer portal where you can cancel your subscription. Your access will continue until the end of your billing period.
            </p>
          </details>

          <details className="group rounded-xl border border-slate-200 bg-slate-50 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900 list-none flex items-center justify-between">
              What happens if my Xero connection expires?
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm text-slate-600">
              Paydly automatically refreshes your Xero connection token. If there&apos;s an issue, you&apos;ll see a notification on your dashboard. Simply reconnect your Xero account in Settings to resume automated syncing and reminders.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}

