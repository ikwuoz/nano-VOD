'use client';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, Record<string, string>> = {
  primary: {
    background: 'var(--brand)',
    color: 'var(--on-brand)',
    border: '1px solid transparent',
  },
  secondary: {
    background: 'var(--surface-2)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-default)',
  },
  tertiary: {
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'var(--danger)',
    color: 'var(--white)',
    border: '1px solid transparent',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid transparent',
  },
};

const sizeStyles: Record<ButtonSize, Record<string, string | number>> = {
  sm: { height: 32, padding: '0 var(--space-2)', fontSize: 'var(--text-xs)' },
  md: { height: 40, padding: '0 var(--space-4)', fontSize: 'var(--text-sm)' },
  lg: { height: 48, padding: '0 var(--space-5)', fontSize: 'var(--text-md)' },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, icon, children, style, ...props }, ref) => {
    const base = variantStyles[variant];
    const dims = sizeStyles[size];
    const { onMouseEnter, onMouseLeave, onFocus, onBlur, ...htmlProps } = props;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          borderRadius: 'var(--radius-sm)',
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.4 : loading ? 0.7 : 1,
          transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), opacity var(--dur-fast) var(--ease-out)',
          outline: 'none',
          ...base,
          ...dims,
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!onMouseEnter) {
            if (variant === 'secondary') {
              e.currentTarget.style.background = 'var(--surface-3)';
              e.currentTarget.style.borderColor = 'var(--border-strong)';
            } else if (variant === 'tertiary') {
              e.currentTarget.style.background = 'var(--surface-1)';
            } else if (variant === 'ghost') {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.background = 'var(--surface-1)';
            }
          }
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!onMouseLeave) {
            e.currentTarget.style.background = base.background;
            e.currentTarget.style.borderColor = base.border;
            if (variant === 'ghost') e.currentTarget.style.color = base.color;
          }
          onMouseLeave?.(e);
        }}
        onFocus={(e) => {
          onFocus?.(e);
          e.currentTarget.style.boxShadow = '0 0 0 2px var(--bg-canvas), 0 0 0 4px var(--focus-ring)';
        }}
        onBlur={(e) => {
          onBlur?.(e);
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...htmlProps}
      >
        {loading ? (
          <span className="nano-vod-spin" style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} />
        ) : icon ? (
          <span style={{ width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{icon}</span>
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
