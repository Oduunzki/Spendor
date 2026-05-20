// Spendor — XpPopup
// Slim gold pill instead of giant glowing badge. Plays once, fades up, gone.

import { useEffect, useState } from 'react';

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
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [visible, onDone]);

  if (!show) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none animate-xp-pop">
      <div className="num inline-flex items-center gap-2 bg-yellow/15 border border-yellow/30 text-yellow rounded-full px-5 py-2.5 text-xl font-bold">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
        </svg>
        +{xp} XP
      </div>
    </div>
  );
}
