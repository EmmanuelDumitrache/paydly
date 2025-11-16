import { CTA } from '@/components/landing/CTA';
import { FAQ } from '@/components/landing/FAQ';
import { Features } from '@/components/landing/Features';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Pricing } from '@/components/landing/Pricing';
import { Problem } from '@/components/landing/Problem';
import { SocialProof } from '@/components/landing/SocialProof';
import Reveal from '@/components/ui/Reveal';

export default function Home() {
  return (
    <>
      <Hero />
      <Reveal>
        <Problem />
      </Reveal>
      <Reveal delayMs={100}>
        <HowItWorks />
      </Reveal>
      <Reveal delayMs={200}>
        <Features />
      </Reveal>
      <Reveal delayMs={300}>
        <SocialProof />
      </Reveal>
      <Reveal delayMs={200}>
        <FAQ />
      </Reveal>
      <Reveal delayMs={100}>
        <Pricing />
      </Reveal>
      <Reveal>
        <CTA />
      </Reveal>
    </>
  );
}
