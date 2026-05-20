// Spendor — InsightsPage
// Same charts, same recharts, same data shape. Updated palette + chart theme
// to match v2: mint green/coral pair for resisted/spent, muted category
// colours, calmer grid + tooltip.

import { useEffect, useState, useCallback } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, ShieldCheck, Clock } from 'lucide-react';
import { profileApi } from '../api/profile';

interface CategorySpend {
  category: string;
  amount: number;
}

interface WeeklyData {
  week: string;
  resisted: number;
  spent: number;
}

interface ReasonData {
  reason: string;
  count: number;
  amount: number;
}

interface WaitingStats {
  total: number;
  dropped: number;
  saved: number;
}

interface InsightsData {
  category_spending: CategorySpend[];
  weekly_data: WeeklyData[];
  resisted_by_reason: ReasonData[];
  waiting_list_stats: WaitingStats;
}

// Muted palette — drawn from v2 tokens
const CATEGORY_COLORS: Record<string, string> = {
  Mat:         '#6EE7A0',
  Kaffe:       '#E8C46A',
  Elektronikk: '#9D89E8',
  Klær:        '#F5867B',
  Hobby:       '#6FA4E8',
  Restaurant:  '#F49F5A',
  Transport:   '#5BCFD6',
  Abonnement:  '#E89DC8',
  Helse:       '#7AD9A8',
  Annet:       '#6E6889',
};

function formatNOK(amount: number) {
  return new Intl.NumberFormat('nb-NO').format(Math.round(amount));
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-lg">
      {label && <p className="text-[#6E6889] mb-1 font-semibold">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="num font-bold">
          {p.name}: {formatNOK(p.value)} kr
        </p>
      ))}
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-fade-up">
      <div className="skeleton rounded-2xl h-10 w-32" />
      <div className="skeleton rounded-2xl h-52" />
      <div className="skeleton rounded-2xl h-52" />
      <div className="skeleton rounded-2xl h-36" />
      <div className="skeleton rounded-2xl h-28" />
    </div>
  );
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const insights = await profileApi.getInsights();
      setData(insights);
    } catch {/* ignore */} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <InsightsSkeleton />;

  const categoryData = data?.category_spending ?? [];
  const weeklyData = data?.weekly_data ?? [];
  const reasonData = data?.resisted_by_reason ?? [];
  const waitingStats = data?.waiting_list_stats ?? { total: 0, dropped: 0, saved: 0 };

  return (
    <div className="flex flex-col gap-4 p-4 pt-5 pb-6 animate-fade-up">
      <div>
        <span className="label">Innsikt</span>
        <h1 className="text-xl font-extrabold text-[#F5F3FF] tracking-tight mt-0.5">Historikk</h1>
      </div>

      {/* Weekly area chart — primary, leads with saved */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-green" />
          <h2 className="text-xs font-extrabold text-[#F5F3FF] uppercase tracking-wide">Spart vs brukt — ukentlig</h2>
        </div>
        {weeklyData.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[#6E6889] text-sm">Ingen data ennå</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="resistedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6EE7A0" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6EE7A0" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F5867B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#F5867B" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 4" stroke="#2A2740" />
              <XAxis
                dataKey="week"
                tick={{ fill: '#6E6889', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#2A2740' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6E6889', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${formatNOK(v)}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,.02)' }} />
              <Legend
                wrapperStyle={{ paddingTop: '12px', fontSize: '11px', color: '#6E6889' }}
                iconType="circle"
                iconSize={7}
              />
              <Area
                type="monotone"
                dataKey="resisted"
                name="Spart"
                stroke="#6EE7A0"
                strokeWidth={2}
                fill="url(#resistedGrad)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="spent"
                name="Brukt"
                stroke="#F5867B"
                strokeWidth={2}
                fill="url(#spentGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category spending */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-purple" />
          <h2 className="text-xs font-extrabold text-[#F5F3FF] uppercase tracking-wide">Forbruk per kategori (30 dager)</h2>
        </div>
        {categoryData.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[#6E6889] text-sm">Ingen data ennå</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 4" stroke="#2A2740" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#6E6889', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#2A2740' }}
                tickLine={false}
                tickFormatter={v => `${formatNOK(v)}`}
              />
              <YAxis
                type="category"
                dataKey="category"
                tick={{ fill: '#B8B2D1', fontSize: 12, fontFamily: 'Nunito', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,.02)' }} />
              <Bar dataKey="amount" name="Brukt" radius={[0, 6, 6, 0]} background={{ fill: '#252335', radius: 6 }}>
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[entry.category] || '#6E6889'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Resisted by reason */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={14} className="text-yellow" />
          <h2 className="text-xs font-extrabold text-[#F5F3FF] uppercase tracking-wide">Motstand etter grunn</h2>
        </div>
        {reasonData.length === 0 ? (
          <div className="flex items-center justify-center h-16 text-[#6E6889] text-sm">Ingen data ennå</div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {reasonData.map(item => {
              const maxAmount = Math.max(...reasonData.map(r => r.amount), 1);
              const pct = Math.max(5, (item.amount / maxAmount) * 100);
              return (
                <div key={item.reason}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#F5F3FF] text-sm font-bold tracking-tight">{item.reason}</span>
                    <div className="flex items-center gap-2 num text-xs">
                      <span className="text-[#6E6889] font-bold">{item.count}×</span>
                      <span className="text-green font-extrabold">{formatNOK(item.amount)} kr</span>
                    </div>
                  </div>
                  <div className="w-full bg-card-light rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-dark to-yellow rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Waiting list stats */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={14} className="text-purple" />
          <h2 className="text-xs font-extrabold text-[#F5F3FF] uppercase tracking-wide">Venteliste</h2>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <MiniStat value={`${waitingStats.total}`} label="Totalt" tone="default" />
          <MiniStat value={`${waitingStats.dropped}`} label="Droppet" tone="green" />
          <MiniStat value={formatNOK(waitingStats.saved)} label="Kr spart" tone="green" small />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ value, label, tone, small }: { value: string; label: string; tone: 'green' | 'default'; small?: boolean }) {
  const color = tone === 'green' ? 'text-green' : 'text-[#F5F3FF]';
  return (
    <div className="bg-card-light rounded-xl p-3 text-center">
      <p className={`num font-extrabold ${small ? 'text-base' : 'text-xl'} ${color} leading-tight`}>{value}</p>
      <p className="text-[#6E6889] text-[10px] font-bold mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}
