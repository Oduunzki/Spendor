// Spendor — ProfilePage
// Drops the "Lv.7"/"Pengeguru" pill, uses initials avatar instead of generic
// User icon, calmer stats grid + achievements list. Logout button matches
// surface treatment.

import { useEffect, useState, useCallback } from 'react';
import {
  ShieldCheck,
  Clock,
  Zap,
  Trophy,
  Star,
  Lock,
  CheckCircle2,
  Receipt,
  Edit2,
  Check,
  X,
  Flame,
  type LucideIcon,
} from 'lucide-react';
import { profileApi } from '../api/profile';
import { useAuth } from '../contexts/AuthContext';
import LevelProgress from '../components/LevelProgress';

interface ProfileStats {
  display_name: string;
  current_level: number;
  current_xp: number;
  xp_to_next: number;
  xp_current_base: number;
  longest_streak: number;
  total_resisted: number;
  waiting_dropped: number;
  total_receipts: number;
  resisted_count: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  unlocked: (stats: ProfileStats) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_resisted',
    name: 'Første motstand',
    description: 'Logg ditt første motstod kjøp',
    icon: ShieldCheck,
    unlocked: (s) => s.resisted_count >= 1,
  },
  {
    id: 'week_streak',
    name: 'Uke uten impuls',
    description: '7 dager streak',
    icon: Flame,
    unlocked: (s) => s.longest_streak >= 7,
  },
  {
    id: 'month_streak',
    name: 'Måned uten impuls',
    description: '30 dager streak',
    icon: Flame,
    unlocked: (s) => s.longest_streak >= 30,
  },
  {
    id: 'save_1000',
    name: 'Tusen-grensen',
    description: 'Spart 1 000 kr totalt',
    icon: Star,
    unlocked: (s) => s.total_resisted >= 1000,
  },
  {
    id: 'save_10000',
    name: 'Ti tusen',
    description: 'Spart 10 000 kr totalt',
    icon: Star,
    unlocked: (s) => s.total_resisted >= 10000,
  },
  {
    id: 'drop_5_waiting',
    name: 'Venteliste-vinner',
    description: 'Droppet 5 ting fra ventelisten',
    icon: Clock,
    unlocked: (s) => s.waiting_dropped >= 5,
  },
  {
    id: 'scan_10',
    name: '10 kvitteringer',
    description: 'Skannet 10+ kvitteringer',
    icon: Receipt,
    unlocked: (s) => s.total_receipts >= 10,
  },
];

function formatNOK(amount: number) {
  return new Intl.NumberFormat('nb-NO').format(Math.round(amount)).replace(/,/g, ' ');
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(p => p[0]?.toUpperCase() ?? '')
    .filter(Boolean)
    .slice(0, 2)
    .join('') || '?';
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-fade-up">
      <div className="skeleton rounded-2xl h-48" />
      <div className="grid grid-cols-2 gap-3">
        <div className="skeleton rounded-2xl h-24" />
        <div className="skeleton rounded-2xl h-24" />
        <div className="skeleton rounded-2xl h-24" />
        <div className="skeleton rounded-2xl h-24" />
      </div>
      <div className="skeleton rounded-2xl h-64" />
    </div>
  );
}

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const profileData = await profileApi.get();
      setStats(profileData);
    } catch {/* ignore */} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEditName = () => {
    setEditName(stats?.display_name || user?.display_name || '');
    setEditing(true);
  };

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setSavingName(true);
    try {
      await profileApi.update({ display_name: editName.trim() });
      setStats(prev => prev ? { ...prev, display_name: editName.trim() } : null);
      await refreshUser();
      setEditing(false);
    } catch {/* ignore */} finally {
      setSavingName(false);
    }
  };

  if (loading) return <ProfileSkeleton />;

  const level = stats?.current_level ?? user?.current_level ?? 1;
  const currentXp = stats?.current_xp ?? user?.current_xp ?? 0;
  const xpToNext = stats?.xp_to_next ?? 100;
  const xpBase = stats?.xp_current_base ?? 0;
  const displayName = stats?.display_name || user?.display_name || 'Ukjent';
  const unlockedCount = stats ? ACHIEVEMENTS.filter(a => a.unlocked(stats)).length : 0;

  return (
    <div className="flex flex-col gap-4 p-4 pt-5 pb-6 animate-fade-up">
      {/* Hero */}
      <div className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-card-light to-card border border-border flex items-center justify-center flex-shrink-0">
          <span className="text-[#F5F3FF] text-2xl font-extrabold -tracking-[.02em]">
            {initials(displayName)}
          </span>
        </div>
        <div className="mt-3 w-full flex flex-col items-center">
          {editing ? (
            <div className="flex items-center gap-2 w-full max-w-[260px]">
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                autoFocus
                className="flex-1 bg-bg border border-border rounded-lg px-3 py-1.5 text-[#F5F3FF] text-base font-bold focus:outline-none focus:border-purple/50 transition-colors"
                onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditing(false); }}
              />
              <button
                onClick={handleSaveName}
                disabled={savingName}
                className="w-9 h-9 rounded-lg bg-green/15 border border-green/30 flex items-center justify-center cursor-pointer transition-colors hover:bg-green/25"
              >
                <Check size={14} className="text-green" />
              </button>
              <button
                onClick={() => setEditing(false)}
                className="w-9 h-9 rounded-lg bg-card-light border border-border flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={14} className="text-[#6E6889]" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#F5F3FF] tracking-tight">{displayName}</h2>
              <button
                onClick={handleEditName}
                className="w-7 h-7 rounded-lg bg-card-light border border-border flex items-center justify-center cursor-pointer transition-colors hover:border-purple/30"
              >
                <Edit2 size={11} className="text-[#6E6889]" />
              </button>
            </div>
          )}
          <p className="text-[#6E6889] text-xs mt-1">Nivå {level}</p>
        </div>
        <div className="w-full mt-5">
          <LevelProgress
            level={level}
            currentXp={currentXp}
            xpToNext={xpToNext}
            xpCurrentBase={xpBase}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard
          label="Lengste streak"
          value={`${stats?.longest_streak ?? 0}`}
          unit="dager"
          tone="fire"
        />
        <StatCard
          label="Totalt spart"
          value={formatNOK(stats?.total_resisted ?? 0)}
          unit="kr"
          tone="green"
        />
        <StatCard
          label="Motstått"
          value={`${stats?.resisted_count ?? 0}`}
          unit="impulser"
          tone="default"
        />
        <StatCard
          label="Skannet"
          value={`${stats?.total_receipts ?? 0}`}
          unit="kvitteringer"
          tone="default"
        />
      </div>

      {/* Achievements */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-yellow" />
            <h2 className="text-sm font-bold text-[#F5F3FF] tracking-tight">Milepæler</h2>
          </div>
          <span className="num text-[#6E6889] text-xs font-bold">
            {unlockedCount}/{ACHIEVEMENTS.length}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {ACHIEVEMENTS.map(achievement => {
            const isUnlocked = stats ? achievement.unlocked(stats) : false;
            const Icon = achievement.icon;
            return (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors
                  ${isUnlocked
                    ? 'bg-card-light border border-yellow/15'
                    : 'bg-card-light/50 border border-border opacity-60'
                  }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
                  ${isUnlocked
                    ? 'bg-yellow/10 border border-yellow/25 text-yellow'
                    : 'bg-white/3 border border-border text-[#6E6889]'
                  }
                `}>
                  {isUnlocked ? <Icon size={16} strokeWidth={2.2} /> : <Lock size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm tracking-tight ${isUnlocked ? 'text-[#F5F3FF]' : 'text-[#6E6889]'}`}>
                    {isUnlocked ? achievement.name : 'Låst'}
                  </p>
                  <p className="text-[#6E6889] text-xs mt-0.5">{achievement.description}</p>
                </div>
                {isUnlocked && <CheckCircle2 size={16} className="text-green flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full min-h-[48px] bg-card border border-border hover:border-red/30 text-[#6E6889] hover:text-red rounded-2xl font-bold text-sm transition-colors cursor-pointer"
      >
        Logg ut
      </button>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  tone: 'default' | 'green' | 'fire';
}

function StatCard({ label, value, unit, tone }: StatCardProps) {
  const color = tone === 'green' ? 'text-green' : tone === 'fire' ? 'text-fire' : 'text-[#F5F3FF]';
  // tiny lead icon
  const Icon =
    tone === 'green' ? ShieldCheck :
    tone === 'fire'  ? Flame :
                       Zap;
  const iconColor =
    tone === 'green' ? 'text-green' :
    tone === 'fire'  ? 'text-fire' :
                       'text-[#6E6889]';
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <Icon size={12} className={iconColor} strokeWidth={2.2} />
        <span className="label text-[10px]">{label}</span>
      </div>
      <div className={`num font-bold text-2xl mt-1 leading-none ${color}`}>{value}</div>
      <div className="text-[#6E6889] text-[11px] font-medium">{unit}</div>
    </div>
  );
}
