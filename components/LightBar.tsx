'use client';
// Nine lamps under the header, one per pipeline step: the lamp of the step on screen is lit,
// steps already passed stay warm. Decorative; the steps themselves are in the page.
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { PIPELINE } from '@/lib/content';

export default function LightBar() {
  const path = usePathname();
  const [now, setNow] = useState(-1);
  useEffect(() => {
    if (path !== '/') return;
    const ids: string[] = PIPELINE.map((s) => s.id);
    const els = ids.map((id) => document.querySelector<HTMLElement>(`[data-cam="${id}"]`)).filter(Boolean) as HTMLElement[];
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target, e.isIntersecting));
        const on = els.findIndex((el) => seen.get(el));
        if (on >= 0) setNow(on);
        else {
          // between steps or outside the pipeline: keep the last lamp if we're past it
          const first = els[0]?.getBoundingClientRect().top ?? 0;
          if (first > innerHeight / 2) setNow(-1);
          else if ((els.at(-1)?.getBoundingClientRect().bottom ?? 0) < innerHeight / 2) setNow(ids.length);
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);
  if (path !== '/') return null;
  return (
    <ol className="lightbar" aria-hidden="true" data-idle={now < 0 || undefined}>
      {PIPELINE.map((s, i) => (
        <li key={s.id} className={i === now ? 'is-now' : i < now ? 'is-past' : undefined} style={{ '--i': i } as React.CSSProperties} />
      ))}
    </ol>
  );
}
