// A form-style document page over the dimmed campus: title, lead, on-this-page strip, sections, and the repo files
// the page is drawn from. Shared by Technical's siblings: Docs and the Legal pages.
import { repoFile } from '@/lib/content';

export type Section = { id: string; title: string; body: React.ReactNode; sources?: string[] };

export function Sources({ files }: { files: string[] }) {
  return (
    <p className="sources">
      Source:{' '}
      {files.map((f, i) => (
        <span key={f}>
          {i > 0 && ', '}
          <a href={repoFile(f)} rel="noopener">
            {f}
          </a>
        </span>
      ))}
    </p>
  );
}

export default function DocPage({ title, lead, updated, sections, children }: { title: string; lead: React.ReactNode; updated?: string; sections: Section[]; children?: React.ReactNode }) {
  return (
    <div className="doc" data-cam="tech">
      <header>
        <h1>{title}</h1>
        <p className="lead">{lead}</p>
        {updated && <p className="soft">Last updated {updated}.</p>}
        {children}
        <nav className="toc" aria-label="On this page">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.title}
            </a>
          ))}
        </nav>
      </header>
      {sections.map((s) => (
        <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`}>
          <h2 id={`${s.id}-title`}>{s.title}</h2>
          {s.body}
          {s.sources && <Sources files={s.sources} />}
        </section>
      ))}
    </div>
  );
}
