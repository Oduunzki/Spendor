import { Sparkles } from 'lucide-react';

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

export default function CoachMessage({ message, onMarkRead }: CoachMessageProps) {
  if (!message) return null;
  return (
    <div
      className="relative bg-gradient-to-br from-purple/10 to-green/5 border border-purple/20 rounded-2xl p-4 cursor-pointer"
      onClick={() => !message.read && onMarkRead?.(message.id)}
    >
      {!message.read && (
        <span className="absolute -top-2 -right-2 bg-purple text-white text-xs px-2 py-0.5 rounded-full font-bold">
          Ny
        </span>
      )}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple to-green flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <p className="text-xs text-[#6B7280] mb-1 font-medium uppercase tracking-wide">Din coach sier</p>
          <p className="text-[#F9FAFB] text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
