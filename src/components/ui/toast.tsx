'use client';
import { useEffect, useState, type ReactNode } from 'react';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  icon?: ReactNode;
  onClose: () => void;
}

const variantStyles: Record<ToastVariant, Record<string, string>> = {
  success: { background: 'var(--value-subtle)', borderColor: 'var(--value)', color: 'var(--text-value)' },
  error: { background: 'var(--danger-subtle)', borderColor: 'var(--danger)', color: 'var(--danger)' },
  info: { background: 'var(--info-subtle)', borderColor: 'var(--info)', color: 'var(--info)' },
  warning: { background: 'var(--warning-subtle)', borderColor: 'var(--warning)', color: 'var(--warning)' },
};

export function Toast({ message, variant = 'info', duration = 4000, icon, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const vs = variantStyles[variant];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'var(--space-6)',
        right: 'var(--space-6)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-sm)',
        ...vs,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)',
      }}
    >
      {icon && <span style={{ width: 16, height: 16, flex: 'none' }}>{icon}</span>}
      {message}
    </div>
  );
}
