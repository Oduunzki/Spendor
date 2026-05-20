import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { dashboardApi } from '../api/dashboard';
import { coachApi } from '../api/coach';
import { useAuth } from '../contexts/AuthContext';
import StreakBadge from '../components/StreakBadge';
import LevelProgress from '../components/LevelProgress';
import CoachMessage from '../components/CoachMessage';

interface DashboardStats {
  user: {
    display_name: string;
    current_xp: number;
    current_level: number;
    current_streak: number;
    longest_streak: number;
  };
  month: {
    total_resisted: number;
    total_spent: number;
    no_spend_days: number;
    xp_earned: number;
  };
  xp_to_next_level: number;
  xp_current_level_base: number;
  latest_coach_message: CoachMsg | null;
}

interface CoachMsg {
  id: string;
  content: string;
  message_type: string;
  read: boolean;
  created_at: string;
}

function formatNOK(amount: number) {
  return new Intl.NumberFormat('nb-NO').format(Math.round(amount)) + ' kr';
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-fade-up">
      <div className="skeleton rounded-2xl h-16" />
      <div className="skeleton rounded-2xl h-36" />
      <div className="flex gap-3">
        <div className="skeleton rounded-xl h-24 flex-1" />
        <div className="skeleton rounded-xl h-24 flex-1" />
        <div className="skeleton rounded-xl h-24 flex-1" />
      </div>
      <div className="skeleton rounded-xl h-20" />
      <div className="skeleton rounded-2xl h-28" />
      <div className="flex flex-col gap-3">
        <div className="skeleton rounded-xl h-16" />
        <div className="skeleton rounded-xl h-16" />
        <div className="skeleton rounded-xl h-16" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [coachMessage, setCoachMessage] = useState<CoachMsg | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingCoach, setGeneratingCoach] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const statsData = await dashboardApi.getStats();
      setStats(statsData);
      if (statsData.latest_coach_message) {
        setCoachMessage(statsData.latest_coach_message);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkRead = async (id: string) => {
    try {
      await coachApi.markRead(id);
      setCoachMessage(prev => prev ? { ...prev, read: true } : null);
    } catch {
      // ignore
    }
  };

  const handleGenerateCoach = async () => {
    setGeneratingCoach(true);
    try {
      const msg = await coachApi.generate('daily_motivation');
      setCoachMessage(msg);
    } catch {
      // ignore
    } finally {
      setGeneratingCoach(false);
    }
  };

  const displayName = stats?.user?.display_name || user?.display_name || '';
  const firstName = displayName.split(' ')[0] || displayName || 'deg';

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-4 p-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-[#6B7280] text-sm font-medium">God dag,</p>
          <h1 className="text-2xl font-bold text-[#F9FAFB]">Hei, {firstName}!</h1>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-purple/20 border border-purple/30 flex items-center justify-center shadow-purple-glow">
          <ShieldCheck size={22} className="text-purple" />
        </div>
      </div>

      {/* Streak card */}
      <div
        className={`bg-card border rounded-2xl p-6 flex flex-col items-center gap-2 transition-all duration-200
          ${(stats?.user?.current_streak ?? 0) > 0
            ? 'border-green/40 shadow-green-glow animate-streak-glow'
            : 'border-border'
          }`}
      >
        <p className="text-[#6B7280] text-xs font-medium uppercase tracking-widest mb-1">No-spend streak</p>
        <StreakBadge streak={stats?.user?.current_streak ?? 0} size="lg" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-1">
          <span className="text-[#6B7280] text-xs font-medium">Spart</span>
          <span className="text-green font-bold text-lg leading-tight text-center">
            {formatNOK(stats?.month?.total_resisted ?? 0)}
          </span>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-1">
          <span className="text-[#6B7280] text-xs font-medium">Brukt</span>
          <span className="text-red font-bold text-lg leading-tight text-center">
            {formatNOK(stats?.month?.total_spent ?? 0)}
          </span>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-1">
          <span className="text-[#6B7280] text-xs font-medium">No-spend</span>
          <span className="text-yellow font-bold text-lg leading-tight text-center">
            {stats?.month?.no_spend_days ?? 0} <span className="text-sm font-medium">dager</span>
          </span>
        </div>
      </div>

      {/* Level progress */}
      <div className="bg-card border border-border rounded-xl p-4">
        <LevelProgress
          level={stats?.user?.current_level ?? 1}
          currentXp={stats?.user?.current_xp ?? 0}
          xpToNext={stats?.xp_to_next_level ?? 100}
          xpCurrentBase={stats?.xp_current_level_base ?? 0}
        />
      </div>

      {/* Coach message */}
      {coachMessage ? (
        <CoachMessage message={coachMessage} onMarkRead={handleMarkRead} />
      ) : (
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple/10 border border-purple/20 flex items-center justify-center flex-shrink-0">
              <Sparkles size={18} className="text-purple" />
            </div>
            <div className="flex-1">
              <p className="text-[#6B7280] text-sm">Få en personlig melding fra din coach</p>
            </div>
            <button
              onClick={handleGenerateCoach}
              disabled={generatingCoach}
              className="bg-purple/20 hover:bg-purple/30 text-purple border border-purple/30 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {generatingCoach ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border border-purple/50 border-t-purple rounded-full animate-spin" />
                  Laster...
                </span>
              ) : 'Generer melding'}
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3 pt-1">
        <button
          onClick={() => navigate('/scan')}
          className="w-full min-h-[60px] bg-green/10 hover:bg-green/20 border border-green/30 hover:border-green/50 text-green rounded-xl flex items-center justify-center gap-3 font-semibold text-base transition-all duration-200 cursor-pointer shadow-green-glow"
        >
          <Camera size={22} strokeWidth={2} />
          Skann kvittering
        </button>
        <button
          onClick={() => navigate('/resisted')}
          className="w-full min-h-[60px] bg-yellow/10 hover:bg-yellow/20 border border-yellow/30 hover:border-yellow/50 text-yellow rounded-xl flex items-center justify-center gap-3 font-semibold text-base transition-all duration-200 cursor-pointer shadow-yellow-glow"
        >
          <ShieldCheck size={22} strokeWidth={2} />
          Jeg motstod!
        </button>
        <button
          onClick={() => navigate('/waiting')}
          className="w-full min-h-[60px] bg-purple/10 hover:bg-purple/20 border border-purple/30 hover:border-purple/50 text-purple rounded-xl flex items-center justify-center gap-3 font-semibold text-base transition-all duration-200 cursor-pointer shadow-purple-glow"
        >
          <Clock size={22} strokeWidth={2} />
          Legg til venteliste
        </button>
      </div>
    </div>
  );
}
