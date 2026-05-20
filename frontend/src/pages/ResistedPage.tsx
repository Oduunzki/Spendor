// Spendor — ResistedPage
// Calmer header copy ("Jeg motstod" — no exclamation), softer celebration
// (no neon, palette matches v2: mint + muted gold + soft violet), XP preview
// in tabular numerals.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { resistedApi } from '../api/resisted';
import XpPopup from '../components/XpPopup';

const CATEGORIES = ['Mat', 'Kaffe', 'Elektronikk', 'Klær', 'Hobby', 'Restaurant', 'Transport', 'Abonnement', 'Helse', 'Annet'];
const REASONS = ['Kjedsomhet', 'Stress', 'FOMO', 'Vane', 'Trøst', 'Belønning', 'Annet'];
const AMOUNT_PRESETS = [50, 100, 200, 500, 1000];

function calcXp(amount: number): number {
  return Math.max(5, Math.floor(amount / 10));
}

function formatNOK(amount: number) {
  return new Intl.NumberFormat('nb-NO').format(Math.round(amount)).replace(/,/g, ' ');
}

export default function ResistedPage() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [savedAmount, setSavedAmount] = useState(0);
  const [showXp, setShowXp] = useState(false);

  const estimatedAmount = parseFloat(amount) || 0;
  const xpPreview = calcXp(estimatedAmount);

  const handleSubmit = async () => {
    if (!description.trim()) { setError('Beskriv hva du ville kjøpt'); return; }
    if (estimatedAmount <= 0) { setError('Skriv inn et beløp'); return; }
    setError('');
    setLoading(true);
    try {
      const result = await resistedApi.create({
        description: description.trim(),
        estimated_amount: estimatedAmount,
        category: category || undefined,
        reason: reason || undefined,
      });
      const xp = result.xp_earned ?? xpPreview;
      setEarnedXp(xp);
      setSavedAmount(estimatedAmount);
      setSuccess(true);
      setShowXp(true);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#6EE7A0', '#E8C46A', '#9D89E8', '#F49F5A'],
        scalar: 0.8,
      });
      setTimeout(() => navigate('/'), 2400);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Noe gikk galt. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-up">
        <XpPopup xp={earnedXp} visible={showXp} onDone={() => setShowXp(false)} />
        <div className="w-16 h-16 rounded-full bg-green/12 border border-green/30 flex items-center justify-center mb-5">
          <CheckCircle2 size={32} className="text-green" strokeWidth={2.2} />
        </div>
        <span className="label text-green">Registrert</span>
        <h2 className="text-xl font-extrabold text-[#F5F3FF] mt-1 tracking-tight">Du sparte</h2>
        <div className="num text-green text-5xl font-bold mt-2 leading-none">
          {formatNOK(savedAmount)}
          <span className="text-xl ml-1 text-[#6E6889] font-bold">kr</span>
        </div>
        <div className="num inline-flex items-center gap-1.5 mt-6 bg-yellow/12 border border-yellow/25 text-yellow rounded-full px-4 py-1.5 text-sm font-bold">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>
          +{earnedXp} XP
        </div>
        <p className="text-[#6E6889] text-xs mt-5">Tar deg til hjem...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-card border border-border flex items-center justify-center cursor-pointer transition-colors hover:border-purple/30"
        >
          <ArrowLeft size={18} className="text-[#B8B2D1]" />
        </button>
        <h1 className="text-lg font-extrabold text-[#F5F3FF] tracking-tight">Jeg motstod noe</h1>
      </div>

      <div className="flex flex-col gap-5 p-4 flex-1">
        {/* Hero */}
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-green/10 border border-green/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={20} className="text-green" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-[#F5F3FF] font-extrabold tracking-tight">Bra jobbet.</p>
            <p className="text-[#6E6889] text-xs">Tre raske spørsmål.</p>
          </div>
        </div>

        {/* What */}
        <Step n={1} label="Hva var det?">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="f.eks. AirPods Pro, Joe & The Juice…"
            rows={2}
            className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-[#F5F3FF] placeholder-[#4A4560] focus:outline-none focus:border-green/30 transition-colors resize-none text-base font-semibold"
          />
        </Step>

        {/* How much */}
        <Step n={2} label="Ca. hvor mye?">
          <div className="flex flex-wrap gap-2">
            {AMOUNT_PRESETS.map(p => {
              const active = parseFloat(amount) === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(String(p))}
                  className={`num px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer min-h-[40px]
                    ${active
                      ? 'bg-green/15 border border-green text-green'
                      : 'bg-card border border-border text-[#B8B2D1] hover:border-green/30'
                    }`}
                >
                  {p} <span className="text-[10px] opacity-60 font-bold">kr</span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Egendefinert"
              min="0"
              className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-[#F5F3FF] placeholder-[#4A4560] focus:outline-none focus:border-green/30 transition-colors text-sm font-bold num"
            />
            {estimatedAmount > 0 && (
              <span className="num text-yellow text-xs font-bold flex-shrink-0">
                +{xpPreview} XP
              </span>
            )}
          </div>
        </Step>

        {/* Category */}
        <Step n={3} label="Kategori (valgfritt)">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(category === cat ? '' : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer min-h-[34px]
                  ${category === cat
                    ? 'bg-purple/15 border border-purple/40 text-purple'
                    : 'bg-card border border-border text-[#6E6889] hover:border-purple/25 hover:text-[#B8B2D1]'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </Step>

        {/* Reason */}
        <Step n={4} label="Hvorfor ville du ha det?">
          <div className="flex flex-wrap gap-2">
            {REASONS.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(reason === r ? '' : r)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer min-h-[34px]
                  ${reason === r
                    ? 'bg-red/15 border border-red/40 text-red'
                    : 'bg-card border border-border text-[#6E6889] hover:border-red/25 hover:text-[#B8B2D1]'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>
        </Step>

        {error && (
          <p className="text-red text-sm bg-red/10 border border-red/20 rounded-xl px-3 py-2 font-semibold">{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full min-h-[60px] bg-green hover:bg-green-dark text-[#0E2A18] font-extrabold text-base rounded-2xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-1 flex items-center justify-center gap-2.5 tracking-tight"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-[#0E2A18]/30 border-t-[#0E2A18] rounded-full animate-spin" />
              Lagrer...
            </>
          ) : (
            <>
              Lagre
              {estimatedAmount > 0 && (
                <span className="num bg-[#0E2A18]/15 text-[#0E2A18] text-[11px] font-bold rounded-full px-2 py-0.5">
                  +{xpPreview} XP
                </span>
              )}
            </>
          )}
        </button>

        <p className="text-center text-[#6E6889] text-xs">
          Ingen skam — bare data. Hver motstand teller.
        </p>
      </div>
    </div>
  );
}

interface StepProps { n: number; label: string; children: React.ReactNode }
function Step({ n, label, children }: StepProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-5 h-5 rounded-full bg-green/12 border border-green/25 text-green text-[10px] font-extrabold inline-flex items-center justify-center">
          {n}
        </span>
        <label className="text-sm font-bold text-[#F5F3FF] tracking-tight">{label}</label>
      </div>
      {children}
    </div>
  );
}
