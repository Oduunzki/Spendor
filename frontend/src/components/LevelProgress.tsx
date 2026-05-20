interface LevelProgressProps {
  level: number;
  currentXp: number;
  xpToNext: number;
  xpCurrentBase: number;
}

const LEVEL_NAMES: Record<number, string> = {
  1: 'Nybegynner',
  2: 'Forsiktig Shopper',
  3: 'Budsjettbevisst',
  4: 'Impulskontrollør',
  5: 'Viljesterk',
  6: 'Sparemester',
  7: 'Pengeguru',
  8: 'Frugalist',
  9: 'Finansninja',
  10: 'Sparelegende',
};

export default function LevelProgress({ level, currentXp, xpToNext, xpCurrentBase }: LevelProgressProps) {
  const progress = Math.min(100, Math.max(0, ((currentXp - xpCurrentBase) / (xpToNext - xpCurrentBase)) * 100));
  const levelName = LEVEL_NAMES[level] || `Nivå ${level}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-purple/20 text-purple border border-purple/30 rounded-lg px-3 py-1 text-sm font-bold shadow-purple-glow">
            Lv.{level}
          </span>
          <span className="text-[#F9FAFB] font-semibold">{levelName}</span>
        </div>
        <span className="text-[#6B7280] text-sm">{currentXp} / {xpToNext} XP</span>
      </div>
      <div className="w-full bg-[#1F2937] rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow to-yellow-dark rounded-full shadow-yellow-glow transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
