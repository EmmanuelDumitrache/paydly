const TESTIMONIALS = [
  {
    name: 'Sarah, Consultant',
    quote: '“I got paid two weeks faster on average and never had to send a manual follow-up.”',
  },
  {
    name: 'Mike, Freelance Designer',
    quote: '“Paydly saved me three hours every week. It just runs while I work on client projects.”',
  },
];

export function SocialProof() {
  return (
    <section id="social-proof" className="bg-slate-50 py-20">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Coming soon
          </span>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Loved by service businesses</h2>
          <p className="mt-4 text-base text-slate-600">
            Early adopters are already saving hours and unlocking faster payments.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {TESTIMONIALS.map((testimonial) => (
            <figure key={testimonial.name} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <blockquote className="text-base text-slate-600">{testimonial.quote}</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-slate-900">
                {testimonial.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

