'use client';
import { useEffect, useState } from 'react';
import { sound } from '@/lib/sfx';

export default function SoundToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const off = sound.subscribe(setOn);
    sound.init();
    return off;
  }, []);
  return (
    <button type="button" className="sound" aria-pressed={on} onClick={() => sound.set(!on)}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H3v6h3l5 4z" />
        {on ? <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /> : <path d="m16 9 5 6m0-6-5 6" />}
      </svg>
      <span>Sound {on ? 'on' : 'off'}</span>
    </button>
  );
}
