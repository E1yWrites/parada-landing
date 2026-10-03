'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Experience' },
  { href: '/technical/', label: 'Technical' },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="tabs" aria-label="Primary">
      {TABS.map((t) => {
        const current = t.href === '/' ? path === '/' : path.startsWith(t.href.slice(0, -1));
        return (
          <Link key={t.href} href={t.href} aria-current={current ? 'page' : undefined}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
