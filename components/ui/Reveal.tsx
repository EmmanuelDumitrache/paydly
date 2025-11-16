'use client';

import { useEffect, useRef, useState } from 'react';

type RevealProps = {
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
};

export default function Reveal({ as = 'div', children, className, delayMs = 0 }: RevealProps) {
  const Comp = as as any;
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const run = () => setVisible(true);
            if (delayMs > 0) {
              setTimeout(run, delayMs);
            } else {
              run();
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delayMs]);

  return (
    <Comp
      ref={ref}
      className={[
        'opacity-0 translate-y-3 will-change-transform will-change-opacity',
        visible ? 'animate-fade-up' : '',
        className || '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Comp>
  );
}


