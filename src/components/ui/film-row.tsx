'use client';
import { useRef, type ReactNode } from 'react';

interface FilmRowProps {
  label: string;
  children: ReactNode;
}

export function FilmRow({ label, children }: FilmRowProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section style={{ marginBottom: 'var(--space-6)' }}>
      <div className="section-header">
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 'var(--text-lg)',
          color: 'var(--text-primary)',
          letterSpacing: 'var(--tracking-tight)',
          margin: 0,
        }}>
          {label}
        </h2>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            ref.current?.scrollBy({ left: 800, behavior: 'smooth' });
          }}
        >
          See All &rarr;
        </a>
      </div>
      <div ref={ref} className="film-row">
        {children}
      </div>
    </section>
  );
}
