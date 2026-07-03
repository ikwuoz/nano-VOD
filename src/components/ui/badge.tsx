import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'brand' | 'value' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  children: ReactNode;
  style?: React.CSSProperties;
}

const variantStyles: Record<BadgeVariant, Record<string, string>> = {
  default: { background: 'var(--surface-2)', color: 'var(--text-secondary)', borderColor: 'var(--border-subtle)' },
  brand: { background: 'var(--brand-subtle)', color: 'var(--text-brand)', borderColor: 'transparent' },
  value: { background: 'var(--value-subtle)', color: 'var(--text-value)', borderColor: 'transparent' },
  warning: { background: 'var(--warning-subtle)', color: 'var(--warning)', borderColor: 'transparent' },
  danger: { background: 'var(--danger-subtle)', color: 'var(--danger)', borderColor: 'transparent' },
  info: { background: 'var(--info-subtle)', color: 'var(--info)', borderColor: 'transparent' },
};

const sizeStyles: Record<BadgeSize, Record<string, string>> = {
  sm: { padding: '2px var(--space-2)', fontSize: '10px' },
  md: { padding: 'var(--space-0-5) var(--space-2)', fontSize: 'var(--text-xs)' },
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'var(--text-tertiary)',
  brand: 'var(--brand)',
  value: 'var(--value)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  info: 'var(--info)',
};

export function Badge({ variant = 'default', size = 'md', dot, pulse, children, style }: BadgeProps) {
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        fontFamily: 'var(--font-mono)',
        fontWeight: 500,
        lineHeight: 1,
        borderRadius: 'var(--radius-full)',
        border: '1px solid',
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-caps)',
        ...vs,
        ...ss,
        ...style,
      }}
    >
      {dot && (
        <span
          className={pulse ? 'nano-vod-pulse' : undefined}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: dotColors[variant],
            flex: 'none',
          }}
        />
      )}
      {children}
    </span>
  );
}
