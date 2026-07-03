'use client';
import { type ReactNode } from 'react';

export interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface DropdownMenuProps {
  items: DropdownItem[];
  align?: 'start' | 'end';
  onClose: () => void;
}

export function DropdownMenu({ items, align = 'end', onClose }: DropdownMenuProps) {
  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 40 }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'absolute',
          top: '100%',
          [align]: 0,
          marginTop: 'var(--space-1)',
          zIndex: 50,
          minWidth: 180,
          background: 'var(--surface-2)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--elev-popover)',
          padding: 'var(--space-1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => { item.onClick(); onClose(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-3)',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              fontWeight: 400,
              color: item.danger ? 'var(--danger)' : 'var(--text-primary)',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              textAlign: 'left',
              whiteSpace: 'nowrap',
              transition: 'background var(--dur-fast) var(--ease-out)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            {item.icon && <span style={{ width: 16, height: 16, flex: 'none' }}>{item.icon}</span>}
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
