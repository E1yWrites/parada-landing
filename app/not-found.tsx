import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="chapter">
      <div className="panel">
        <span className="eyebrow">404</span>
        <h1 style={{ fontSize: 'var(--step-3)' }}>This zone doesn&rsquo;t exist.</h1>
        <p className="muted">The page you were looking for isn&rsquo;t here.</p>
        <Link className="btn primary" href="/">Back to PARADA</Link>
      </div>
    </section>
  );
}
