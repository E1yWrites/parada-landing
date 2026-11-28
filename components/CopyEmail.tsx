'use client';
// The team's address with a copy button: "Email the team" is a mailto link, which does nothing on a computer
// without a mail app. Without script the address is still plain, selectable text.
import { useEffect, useRef, useState } from 'react';

export default function CopyEmail({ email }: { email: string }) {
  const [note, setNote] = useState<{ text: string; tone: 'ok' | 'bad' } | null>(null);
  const [can, setCan] = useState(false);
  const timer = useRef(0);
  useEffect(() => {
    setCan(!!navigator.clipboard);
    return () => clearTimeout(timer.current);
  }, []);
  const copy = async () => {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setNote({ text: 'Copied.', tone: 'ok' });
    } catch {
      setNote({ text: 'Couldn’t copy. Select the address and copy it yourself.', tone: 'bad' });
    }
    timer.current = window.setTimeout(() => setNote(null), 3000);
  };
  return (
    <div className="email-row">
      <p className="num email">{email}</p>
      {can && (
        <button type="button" className="link-btn" onClick={copy}>
          Copy address
        </button>
      )}
      <span className="copy-note" data-tone={note?.tone} role="status" aria-live="polite">
        {note?.text}
      </span>
    </div>
  );
}
