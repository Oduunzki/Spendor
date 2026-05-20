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
import { BarChart2, TrendingUp, ShieldCheck, Clock } from 'lucide-react';
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

const CATEGORY_COLORS: Record<string, string> = {
  Mat: '#22C55E',
  Kaffe: '#EAB308',
  Elektronikk: '#8B5CF6',
  Klær: '#EF4444',
  Hobby: '#3B82F6',
  Restaurant: '#F97316',
  Transport: '#06B6D4',
  Abonnement: '#EC4899',
  Helse: '#10B981',
  Annet: '#6B7280',
};

function formatNOK(amount: number) {
  return new Intl.NumberFormat('nb-NO').format(Math.round(amount));
}

const chartTheme = {
  backgroundColor: 'transparent',
  strokeDasharray: '3 3',
  stroke: '#374151',
  fill: '#1F2937',
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-lg">
      {label && <p className="text-[#6B7280] mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {formatNOK(p.value)} kr
        </p>
      ))}
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-fade-up">
      <div className="skeleton rounded-xl h-10 w-32" />
      <div className="skeleton rounded-xl h-52" />
      <div className="skeleton rounded-xl h-52" />
      <div className="skeleton rounded-xl h-36" />
      <div className="skeleton rounded-xl h-28" />
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
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <InsightsSkeleton />;

  const categoryData = data?.category_spending ?? [];
  const weeklyData = data?.weekly_data ?? [];
  const reasonData = data?.resisted_by_reason ?? [];
  const waitingStats = data?.waiting_list_stats ?? { total: 0, dropped: 0, saved: 0 };

  return (
    <div className="flex flex-col gap-5 p-4 pb-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-2 pt-2">
        <BarChart2 size={22} className="text-purple" />
        <h1 className="text-2xl font-bold text-[#F9FAFB]">Innsikt</h1>
      </div>

      {/* Category spending chart */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-purple" />
          <h2 className="text-sm font-semibold text-[#F9FAFB] uppercase tracking-wide">Forbruk per kategori (siste 30 dager)</h2>
        </div>
        {categoryData.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[#6B7280] text-sm">Ingen data ennå</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={categoryData}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray={chartTheme.strokeDasharray}
                stroke={chartTheme.stroke}
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: '#6B7280', fontSize: 11 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={false}
                tickFormatter={v => `${formatNOK(v)}`}
              />
              <YAxis
                type="category"
                dataKey="category"
                tick={{ fill: '#F9FAFB', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="amount"
                name="Brukt"
                radius={[0, 6, 6, 0]}
                fill="#8B5CF6"
                background={{ fill: '#1F2937', radius: 6 }}
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[entry.category] || '#6B7280'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Weekly savings area chart */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-green" />
          <h2 className="text-sm font-semibold text-[#F9FAFB] uppercase tracking-wide">Ukentlig oversikt</h2>
        </div>
        {weeklyData.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[#6B7280] text-sm">Ingen data ennå</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="resistedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray={chartTheme.strokeDasharray}
                stroke={chartTheme.stroke}
              />
              <XAxis
                dataKey="week"
                tick={{ fill: '#6B7280', fontSize: 11 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${formatNOK(v)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '12px', fontSize: '12px', color: '#6B7280' }}
                iconType="circle"
                iconSize={8}
              />
              <Area
                type="monotone"
                dataKey="resisted"
                name="Spart"
                stroke="#22C55E"
                strokeWidth={2}
                fill="url(#resistedGrad)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="spent"
                name="Brukt"
                stroke="#EF4444"
                strokeWidth={2}
                fill="url(#spentGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Resisted by reason */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={16} className="text-yellow" />
          <h2 className="text-sm font-semibold text-[#F9FAFB] uppercase tracking-wide">Motstod etter grunn</h2>
        </div>
        {reasonData.length === 0 ? (
          <div className="flex items-center justify-center h-16 text-[#6B7280] text-sm">Ingen data ennå</div>
        ) : (
          <div className="flex flex-col gap-3">
            {reasonData.map((item) => {
              const maxAmount = Math.max(...reasonData.map(r => r.amount), 1);
              const pct = Math.max(5, (item.amount / maxAmount) * 100);
              return (
                <div key={item.reason}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#F9FAFB] text-sm font-medium">{item.reason}</span>
                    <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                      <span>{item.count}x</span>
                      <span className="text-green font-semibold">{formatNOK(item.amount)} kr</span>
                    </div>
                  </div>
                  <div className="w-full bg-card-light rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow to-yellow-dark rounded-full transition-all duration-700"
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
          <Clock size={16} className="text-purple" />
          <h2 className="text-sm font-semibold text-[#F9FAFB] uppercase tracking-wide">Venteliste</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card-light rounded-xl p-3 text-center">
            <p className="text-[#F9FAFB] font-bold text-xl">{waitingStats.total}</p>
            <p className="text-[#6B7280] text-xs mt-0.5">totalt</p>
          </div>
          <div className="bg-card-light rounded-xl p-3 text-center">
            <p className="text-green font-bold text-xl">{waitingStats.dropped}</p>
            <p className="text-[#6B7280] text-xs mt-0.5">droppet</p>
          </div>
          <div className="bg-card-light rounded-xl p-3 text-center">
            <p className="text-yellow font-bold text-lg">{formatNOK(waitingStats.saved)}</p>
            <p className="text-[#6B7280] text-xs mt-0.5">spart kr</p>
          </div>
        </div>
        {waitingStats.total > 0 && (
          <p className="text-[#6B7280] text-xs mt-3 text-center">
            {waitingStats.dropped} av {waitingStats.total} ting droppet — spart{' '}
            <span className="text-green font-semibold">{formatNOK(waitingStats.saved)} kr</span>
          </p>
        )}
      </div>
    </div>
  );
}
