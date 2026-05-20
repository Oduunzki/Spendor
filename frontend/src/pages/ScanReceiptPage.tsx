// Spendor — ScanReceiptPage
// Calmer chrome, no neon glow on the done state. Camera-zone uses the dashed
// purple corner-mark look from the v2 prototype.

import { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, ArrowLeft, CheckCircle2, RotateCcw, Home } from 'lucide-react';
import { receiptsApi } from '../api/receipts';

type ScanState = 'idle' | 'scanning' | 'review' | 'done';

const CATEGORIES = ['Mat', 'Kaffe', 'Elektronikk', 'Klær', 'Hobby', 'Restaurant', 'Transport', 'Abonnement', 'Helse', 'Annet'];

interface ReceiptItem {
  description: string;
  amount: number;
  category: string;
}

interface ParsedReceipt {
  store_name: string;
  receipt_date: string;
  total_amount: number;
  items: ReceiptItem[];
  planned: boolean;
}

export default function ScanReceiptPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<ScanState>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [parsedReceipt, setParsedReceipt] = useState<ParsedReceipt | null>(null);
  const [error, setError] = useState('');

  const processFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setState('scanning');
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const result = await receiptsApi.scan(formData);
      const today = new Date().toISOString().split('T')[0];
      setParsedReceipt({
        store_name: result.store_name || '',
        receipt_date: result.date || today,
        total_amount: result.total || 0,
        items: (result.items || []).map((item: Partial<ReceiptItem>) => ({
          description: item.description || '',
          amount: item.amount || 0,
          category: item.category || 'Annet',
        })),
        planned: false,
      });
      setState('review');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Kunne ikke analysere kvitteringen. Prøv igjen.');
      setState('idle');
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleConfirm = async () => {
    if (!parsedReceipt) return;
    setIsSaving(true);
    try {
      await receiptsApi.confirm(parsedReceipt);
      setState('done');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Kunne ikke lagre kvitteringen.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateItem = (index: number, field: keyof ReceiptItem, value: string | number) => {
    setParsedReceipt(prev => {
      if (!prev) return null;
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const resetScan = () => {
    setState('idle');
    setImagePreview(null);
    setParsedReceipt(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
    if (cameraRef.current) cameraRef.current.value = '';
  };

  // DONE
  if (state === 'done') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-green/12 border border-green/30 flex items-center justify-center mb-5">
          <CheckCircle2 size={32} className="text-green" strokeWidth={2.2} />
        </div>
        <span className="label text-green">Lagret</span>
        <h2 className="text-xl font-extrabold text-[#F5F3FF] mt-1 tracking-tight">Kvittering registrert</h2>
        <div className="num inline-flex items-center gap-1.5 mt-3 bg-yellow/12 border border-yellow/25 text-yellow rounded-full px-3.5 py-1.5 text-sm font-bold">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>
          +5 XP
        </div>
        <p className="text-[#6E6889] text-xs mt-5 mb-7 max-w-xs">
          Bra jobbet med å holde oversikten over forbruket ditt.
        </p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <button
            onClick={resetScan}
            className="w-full min-h-[48px] bg-card border border-border hover:border-purple/30 text-[#F5F3FF] rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw size={16} />
            Skann ny
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full min-h-[48px] bg-green hover:bg-green-dark text-[#0E2A18] rounded-2xl font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home size={16} />
            Til hjem
          </button>
        </div>
      </div>
    );
  }

  // SCANNING
  if (state === 'scanning') {
    return (
      <div className="min-h-screen flex flex-col pb-32">
        <Header onBack={resetScan} title="Analyserer..." />
        <div className="flex-1 flex flex-col items-center justify-center p-4 gap-5">
          {imagePreview && (
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-border">
              <img src={imagePreview} alt="Kvittering" className="w-full object-cover max-h-72 opacity-50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg/60 backdrop-blur-sm">
                <div className="w-9 h-9 border-2 border-purple/30 border-t-purple rounded-full animate-spin" />
                <p className="text-[#F5F3FF] font-bold text-sm text-center px-4">
                  Analyserer kvitteringen...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // REVIEW
  if (state === 'review' && parsedReceipt) {
    return (
      <div className="flex flex-col min-h-screen pb-32">
        <Header onBack={resetScan} title="Bekreft kvittering" />

        <div className="flex flex-col gap-4 p-4">
          {imagePreview && (
            <img src={imagePreview} alt="Kvittering" className="w-full max-h-32 object-cover rounded-2xl opacity-60 border border-border" />
          )}

          {/* Store + total */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <span className="label">Butikk</span>
            <input
              type="text"
              value={parsedReceipt.store_name}
              onChange={e => setParsedReceipt(prev => prev ? { ...prev, store_name: e.target.value } : null)}
              className="w-full bg-transparent text-[#F5F3FF] font-extrabold text-lg tracking-tight focus:outline-none mt-0.5"
            />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <span className="label text-[10px]">Dato</span>
                <input
                  type="date"
                  value={parsedReceipt.receipt_date}
                  onChange={e => setParsedReceipt(prev => prev ? { ...prev, receipt_date: e.target.value } : null)}
                  className="w-full bg-card-light border border-border rounded-xl px-3 py-2 text-[#F5F3FF] focus:outline-none focus:border-purple/30 transition-colors text-sm mt-1"
                />
              </div>
              <div>
                <span className="label text-[10px]">Totalt (kr)</span>
                <input
                  type="number"
                  value={parsedReceipt.total_amount}
                  onChange={e => setParsedReceipt(prev => prev ? { ...prev, total_amount: parseFloat(e.target.value) || 0 } : null)}
                  className="num w-full bg-card-light border border-border rounded-xl px-3 py-2 text-[#F5F3FF] focus:outline-none focus:border-purple/30 transition-colors text-sm font-bold mt-1"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          {parsedReceipt.items.length > 0 && (
            <div>
              <span className="label px-1">Varer ({parsedReceipt.items.length})</span>
              <div className="flex flex-col gap-2 mt-2">
                {parsedReceipt.items.map((item, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-2xl p-3 flex flex-col gap-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => updateItem(idx, 'description', e.target.value)}
                      placeholder="Varebeskrivelse"
                      className="bg-transparent text-[#F5F3FF] text-sm font-semibold focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={item.amount}
                        onChange={e => updateItem(idx, 'amount', parseFloat(e.target.value) || 0)}
                        className="num w-24 bg-card-light border border-border rounded-lg px-2 py-1.5 text-[#F5F3FF] text-xs font-bold focus:outline-none focus:border-purple/30"
                      />
                      <span className="text-[#6E6889] text-xs">kr</span>
                      <select
                        value={item.category}
                        onChange={e => updateItem(idx, 'category', e.target.value)}
                        className="flex-1 bg-card-light border border-border rounded-lg px-2 py-1.5 text-[#F5F3FF] text-xs font-semibold focus:outline-none focus:border-purple/30 cursor-pointer"
                      >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Planned toggle */}
          <div>
            <span className="label px-1">Var dette planlagt?</span>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setParsedReceipt(prev => prev ? { ...prev, planned: true } : null)}
                className={`flex-1 min-h-[52px] rounded-2xl font-extrabold text-sm transition-colors cursor-pointer border tracking-tight
                  ${parsedReceipt.planned
                    ? 'bg-green/15 border-green/40 text-green'
                    : 'bg-card border-border text-[#6E6889]'
                  }`}
              >
                Ja, planlagt
              </button>
              <button
                type="button"
                onClick={() => setParsedReceipt(prev => prev ? { ...prev, planned: false } : null)}
                className={`flex-1 min-h-[52px] rounded-2xl font-extrabold text-sm transition-colors cursor-pointer border tracking-tight
                  ${!parsedReceipt.planned
                    ? 'bg-red/15 border-red/40 text-red'
                    : 'bg-card border-border text-[#6E6889]'
                  }`}
              >
                Nei, impuls
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red text-sm bg-red/10 border border-red/20 rounded-xl px-3 py-2 font-semibold">{error}</p>
          )}

          <button
            onClick={handleConfirm}
            disabled={isSaving}
            className="w-full min-h-[56px] bg-green hover:bg-green-dark text-[#0E2A18] font-extrabold rounded-2xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-1 flex items-center justify-center gap-2 tracking-tight"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-[#0E2A18]/30 border-t-[#0E2A18] rounded-full animate-spin" />
                Lagrer...
              </>
            ) : (
              <>
                Bekreft og lagre
                <span className="num bg-[#0E2A18]/15 text-[#0E2A18] text-[11px] font-bold rounded-full px-2 py-0.5">
                  +5 XP
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // IDLE
  return (
    <div className="flex flex-col min-h-screen pb-32">
      <Header onBack={() => navigate(-1)} title="Skann kvittering" />

      <div className="flex-1 flex flex-col p-4 gap-4">
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

        {/* Drop zone */}
        <button
          onClick={() => cameraRef.current?.click()}
          className="relative w-full aspect-[3/4] rounded-3xl bg-card border-2 border-dashed border-purple/30 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-purple/50 transition-colors group overflow-hidden"
        >
          {/* corner marks */}
          {(['tl','tr','bl','br'] as const).map(c => (
            <span
              key={c}
              className="absolute w-6 h-6 border-purple/60"
              style={{
                ...(c === 'tl' ? { top: 14, left: 14, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 14 } : {}),
                ...(c === 'tr' ? { top: 14, right: 14, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 14 } : {}),
                ...(c === 'bl' ? { bottom: 14, left: 14, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 14 } : {}),
                ...(c === 'br' ? { bottom: 14, right: 14, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 14 } : {}),
              }}
            />
          ))}
          <div className="w-16 h-16 rounded-2xl bg-purple/15 border border-purple/30 flex items-center justify-center text-purple group-hover:scale-105 transition-transform">
            <Camera size={28} strokeWidth={1.8} />
          </div>
          <div className="text-center">
            <p className="text-[#F5F3FF] font-extrabold text-base tracking-tight">Ta bilde</p>
            <p className="text-[#6E6889] text-xs mt-0.5">Vi henter butikk, dato og varer automatisk</p>
          </div>
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="w-full min-h-[52px] bg-card border border-border hover:border-purple/30 rounded-2xl flex items-center justify-center gap-2 text-[#F5F3FF] font-bold transition-colors cursor-pointer"
        >
          <Image size={18} className="text-purple" />
          Velg fra galleri
        </button>

        {error && (
          <p className="text-red text-sm bg-red/10 border border-red/20 rounded-xl px-3 py-2 text-center font-semibold">{error}</p>
        )}
      </div>
    </div>
  );
}

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="flex items-center gap-3 p-4 pt-6">
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-2xl bg-card border border-border flex items-center justify-center cursor-pointer transition-colors hover:border-purple/30"
      >
        <ArrowLeft size={18} className="text-[#B8B2D1]" />
      </button>
      <h1 className="text-lg font-extrabold text-[#F5F3FF] tracking-tight">{title}</h1>
    </div>
  );
}
