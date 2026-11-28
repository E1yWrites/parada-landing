'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GITHUB_URL } from '@/lib/content';

const TABS = [
  { href: '/', label: 'Home' },
  { href: '/demo/', label: 'Demo' },
  { href: '/technical/', label: 'Technical' },
  { href: '/legal/', label: 'Legal' },
];

// The documentation lives with the code: GitHub is the last tab, leaving the site.
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
      <a href={GITHUB_URL} rel="noopener" className="tab-out">
        GitHub
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
        <span className="sr-only"> (opens the source code on github.com)</span>
      </a>
    </nav>
  );
}
