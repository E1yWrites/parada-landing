import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="chapter">
      <div className="board red">
        <h1>No such zone.</h1>
        <p>The page you were looking for isn&rsquo;t on the map (error 404).</p>
        <div className="actions">
          <Link className="btn primary" href="/">Back to PARADA</Link>
        </div>
      </div>
    </section>
  );
}
