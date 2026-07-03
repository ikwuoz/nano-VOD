'use client';
import Link from 'next/link';
import Image from 'next/image';
import type { Film } from '@/lib/catalog';

interface FilmPosterProps {
  film: Film;
}

export function FilmPoster({ film }: FilmPosterProps) {
  return (
    <Link href={`/watch/${film.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="poster-card" role="button" tabIndex={0} aria-label={`Watch ${film.title}`}>
        {film.isStub ? (
          <div className="poster-stub">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-quaternary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <line x1="7" y1="2" x2="7" y2="22" />
              <line x1="17" y1="2" x2="17" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="2" y1="7" x2="7" y2="7" />
              <line x1="2" y1="17" x2="7" y2="17" />
              <line x1="17" y1="7" x2="22" y2="7" />
              <line x1="17" y1="17" x2="22" y2="17" />
            </svg>
          </div>
        ) : (
          <Image
            src={film.poster}
            alt={film.title}
            fill
            sizes="200px"
            style={{ objectFit: 'cover' }}
          />
        )}

        <div className="poster-card-info">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-sm)', color: '#fff', lineHeight: 1.2 }}>
            {film.title}
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
            {film.genre} &bull; {film.year}
          </div>
        </div>
      </div>
    </Link>
  );
}
