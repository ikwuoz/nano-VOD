type StatusDotStatus = 'active' | 'inactive' | 'error';

interface StatusDotProps {
  status?: StatusDotStatus;
  pulse?: boolean;
}

const colors: Record<StatusDotStatus, string> = {
  active: 'var(--value)',
  inactive: 'var(--text-quaternary)',
  error: 'var(--danger)',
};

export function StatusDot({ status = 'active', pulse }: StatusDotProps) {
  return (
    <span
      className={pulse ? 'nano-vod-pulse' : undefined}
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: colors[status],
        flex: 'none',
        display: 'inline-block',
      }}
    />
  );
}
