// Spendor — CoachMessage
// Strips the gradient + mascot avatar — uses a thin accent stripe + COACH
// label, same as the v2 prototype. Less "mobile-game NPC", more "Linear-style
// notification".

interface CoachMessageData {
  id: string;
  content: string;
  message_type: string;
  read: boolean;
  created_at: string;
}

interface CoachMessageProps {
  message: CoachMessageData | null;
  onMarkRead?: (id: string) => void;
}

const TONE: Record<string, string> = {
  daily_motivation: 'bg-purple',
  weekly_summary:   'bg-green',
  warning:          'bg-red',
  streak_celebration:'bg-fire',
};

export default function CoachMessage({ message, onMarkRead }: CoachMessageProps) {
  if (!message) return null;
  const stripe = TONE[message.message_type] || 'bg-purple';
  return (
    <div
      className="relative bg-card border border-border rounded-2xl p-4 flex gap-3 items-start cursor-pointer transition-colors hover:border-purple/30"
      onClick={() => !message.read && onMarkRead?.(message.id)}
    >
      <div className={`w-1 self-stretch rounded-full opacity-70 flex-shrink-0 ${stripe}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="label">Coach</span>
          {!message.read && (
            <span className="w-1.5 h-1.5 rounded-full bg-purple animate-pulse" />
          )}
        </div>
        <p className="text-[#F5F3FF] text-sm leading-relaxed mt-1.5 font-medium">
          {message.content}
        </p>
      </div>
    </div>
  );
}
