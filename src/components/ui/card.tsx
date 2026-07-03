import type { HTMLAttributes, ReactNode } from 'react';

type CardVariant = 'default' | 'interactive';
type CardPadding = 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  children: ReactNode;
}

const paddingMap: Record<CardPadding, string> = {
  sm: 'var(--space-4)',
  md: 'var(--space-6)',
  lg: 'var(--space-8)',
};

export function Card({ variant = 'default', padding = 'md', children, style, ...props }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: paddingMap[padding],
        boxShadow: 'var(--elev-card)',
        transition: 'border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)',
        ...(variant === 'interactive' ? { cursor: 'pointer' } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
