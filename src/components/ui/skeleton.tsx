type SkeletonVariant = 'text' | 'card' | 'circle';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
}

const variantDefaults: Record<SkeletonVariant, Record<string, string | number>> = {
  text: { width: '100%', height: 14, borderRadius: 'var(--radius-xs)' },
  card: { width: '100%', height: 120, borderRadius: 'var(--radius-lg)' },
  circle: { width: 32, height: 32, borderRadius: '50%' },
};

export function Skeleton({ variant = 'text', width, height }: SkeletonProps) {
  const defaults = variantDefaults[variant];

  return (
    <div
      className="nano-vod-flow"
      style={{
        background: 'linear-gradient(90deg, var(--surface-1) 25%, var(--surface-2) 50%, var(--surface-1) 75%)',
        backgroundSize: '200% 100%',
        ...defaults,
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
      }}
    />
  );
}
