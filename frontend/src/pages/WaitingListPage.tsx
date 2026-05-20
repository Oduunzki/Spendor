// Spendor — WaitingListPage
// Same backend logic. Calmer visual treatment: no neon, soft gold FAB, item
// cards lean on category accent stripe + countdown chip. Modal becomes a
// clean sheet with steady border styling.

import { useState, useEffect, useCallback } from 'react';
import { Plus, X, ShoppingBag, ArrowLeft, Clock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { waitingListApi } from '../api/waitingList';
import CountdownTimer from '../components/CountdownTimer';

const CATEGORIES = ['Mat', 'Kaffe', 'Elektronikk', 'Klær', 'Hobby', 'Restaurant', 'Transport', 'Abonnement', 'Helse', 'Annet'];

interface WaitingItem {
  id: string;
  description: string;
  estimated_amount: number;
  category: string;
  reason_wanted: string;
  outcome: 'bought' | 'skipped' | 'still_waiting' | null;
  wait_until: string;
  created_at: string;
}

function formatNOK(amount: number) {
  return new Intl.NumberFormat('nb-NO').format(Math.round(amount)).replace(/,/g, ' ');
}

function waitDaysLabel(amount: number): string {
  if (amount >= 5000) return '30 dager';
  if (amount >= 1000) return '14 dager';
  if (amount >= 500)  return '7 dager';
  if (amount >= 200)  return '3 dager';
  return '1 dag';
}

function isExpired(waitUntil: string): boolean {
  return new Date(waitUntil).getTime() <= Date.now();
}

export default function WaitingListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<WaitingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [reasonWanted, setReasonWanted] = useState('');
  const [formError, setFormError] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      const data = await waitingListApi.list();
      setItems(data);
    } catch {/* ignore */} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const droppedItems = items.filter(i => i.outcome === 'skipped');
  const totalSaved = droppedItems.reduce((sum, i) => sum + (i.estimated_amount || 0), 0);

  const handleAddItem = async () => {
    if (!desc.trim()) { setFormError('Beskriv hva du vil kjøpe'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      const newItem = await waitingListApi.create({
        description: desc.trim(),
        estimated_amount: parseFloat(amount) || undefined,
        category: category || undefined,
        reason_wanted: reasonWanted.trim() || undefined,
      });
      setItems(prev => [newItem, ...prev]);
      setShowModal(false);
      setDesc(''); setAmount(''); setCategory(''); setReasonWanted('');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setFormError(axiosErr.response?.data?.error || 'Noe gikk galt. Prøv igjen.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOutcome = async (id: string, outcome: 'bought' | 'skipped' | 'still_waiting') => {
    try {
      const updated = await waitingListApi.updateOutcome(id, outcome);
      setItems(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
    } catch {/* ignore */}
  };

  const handleDelete = async (id: string) => {
    try {
      await waitingListApi.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {/* ignore */}
  };

  const estimatedAmount = parseFloat(amount) || 0;
  const active = items.filter(i => !i.outcome);

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
        <div>
          <h1 className="text-lg font-extrabold text-[#F5F3FF] tracking-tight">Venteliste</h1>
          <p className="text-[#6E6889] text-xs">Lyster du fortsatt?</p>
        </div>
      </div>

      {/* Stats banner */}
      {(droppedItems.length > 0 || items.length > 0) && (
        <div className="mx-4 mb-4 bg-card border border-green/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-green/10 border border-green/25 flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={18} className="text-green" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#B8B2D1] text-xs">
              Droppet <span className="num text-green font-bold">{droppedItems.length}</span>
              {items.length > 0 && <> av <span className="num text-[#B8B2D1] font-bold">{items.length}</span></>} ting
            </p>
            <p className="num text-green text-xl font-bold leading-tight tracking-tight">
              {formatNOK(totalSaved)} <span className="text-xs text-[#6E6889] font-bold">kr spart</span>
            </p>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-2.5 px-4 pb-4">
        {loading ? (
          <>
            {[1, 2, 3].map(n => (
              <div key={n} className="skeleton rounded-2xl h-28" />
            ))}
          </>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center mb-3">
              <Clock size={22} className="text-[#6E6889]" />
            </div>
            <p className="text-[#B8B2D1] font-bold tracking-tight">Ventelisten er tom</p>
            <p className="text-[#6E6889] text-xs mt-1 max-w-[240px]">
              Legg til ting du vurderer å kjøpe — vi setter en cooldown.
            </p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <span className="label px-1">Aktive ({active.length})</span>
            )}
            {items.map(item => {
              const expired = item.wait_until && isExpired(item.wait_until) && !item.outcome;
              return (
                <div
                  key={item.id}
                  className={`bg-card border rounded-2xl p-4 transition-colors
                    ${item.outcome === 'skipped' ? 'border-green/25 opacity-80' : ''}
                    ${item.outcome === 'bought'  ? 'border-yellow/25 opacity-80' : ''}
                    ${!item.outcome ? (expired ? 'border-green/30' : 'border-border') : ''}
                  `}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[#F5F3FF] font-extrabold text-base tracking-tight truncate">
                        {item.description}
                      </p>
                      {item.estimated_amount > 0 && (
                        <p className="num text-[#B8B2D1] text-sm font-bold mt-0.5">
                          {formatNOK(item.estimated_amount)} <span className="text-[#6E6889] text-xs font-bold">kr</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.outcome === 'skipped' && (
                        <span className="bg-green/12 text-green border border-green/25 text-[10px] font-extrabold px-2 py-1 rounded-full uppercase tracking-wide">Droppet</span>
                      )}
                      {item.outcome === 'bought' && (
                        <span className="bg-yellow/12 text-yellow border border-yellow/25 text-[10px] font-extrabold px-2 py-1 rounded-full uppercase tracking-wide">Kjøpt</span>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-8 h-8 rounded-lg bg-card-light hover:bg-red/15 border border-border hover:border-red/30 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} className="text-[#6E6889]" />
                      </button>
                    </div>
                  </div>

                  {item.reason_wanted && (
                    <p className="text-[#6E6889] text-xs mb-2 italic">"{item.reason_wanted}"</p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {item.category && (
                      <span className="bg-card-light text-[#B8B2D1] text-[10px] font-bold px-2 py-0.5 rounded-full border border-border">
                        {item.category}
                      </span>
                    )}
                    {item.wait_until && !item.outcome && <CountdownTimer waitUntil={item.wait_until} />}
                  </div>

                  {expired && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleOutcome(item.id, 'bought')}
                        className="flex-1 min-h-[44px] bg-card-light hover:bg-white/5 border border-border text-[#B8B2D1] rounded-xl text-xs font-bold transition-colors cursor-pointer tracking-tight"
                      >
                        Trenger det fortsatt
                      </button>
                      <button
                        onClick={() => handleOutcome(item.id, 'skipped')}
                        className="flex-1 min-h-[44px] bg-green hover:bg-green-dark text-[#0E2A18] rounded-xl text-xs font-extrabold transition-colors cursor-pointer tracking-tight flex items-center justify-center gap-1.5"
                      >
                        Trengte det ikke
                        <span className="num bg-[#0E2A18]/15 text-[#0E2A18] text-[9px] font-bold rounded-full px-1.5 py-0.5">
                          +50 XP
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-28 right-5 w-14 h-14 bg-yellow hover:bg-yellow-dark text-[#3A2400] rounded-full shadow-yellow-glow flex items-center justify-center cursor-pointer transition-colors z-40 active:scale-95"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 backdrop-blur-sm" onClick={() => { setShowModal(false); setFormError(''); }}>
          <div className="bg-card border-t border-border rounded-t-3xl w-full max-w-lg p-5 animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-[#F5F3FF] tracking-tight">Legg til på venteliste</h2>
              <button
                onClick={() => { setShowModal(false); setFormError(''); }}
                className="w-9 h-9 rounded-xl bg-card-light border border-border flex items-center justify-center cursor-pointer transition-colors hover:border-red/30"
              >
                <X size={15} className="text-[#6E6889]" />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-[#B8B2D1] mb-1.5 tracking-tight">Hva vil du kjøpe?</label>
                <input
                  type="text"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="f.eks. nye hodetelefoner"
                  className="w-full bg-bg border border-border rounded-2xl px-4 py-3 text-[#F5F3FF] placeholder-[#4A4560] focus:outline-none focus:border-purple/30 transition-colors font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#B8B2D1] mb-1.5 tracking-tight">Estimert pris (kr)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="num w-full bg-bg border border-border rounded-2xl px-4 py-3 text-[#F5F3FF] placeholder-[#4A4560] focus:outline-none focus:border-purple/30 transition-colors font-bold"
                />
                {estimatedAmount > 0 && (
                  <p className="text-[#6E6889] text-xs mt-1.5 flex items-center gap-1">
                    <Clock size={11} />
                    Ventetid: <span className="text-yellow font-extrabold">{waitDaysLabel(estimatedAmount)}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-[#B8B2D1] mb-1.5 tracking-tight">Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(category === cat ? '' : cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer min-h-[34px]
                        ${category === cat
                          ? 'bg-purple/15 border border-purple/40 text-purple'
                          : 'bg-bg border border-border text-[#6E6889] hover:border-purple/25 hover:text-[#B8B2D1]'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#B8B2D1] mb-1.5 tracking-tight">Hvorfor vil du ha det?</label>
                <input
                  type="text"
                  value={reasonWanted}
                  onChange={e => setReasonWanted(e.target.value)}
                  placeholder="f.eks. har ønsket meg det lenge"
                  className="w-full bg-bg border border-border rounded-2xl px-4 py-3 text-[#F5F3FF] placeholder-[#4A4560] focus:outline-none focus:border-purple/30 transition-colors font-semibold"
                />
              </div>

              {formError && (
                <p className="text-red text-sm bg-red/10 border border-red/20 rounded-xl px-3 py-2 font-semibold">{formError}</p>
              )}

              <button
                onClick={handleAddItem}
                disabled={submitting}
                className="w-full min-h-[52px] bg-green hover:bg-green-dark text-[#0E2A18] font-extrabold rounded-2xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed tracking-tight"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0E2A18]/30 border-t-[#0E2A18] rounded-full animate-spin" />
                    Legger til...
                  </span>
                ) : 'Legg til'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
