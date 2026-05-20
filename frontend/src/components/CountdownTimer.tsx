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
      <div className="flex items-center gap-1 text-green text-sm font-medium">
        <Clock size={14} />
        <span>Klar for beslutning!</span>
      </div>
    );
  }

  // Color based on absolute days remaining
  const color = timeLeft.days >= 3 ? 'text-green' : timeLeft.days >= 1 ? 'text-yellow' : 'text-red';

  const parts: string[] = [];
  if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
  if (timeLeft.hours > 0) parts.push(`${timeLeft.hours}t`);
  if (timeLeft.days === 0) parts.push(`${timeLeft.minutes}m`);

  return (
    <div className={`flex items-center gap-1 text-sm font-medium ${color}`}>
      <Clock size={14} />
      <span>{parts.join(' ')} igjen</span>
    </div>
  );
}
