import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'lg';
}

export default function StreakBadge({ streak, size = 'lg' }: StreakBadgeProps) {
  const isLarge = size === 'lg';
  return (
    <div className={`flex flex-col items-center gap-1 ${streak > 0 ? 'animate-streak-glow' : ''}`}>
      <div className={`flex items-center gap-2 ${isLarge ? 'text-6xl font-bold' : 'text-2xl font-bold'} text-green`}>
        {streak > 0 && <Flame size={isLarge ? 40 : 24} className="text-yellow fill-yellow" />}
        <span>{streak}</span>
      </div>
      <span className={`text-[#6B7280] font-medium ${isLarge ? 'text-base' : 'text-xs'}`}>
        {streak === 0 ? 'Start streaken din!' : streak === 1 ? 'dag streak' : 'dager streak'}
      </span>
    </div>
  );
}
