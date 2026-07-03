'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Film } from '@/lib/catalog';

interface HeroSectionProps {
  film: Film;
}

export function HeroSection({ film }: HeroSectionProps) {
  return (
    <section className="hero-section">
      <Image
        src={film.backdrop}
        alt={film.title}
        fill
        priority
        sizes="100vw"
        style={{ objectFit: 'cover' }}
      />

      <div className="hero-gradient" />
      <div className="hero-scrim" />

      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 'var(--space-10) var(--gutter-page)',
        maxWidth: 'var(--container-xl)',
        margin: '0 auto',
        width: '100%',
      }}>
        {film.isStub && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 500,
            color: 'var(--text-brand)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-caps)',
            marginBottom: 'var(--space-2)',
          }}>
            Coming Soon
          </div>
        )}

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'var(--text-5xl)',
          color: '#fff',
          letterSpacing: 'var(--tracking-tight)',
          lineHeight: 1,
          margin: 0,
          maxWidth: 600,
        }}>
          {film.title}
        </h1>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-3)',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-value)', fontWeight: 500 }}>
            {film.rating}
          </span>
          <span>{film.genre}</span>
          <span>&bull;</span>
          <span>{film.year}</span>
          <span>&bull;</span>
          <span>{film.duration}</span>
        </div>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginTop: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
          maxWidth: 520,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {film.description}
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link href={`/watch/${film.id}`} style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 'var(--space-1)' }}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Watch Now
            </Button>
          </Link>
          {film.creator && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-quaternary)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {film.creator}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
