// Spendor — CountdownTimer
// Same logic, calmer styling. Uses fire/yellow/text-3 colour ramp.

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  waitUntil: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  total: number;
}

function getTimeLeft(waitUntil: string): TimeLeft | null {
  const diff = new Date(waitUntil).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes, total: diff };
}

export default function CountdownTimer({ waitUntil }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => getTimeLeft(waitUntil));

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(waitUntil)), 60000);
    return () => clearInterval(interval);
  }, [waitUntil]);

  if (!timeLeft) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-green/12 border border-green/25 text-green text-xs font-bold px-2.5 py-1 rounded-full">
        <Clock size={12} strokeWidth={2.5} />
        <span>Klar nå</span>
      </div>
    );
  }

  const color =
    timeLeft.days >= 3 ? 'text-[#B8B2D1]'
    : timeLeft.days >= 1 ? 'text-yellow'
    : 'text-fire';

  const parts: string[] = [];
  if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
  if (timeLeft.hours > 0) parts.push(`${timeLeft.hours}t`);
  if (timeLeft.days === 0) parts.push(`${timeLeft.minutes}m`);

  return (
    <div className={`num inline-flex items-center gap-1.5 text-xs font-bold ${color}`}>
      <Clock size={12} strokeWidth={2.5} />
      <span>{parts.join(' ')} igjen</span>
    </div>
  );
}
