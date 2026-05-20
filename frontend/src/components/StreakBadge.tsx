// Spendor — StreakBadge
// Calm SVG flame, day-count rendered as separate large numeral.
// `size` controls dimensions only — no halo, no glow rings.

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'lg';
}

function Flame({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="animate-flame" style={{ transformOrigin: '50% 80%' }}>
      <defs>
        <linearGradient id="sp-flame-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5C97A" />
          <stop offset="50%" stopColor="#F49F5A" />
          <stop offset="100%" stopColor="#E07A3F" />
        </linearGradient>
      </defs>
      <path
        d="M32 6c0 10-12 12-12 24a12 12 0 0 0 24 0c0-3-1-5-2.5-7 0 4-2.5 6-4.5 6 0-6 5-10 5-15 0-4-3-7-10-8Z"
        fill="url(#sp-flame-grad)"
        opacity="0.95"
      />
    </svg>
  );
}

export default function StreakBadge({ streak, size = 'lg' }: StreakBadgeProps) {
  const isLarge = size === 'lg';

  if (streak === 0) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className={`${isLarge ? 'text-4xl' : 'text-xl'} font-bold text-[#B8B2D1]`}>0</div>
        <span className="text-[#6E6889] text-xs">Start din streak i dag</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Flame size={isLarge ? 56 : 32} />
      <div className="flex flex-col">
        <span className="label text-fire">No-spend streak</span>
        <div className={`${isLarge ? 'text-4xl' : 'text-2xl'} font-extrabold text-[#F5F3FF] leading-none mt-1 -tracking-[.02em]`}>
          {streak} <span className={`${isLarge ? 'text-base' : 'text-sm'} font-bold text-[#B8B2D1]`}>{streak === 1 ? 'dag' : 'dager'}</span>
        </div>
      </div>
    </div>
  );
}
