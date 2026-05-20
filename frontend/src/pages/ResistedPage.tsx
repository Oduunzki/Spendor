import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { resistedApi } from '../api/resisted';
import XpPopup from '../components/XpPopup';

const CATEGORIES = ['Mat', 'Kaffe', 'Elektronikk', 'Klær', 'Hobby', 'Restaurant', 'Transport', 'Abonnement', 'Helse', 'Annet'];
const REASONS = ['Kjedsomhet', 'Stress', 'FOMO', 'Vane', 'Trøst', 'Annet'];

function calcXp(amount: number): number {
  return Math.max(5, Math.floor(amount / 10));
}

function formatNOK(amount: number) {
  return new Intl.NumberFormat('nb-NO').format(Math.round(amount)) + ' kr';
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
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#22C55E', '#EAB308', '#8B5CF6', '#F9FAFB'],
      });
      setTimeout(() => {
        navigate('/');
      }, 2500);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Noe gikk galt. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center animate-fade-up">
        <XpPopup xp={earnedXp} visible={showXp} onDone={() => setShowXp(false)} />
        <div className="w-20 h-20 rounded-full bg-green/20 border-2 border-green/50 flex items-center justify-center mb-6 shadow-green-glow">
          <CheckCircle2 size={40} className="text-green" />
        </div>
        <h2 className="text-2xl font-bold text-[#F9FAFB] mb-2">Fantastisk jobbet!</h2>
        <p className="text-[#6B7280] text-base mb-4">
          Du sparte <span className="text-green font-bold">{formatNOK(savedAmount)}</span> og tjente{' '}
          <span className="text-yellow font-bold">+{earnedXp} XP</span>!
        </p>
        <p className="text-[#6B7280] text-sm">Tar deg hjem om et øyeblikk...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-purple/40"
        >
          <ArrowLeft size={18} className="text-[#6B7280]" />
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck size={22} className="text-green" />
          <h1 className="text-xl font-bold text-[#F9FAFB]">Kjempebra! Du motstod noe!</h1>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-4 flex-1">
        {/* What did you resist */}
        <div>
          <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Hva ville du kjøpt?</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="F.eks. nye sneakers, en fancy kaffe, spill på Steam..."
            rows={3}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:border-green/50 focus:ring-1 focus:ring-green/30 transition-all duration-200 resize-none text-base"
          />
        </div>

        {/* Amount with XP preview */}
        <div>
          <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Estimert pris</label>
          <div className="relative flex items-center">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full bg-card border border-border rounded-xl px-4 py-3 pr-24 text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:border-green/50 focus:ring-1 focus:ring-green/30 transition-all duration-200 text-base"
            />
            <span className="absolute right-4 text-[#6B7280] font-medium pointer-events-none flex items-center gap-2">
              kr
              {estimatedAmount > 0 && (
                <span className="text-yellow text-sm font-bold">≈ +{xpPreview} XP</span>
              )}
            </span>
          </div>
        </div>

        {/* Category chips */}
        <div>
          <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Kategori</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(category === cat ? '' : cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer min-h-[36px]
                  ${category === cat
                    ? 'bg-green/20 border border-green/60 text-green shadow-green-glow'
                    : 'bg-card border border-border text-[#6B7280] hover:border-green/30 hover:text-[#F9FAFB]'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Reason buttons */}
        <div>
          <label className="block text-sm font-medium text-[#F9FAFB] mb-2">Hvorfor ville du kjøpt det?</label>
          <div className="flex flex-wrap gap-2">
            {REASONS.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(reason === r ? '' : r)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer min-h-[36px]
                  ${reason === r
                    ? 'bg-purple/20 border border-purple/60 text-purple shadow-purple-glow'
                    : 'bg-card border border-border text-[#6B7280] hover:border-purple/30 hover:text-[#F9FAFB]'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red text-sm bg-red/10 border border-red/20 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full min-h-[60px] bg-green hover:bg-green-dark text-white font-bold text-lg rounded-xl transition-all duration-200 cursor-pointer shadow-green-glow disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Lagrer...
            </span>
          ) : 'Logg motstanden! 💪'}
        </button>
      </div>
    </div>
  );
}
