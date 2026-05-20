import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface XpPopupProps {
  xp: number;
  visible: boolean;
  onDone?: () => void;
}

export default function XpPopup({ xp, visible, onDone }: XpPopupProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const t = setTimeout(() => {
        setShow(false);
        onDone?.();
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!show) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none animate-xp-pop">
      <div className="flex items-center gap-2 bg-yellow/20 border border-yellow/50 text-yellow rounded-full px-6 py-3 text-2xl font-bold shadow-yellow-glow">
        <Zap size={24} fill="currentColor" />
        +{xp} XP
      </div>
    </div>
  );
}
