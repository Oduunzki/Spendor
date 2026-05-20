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
  return new Intl.NumberFormat('nb-NO').format(Math.round(amount)) + ' kr';
}

function calcWaitUntil(amount: number): string {
  const now = new Date();
  let days = 1;
  if (amount >= 5000) days = 30;
  else if (amount >= 1000) days = 14;
  else if (amount >= 500) days = 7;
  else if (amount >= 200) days = 3;
  now.setDate(now.getDate() + days);
  return now.toISOString();
}

function waitDaysLabel(amount: number): string {
  if (amount >= 5000) return '30 dager';
  if (amount >= 1000) return '14 dager';
  if (amount >= 500) return '7 dager';
  if (amount >= 200) return '3 dager';
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

  // Form state
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [reasonWanted, setReasonWanted] = useState('');
  const [formError, setFormError] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      const data = await waitingListApi.list();
      setItems(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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
      setDesc('');
      setAmount('');
      setCategory('');
      setReasonWanted('');
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
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await waitingListApi.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {
      // ignore
    }
  };

  const estimatedAmount = parseFloat(amount) || 0;

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
        <div>
          <h1 className="text-xl font-bold text-[#F9FAFB]">Venteliste</h1>
          <p className="text-[#6B7280] text-xs">Tenk deg om to ganger</p>
        </div>
      </div>

      {/* Stats banner */}
      <div className="mx-4 mb-4 bg-green/10 border border-green/30 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green/20 flex items-center justify-center flex-shrink-0">
          <ShoppingBag size={18} className="text-green" />
        </div>
        <div>
          <p className="text-[#F9FAFB] font-semibold text-sm">
            Du har droppet <span className="text-green">{droppedItems.length} ting</span> og spart{' '}
            <span className="text-green">{formatNOK(totalSaved)}</span>!
          </p>
          <p className="text-[#6B7280] text-xs mt-0.5">{items.length} ting totalt på listen</p>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3 px-4 pb-24">
        {loading ? (
          <>
            {[1, 2, 3].map(n => (
              <div key={n} className="skeleton rounded-xl h-28" />
            ))}
          </>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Clock size={48} className="text-[#374151] mb-4" />
            <p className="text-[#6B7280] font-medium">Ventelisten er tom</p>
            <p className="text-[#6B7280] text-sm mt-1">Legg til ting du vurderer å kjøpe</p>
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              className={`bg-card border rounded-xl p-4 transition-all duration-200
                ${item.outcome === 'skipped' ? 'border-green/30 opacity-80' : ''}
                ${item.outcome === 'bought' ? 'border-yellow/30 opacity-80' : ''}
                ${!item.outcome ? 'border-border' : ''}
              `}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <p className="text-[#F9FAFB] font-semibold text-base">{item.description}</p>
                  {item.estimated_amount > 0 && (
                    <p className="text-[#6B7280] text-sm">{formatNOK(item.estimated_amount)}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.outcome === 'skipped' && (
                    <span className="bg-green/20 text-green border border-green/40 text-xs font-bold px-2 py-1 rounded-full">Droppet!</span>
                  )}
                  {item.outcome === 'bought' && (
                    <span className="bg-yellow/20 text-yellow border border-yellow/40 text-xs font-bold px-2 py-1 rounded-full">Kjøpt</span>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 rounded-lg bg-red/10 hover:bg-red/20 flex items-center justify-center transition-all duration-200 cursor-pointer"
                  >
                    <Trash2 size={14} className="text-red" />
                  </button>
                </div>
              </div>

              {item.reason_wanted && (
                <p className="text-[#6B7280] text-xs mb-2 italic">"{item.reason_wanted}"</p>
              )}

              {item.category && (
                <span className="bg-card-light text-[#6B7280] text-xs px-2 py-0.5 rounded-full border border-border mr-2">
                  {item.category}
                </span>
              )}

              <div className="mt-2">
                {item.wait_until && <CountdownTimer waitUntil={item.wait_until} />}
              </div>

              {/* Action buttons if timer expired and no outcome */}
              {!item.outcome && item.wait_until && isExpired(item.wait_until) && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleOutcome(item.id, 'skipped')}
                    className="flex-1 min-h-[44px] bg-green/20 hover:bg-green/30 border border-green/40 text-green rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
                  >
                    Dropp det!
                  </button>
                  <button
                    onClick={() => handleOutcome(item.id, 'bought')}
                    className="flex-1 min-h-[44px] bg-red/20 hover:bg-red/30 border border-red/40 text-red rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
                  >
                    Kjøp likevel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-purple hover:bg-purple-dark text-white rounded-full shadow-purple-glow flex items-center justify-center cursor-pointer transition-all duration-200 z-40"
      >
        <Plus size={24} />
      </button>

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-t-3xl w-full max-w-lg p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#F9FAFB]">Legg til på venteliste</h2>
              <button
                onClick={() => { setShowModal(false); setFormError(''); }}
                className="w-9 h-9 rounded-xl bg-card-light border border-border flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-red/40"
              >
                <X size={16} className="text-[#6B7280]" />
              </button>
            </div>

            <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-1.5">Hva vil du kjøpe?</label>
                <input
                  type="text"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="F.eks. nye hodetelefoner, en jakke..."
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:border-purple/50 focus:ring-1 focus:ring-purple/30 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-1.5">Estimert pris (kr)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:border-purple/50 focus:ring-1 focus:ring-purple/30 transition-all duration-200"
                />
                {estimatedAmount > 0 && (
                  <p className="text-[#6B7280] text-xs mt-1.5 flex items-center gap-1">
                    <Clock size={12} />
                    Ventetid: <span className="text-purple font-medium">{waitDaysLabel(estimatedAmount)}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-1.5">Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(category === cat ? '' : cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer min-h-[36px]
                        ${category === cat
                          ? 'bg-purple/20 border border-purple/60 text-purple'
                          : 'bg-bg border border-border text-[#6B7280] hover:border-purple/30 hover:text-[#F9FAFB]'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-1.5">Hvorfor vil du ha det?</label>
                <input
                  type="text"
                  value={reasonWanted}
                  onChange={e => setReasonWanted(e.target.value)}
                  placeholder="F.eks. har ønsket meg det lenge..."
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:border-purple/50 focus:ring-1 focus:ring-purple/30 transition-all duration-200"
                />
              </div>

              {formError && (
                <p className="text-red text-sm bg-red/10 border border-red/20 rounded-lg px-3 py-2">{formError}</p>
              )}

              <button
                onClick={handleAddItem}
                disabled={submitting}
                className="w-full min-h-[52px] bg-purple hover:bg-purple-dark text-white font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-purple-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Legger til...
                  </span>
                ) : 'Legg til venteliste'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
