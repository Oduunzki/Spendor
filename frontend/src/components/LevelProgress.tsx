// Spendor — LevelProgress
// Drops the heavy "Lv.7" pill + glowing track. Uses plain "Nivå 7" copy
// and a thin gold progress bar. Level names removed in favour of consistent
// "Nivå N" — feels less RPG.

interface LevelProgressProps {
  level: number;
  currentXp: number;
  xpToNext: number;
  xpCurrentBase: number;
  compact?: boolean;
}

function format(n: number) {
  return new Intl.NumberFormat('nb-NO').format(n);
}

export default function LevelProgress({
  level,
  currentXp,
  xpToNext,
  xpCurrentBase,
  compact = false,
}: LevelProgressProps) {
  const span = Math.max(1, xpToNext - xpCurrentBase);
  const progress = Math.min(100, Math.max(0, ((currentXp - xpCurrentBase) / span) * 100));
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <span className={`font-bold text-[#F5F3FF] ${compact ? 'text-xs' : 'text-sm'} tracking-tight`}>
          Nivå {level}
        </span>
        <span className={`num text-[#6E6889] ${compact ? 'text-[10px]' : 'text-xs'}`}>
          {format(currentXp)} / {format(xpToNext)}
        </span>
      </div>
      <div className={`w-full bg-white/5 rounded-full overflow-hidden ${compact ? 'h-1.5' : 'h-2'}`}>
        <div
          className="h-full bg-gradient-to-r from-yellow-dark to-yellow rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
