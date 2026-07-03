'use client';
import { forwardRef, type InputHTMLAttributes } from 'react';

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
  label?: string;
  hint?: string;
  error?: string;
}

const sizeMap: Record<InputSize, Record<string, string | number>> = {
  sm: { height: 32, padding: '0 var(--space-3)', fontSize: 'var(--text-xs)' },
  md: { height: 40, padding: '0 var(--space-3)', fontSize: 'var(--text-sm)' },
  lg: { height: 48, padding: '0 var(--space-4)', fontSize: 'var(--text-md)' },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ inputSize = 'md', label, hint, error, style, ...props }, ref) => {
    const dims = sizeMap[inputSize];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        {label && (
          <label
            htmlFor={props.id}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--text-secondary)',
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={props.id}
          style={{
            width: '100%',
            fontFamily: 'var(--font-sans)',
            color: 'var(--text-primary)',
            background: 'var(--surface-1)',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-sm)',
            outline: 'none',
            transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
            ...dims,
            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-brand)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--focus-ring)';
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--border-default)';
            e.currentTarget.style.boxShadow = 'none';
            props.onBlur?.(e);
          }}
          {...props}
        />
        {error && (
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--danger)' }}>
            {error}
          </span>
        )}
        {hint && !error && (
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            {hint}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
