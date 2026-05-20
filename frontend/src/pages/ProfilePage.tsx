import { useEffect, useState, useCallback } from 'react';
import {
  User,
  Flame,
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
  type LucideIcon,
} from 'lucide-react';
import { profileApi } from '../api/profile';
import { useAuth } from '../contexts/AuthContext';
import LevelProgress from '../components/LevelProgress';

const LEVEL_NAMES: Record<number, string> = {
  1: 'Nybegynner',
  2: 'Forsiktig Shopper',
  3: 'Budsjettbevisst',
  4: 'Impulskontrollør',
  5: 'Viljesterk',
  6: 'Sparemester',
  7: 'Pengeguru',
  8: 'Frugalist',
  9: 'Finansninja',
  10: 'Sparelegende',
};

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
  color: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_resisted',
    name: 'Første Steg',
    description: 'Logg ditt første motstod kjøp',
    icon: ShieldCheck,
    unlocked: (s) => s.resisted_count >= 1,
    color: 'text-green',
  },
  {
    id: 'week_streak',
    name: 'Jernvilje',
    description: '7-dagers streak oppnådd',
    icon: Flame,
    unlocked: (s) => s.longest_streak >= 7,
    color: 'text-yellow',
  },
  {
    id: 'save_1000',
    name: 'Spareguru',
    description: 'Spart 1 000 kr totalt',
    icon: Star,
    unlocked: (s) => s.total_resisted >= 1000,
    color: 'text-yellow',
  },
  {
    id: 'drop_5_waiting',
    name: 'Tålmodig',
    description: 'Droppet 5 ting fra ventelisten',
    icon: Clock,
    unlocked: (s) => s.waiting_dropped >= 5,
    color: 'text-purple',
  },
  {
    id: 'scan_10',
    name: 'Kvitteringskongen',
    description: 'Skannet 10+ kvitteringer',
    icon: Receipt,
    unlocked: (s) => s.total_receipts >= 10,
    color: 'text-green',
  },
];

function formatNOK(amount: number) {
  return new Intl.NumberFormat('nb-NO').format(Math.round(amount)) + ' kr';
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-fade-up">
      <div className="skeleton rounded-2xl h-48" />
      <div className="grid grid-cols-2 gap-3">
        <div className="skeleton rounded-xl h-24" />
        <div className="skeleton rounded-xl h-24" />
        <div className="skeleton rounded-xl h-24" />
        <div className="skeleton rounded-xl h-24" />
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
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    } catch {
      // ignore
    } finally {
      setSavingName(false);
    }
  };

  if (loading) return <ProfileSkeleton />;

  const level = stats?.current_level ?? user?.current_level ?? 1;
  const currentXp = stats?.current_xp ?? user?.current_xp ?? 0;
  const xpToNext = stats?.xp_to_next ?? 100;
  const xpBase = stats?.xp_current_base ?? 0;
  const levelName = LEVEL_NAMES[level] || `Nivå ${level}`;
  const displayName = stats?.display_name || user?.display_name || 'Ukjent';

  const unlockedCount = stats ? ACHIEVEMENTS.filter(a => a.unlocked(stats)).length : 0;

  return (
    <div className="flex flex-col gap-5 p-4 pb-6 animate-fade-up">
      {/* Hero */}
      <div className="bg-card border border-border rounded-2xl p-5 pt-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple/30 to-green/20 border-2 border-purple/40 flex items-center justify-center shadow-purple-glow flex-shrink-0">
            <User size={28} className="text-purple" />
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  autoFocus
                  className="flex-1 bg-bg border border-border rounded-lg px-3 py-1.5 text-[#F9FAFB] text-base font-semibold focus:outline-none focus:border-purple/50 transition-all duration-200"
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditing(false); }}
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="w-8 h-8 rounded-lg bg-green/20 border border-green/40 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-green/30"
                >
                  {savingName
                    ? <span className="w-3 h-3 border border-green/50 border-t-green rounded-full animate-spin" />
                    : <Check size={14} className="text-green" />
                  }
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="w-8 h-8 rounded-lg bg-red/10 border border-red/30 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-red/20"
                >
                  <X size={14} className="text-red" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#F9FAFB] truncate">{displayName}</h2>
                <button
                  onClick={handleEditName}
                  className="w-7 h-7 rounded-lg bg-card-light border border-border flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-purple/40 flex-shrink-0"
                >
                  <Edit2 size={12} className="text-[#6B7280]" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-purple/20 text-purple border border-purple/30 rounded-md px-2 py-0.5 text-xs font-bold">
                Lv.{level}
              </span>
              <span className="text-[#6B7280] text-sm">{levelName}</span>
            </div>
          </div>
        </div>
        <LevelProgress
          level={level}
          currentXp={currentXp}
          xpToNext={xpToNext}
          xpCurrentBase={xpBase}
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <Flame size={16} className="text-yellow fill-yellow" />
            <span className="text-[#6B7280] text-xs font-medium uppercase tracking-wide">Lengste streak</span>
          </div>
          <p className="text-[#F9FAFB] font-bold text-2xl">{stats?.longest_streak ?? 0}</p>
          <p className="text-[#6B7280] text-xs">dager</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={16} className="text-green" />
            <span className="text-[#6B7280] text-xs font-medium uppercase tracking-wide">Totalt spart</span>
          </div>
          <p className="text-green font-bold text-2xl leading-tight">{formatNOK(stats?.total_resisted ?? 0)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-purple" />
            <span className="text-[#6B7280] text-xs font-medium uppercase tracking-wide">Droppet</span>
          </div>
          <p className="text-[#F9FAFB] font-bold text-2xl">{stats?.waiting_dropped ?? 0}</p>
          <p className="text-[#6B7280] text-xs">venteliste-ting</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={16} className="text-yellow fill-yellow" />
            <span className="text-[#6B7280] text-xs font-medium uppercase tracking-wide">Total XP</span>
          </div>
          <p className="text-yellow font-bold text-2xl">{currentXp}</p>
          <p className="text-[#6B7280] text-xs">erfaringspoeng</p>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-yellow" />
            <h2 className="text-base font-bold text-[#F9FAFB]">Prestasjoner</h2>
          </div>
          <span className="text-[#6B7280] text-xs font-medium">
            {unlockedCount}/{ACHIEVEMENTS.length} låst opp
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {ACHIEVEMENTS.map(achievement => {
            const isUnlocked = stats ? achievement.unlocked(stats) : false;
            const Icon = achievement.icon;
            return (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200
                  ${isUnlocked
                    ? 'bg-card-light border-border'
                    : 'bg-card-light/50 border-border/50 opacity-50 grayscale'
                  }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${isUnlocked ? 'bg-card border border-border' : 'bg-card border border-border/50'}
                `}>
                  {isUnlocked
                    ? <Icon size={20} className={achievement.color} />
                    : <Lock size={16} className="text-[#6B7280]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${isUnlocked ? 'text-[#F9FAFB]' : 'text-[#6B7280]'}`}>
                    {achievement.name}
                  </p>
                  <p className="text-[#6B7280] text-xs">{achievement.description}</p>
                </div>
                {isUnlocked && (
                  <CheckCircle2 size={18} className="text-green flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full min-h-[48px] bg-card border border-border hover:border-red/40 text-[#6B7280] hover:text-red rounded-xl font-medium transition-all duration-200 cursor-pointer"
      >
        Logg ut
      </button>
    </div>
  );
}
