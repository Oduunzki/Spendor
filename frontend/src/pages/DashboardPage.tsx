// Spendor — DashboardPage
// Calmer layout matching the v2 prototype:
//  - Streak card (left-aligned flame + day-count)
//  - Level/XP bar (clean, no glow)
//  - "Spart i mai" hero with mint-coloured number + sparkline
//  - Coach bubble (stripe + label)
//  - Three Raske handlinger
//  - Siste aktivitet list (we leave this out until we wire history endpoint)
//
// All API calls + auth flow preserved.

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
  return new Intl.NumberFormat('nb-NO').format(Math.round(amount));
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'God natt';
  if (h < 11) return 'God morgen';
  if (h < 17) return 'God dag';
  return 'God kveld';
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-fade-up">
      <div className="skeleton rounded-2xl h-14" />
      <div className="skeleton rounded-2xl h-32" />
      <div className="skeleton rounded-2xl h-20" />
      <div className="skeleton rounded-2xl h-32" />
      <div className="skeleton rounded-2xl h-20" />
      <div className="flex gap-2">
        <div className="skeleton rounded-2xl h-24 flex-1" />
        <div className="skeleton rounded-2xl h-24 flex-1" />
        <div className="skeleton rounded-2xl h-24 flex-1" />
      </div>
    </div>
  );
}

// Small inline sparkline — pure SVG, no extra dep.
function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);
  const w = 320, h = 64;
  const stepX = w / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => [i * stepX, h - (v / max) * (h - 8) - 4] as const);
  const path = pts.reduce((acc, [x, y], i) => acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`), '');
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" className="block">
      <defs>
        <linearGradient id="sp-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6EE7A0" stopOpacity=".35" />
          <stop offset="100%" stopColor="#6EE7A0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sp-spark)" />
      <path d={path} fill="none" stroke="#6EE7A0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0] - 1} cy={pts[pts.length - 1][1]} r="3.5" fill="#6EE7A0" />
    </svg>
  );
}

// Build a fake-but-monotonic sparkline from current month total so the chart
// shape always feels alive even before we wire daily history.
function sparkValues(total: number): number[] {
  if (total <= 0) return Array.from({ length: 10 }, () => 0);
  const n = 14;
  return Array.from({ length: n }, (_, i) => {
    const t = (i + 1) / n;
    // gentle accelerating curve
    return total * Math.pow(t, 1.6);
  });
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

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMarkRead = async (id: string) => {
    try {
      await coachApi.markRead(id);
      setCoachMessage(prev => prev ? { ...prev, read: true } : null);
    } catch {/* ignore */}
  };

  const handleGenerateCoach = async () => {
    setGeneratingCoach(true);
    try {
      const msg = await coachApi.generate('daily_motivation');
      setCoachMessage(msg);
    } catch {/* ignore */} finally {
      setGeneratingCoach(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const displayName = stats?.user?.display_name || user?.display_name || '';
  const firstName = displayName.split(' ')[0] || 'deg';
  const streak = stats?.user?.current_streak ?? 0;
  const longest = stats?.user?.longest_streak ?? 0;
  const totalResisted = stats?.month?.total_resisted ?? 0;
  const totalSpent = stats?.month?.total_spent ?? 0;
  const monthName = new Date().toLocaleString('nb-NO', { month: 'long' });

  return (
    <div className="flex flex-col gap-3 p-4 pt-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-[#6E6889] text-xs font-semibold">{greeting()},</p>
          <h1 className="text-xl font-extrabold text-[#F5F3FF] tracking-tight">Hei, {firstName}</h1>
        </div>
        <div className="num inline-flex items-center gap-1.5 text-[#B8B2D1] text-xs font-bold">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-yellow">
            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
          </svg>
          {new Intl.NumberFormat('nb-NO').format(stats?.user?.current_xp ?? 0)} XP
        </div>
      </div>

      {/* Streak card */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <StreakBadge streak={streak} size="lg" />
        {/* Day track — last 14 days */}
        <div className="flex gap-1 mt-4">
          {Array.from({ length: 14 }).map((_, i) => {
            const filled = i < Math.min(14, streak);
            return (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full ${filled ? 'bg-fire/85' : 'bg-white/6'}`}
              />
            );
          })}
        </div>
        {longest > 0 && (
          <p className="text-[#6E6889] text-xs mt-3">
            Personlig rekord: <span className="num text-[#B8B2D1] font-bold">{longest}</span>
          </p>
        )}
      </div>

      {/* Level / XP */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <LevelProgress
          level={stats?.user?.current_level ?? 1}
          currentXp={stats?.user?.current_xp ?? 0}
          xpToNext={stats?.xp_to_next_level ?? 100}
          xpCurrentBase={stats?.xp_current_level_base ?? 0}
        />
        <p className="text-[#6E6889] text-xs mt-2.5">
          {Math.max(0, (stats?.xp_to_next_level ?? 0) - (stats?.user?.current_xp ?? 0))} XP til neste nivå
        </p>
      </div>

      {/* Spart i <måned> hero */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <span className="label text-green">Spart i {monthName}</span>
            <div className="num text-green text-[40px] leading-none font-bold mt-1.5">
              {formatNOK(totalResisted).replace(/,/g, ' ')}
              <span className="text-base ml-1 text-[#6E6889] font-bold">kr</span>
            </div>
          </div>
          {totalSpent > 0 && (
            <div className="text-right">
              <span className="label text-[#6E6889]">Brukt</span>
              <div className="num text-[#B8B2D1] text-base font-bold mt-1">
                {formatNOK(totalSpent).replace(/,/g, ' ')} kr
              </div>
            </div>
          )}
        </div>
        <div className="mt-3 -mx-1">
          <Sparkline values={sparkValues(totalResisted)} />
        </div>
        <div className="flex justify-between mt-1 num text-[10px] text-[#6E6889]">
          <span>1. {monthName.slice(0, 3)}.</span>
          <span>I dag</span>
        </div>
      </div>

      {/* Coach */}
      {coachMessage ? (
        <CoachMessage message={coachMessage} onMarkRead={handleMarkRead} />
      ) : (
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-1 self-stretch rounded-full bg-purple opacity-70 flex-shrink-0" />
          <div className="flex-1">
            <span className="label">Coach</span>
            <p className="text-[#B8B2D1] text-sm mt-1">Få en personlig melding fra coachen.</p>
          </div>
          <button
            onClick={handleGenerateCoach}
            disabled={generatingCoach}
            className="bg-card-light hover:bg-white/5 text-[#F5F3FF] border border-border rounded-xl px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {generatingCoach ? (
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={12} className="animate-spin" />
                ...
              </span>
            ) : 'Generer'}
          </button>
        </div>
      )}

      {/* Raske handlinger */}
      <div className="mt-1">
        <span className="label px-1">Raske handlinger</span>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <ActionCard
            onClick={() => navigate('/scan')}
            icon={<Camera size={24} strokeWidth={2} />}
            label="Skann kvittering"
            accent="purple"
          />
          <ActionCard
            onClick={() => navigate('/resisted')}
            icon={<ShieldCheck size={24} strokeWidth={2} />}
            label="Jeg motstod noe"
            accent="green"
          />
          <ActionCard
            onClick={() => navigate('/waiting')}
            icon={<Clock size={24} strokeWidth={2} />}
            label="Sett på venteliste"
            accent="yellow"
          />
        </div>
      </div>
    </div>
  );
}

interface ActionCardProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  accent: 'green' | 'yellow' | 'purple';
}

function ActionCard({ onClick, icon, label, accent }: ActionCardProps) {
  const color =
    accent === 'green'  ? 'text-green border-green/20'  :
    accent === 'yellow' ? 'text-yellow border-yellow/20' :
                          'text-purple border-purple/20';
  return (
    <button
      onClick={onClick}
      className={`bg-card border ${color} rounded-2xl min-h-[96px] px-2 py-3 flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-[.97] transition-transform`}
    >
      <span>{icon}</span>
      <span className="text-[#F5F3FF] text-[11px] font-bold leading-tight text-center">{label}</span>
    </button>
  );
}
