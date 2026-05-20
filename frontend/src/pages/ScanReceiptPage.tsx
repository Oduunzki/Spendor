import { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, ArrowLeft, CheckCircle2, RotateCcw, Home } from 'lucide-react';
import { receiptsApi } from '../api/receipts';

type ScanState = 'idle' | 'scanning' | 'review' | 'saving' | 'done';

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

function formatNOK(amount: number) {
  return new Intl.NumberFormat('nb-NO').format(Math.round(amount)) + ' kr';
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

  // DONE STATE
  if (state === 'done') {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-green/20 border-2 border-green/50 flex items-center justify-center mb-6 shadow-green-glow">
          <CheckCircle2 size={40} className="text-green" />
        </div>
        <div className="bg-yellow/20 border border-yellow/40 rounded-full px-6 py-2 text-yellow font-bold text-xl mb-4 shadow-yellow-glow">
          +5 XP
        </div>
        <h2 className="text-2xl font-bold text-[#F9FAFB] mb-2">Kvittering lagret!</h2>
        <p className="text-[#6B7280] text-sm mb-8">Bra jobbet med å holde oversikten over forbruket ditt.</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={resetScan}
            className="w-full min-h-[52px] bg-card border border-border hover:border-green/40 text-[#F9FAFB] rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
          >
            <RotateCcw size={18} />
            Skann ny
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full min-h-[52px] bg-purple hover:bg-purple-dark text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-purple-glow"
          >
            <Home size={18} />
            Tilbake til hjem
          </button>
        </div>
      </div>
    );
  }

  // SCANNING STATE
  if (state === 'scanning') {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <div className="flex items-center gap-3 p-4 pt-6">
          <button
            onClick={resetScan}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-purple/40"
          >
            <ArrowLeft size={18} className="text-[#6B7280]" />
          </button>
          <h1 className="text-xl font-bold text-[#F9FAFB]">Analyserer...</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
          {imagePreview && (
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-border">
              <img src={imagePreview} alt="Kvittering" className="w-full object-cover max-h-64 opacity-50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg/60 backdrop-blur-sm">
                <div className="w-10 h-10 border-2 border-purple border-t-transparent rounded-full animate-spin" />
                <p className="text-[#F9FAFB] font-medium text-sm text-center px-4">
                  Claude analyserer kvitteringen...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // REVIEW STATE
  if (state === 'review' && parsedReceipt) {
    return (
      <div className="flex flex-col min-h-screen bg-bg">
        <div className="flex items-center gap-3 p-4 pt-6">
          <button
            onClick={resetScan}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-purple/40"
          >
            <ArrowLeft size={18} className="text-[#6B7280]" />
          </button>
          <h1 className="text-xl font-bold text-[#F9FAFB]">Bekreft kvittering</h1>
        </div>

        <div className="flex flex-col gap-4 p-4 pb-8">
          {imagePreview && (
            <img src={imagePreview} alt="Kvittering" className="w-full max-h-40 object-cover rounded-xl opacity-70 border border-border" />
          )}

          {/* Store name */}
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1.5 uppercase tracking-wide">Butikk</label>
            <input
              type="text"
              value={parsedReceipt.store_name}
              onChange={e => setParsedReceipt(prev => prev ? { ...prev, store_name: e.target.value } : null)}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:border-purple/50 focus:ring-1 focus:ring-purple/30 transition-all duration-200"
            />
          </div>

          {/* Date and amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5 uppercase tracking-wide">Dato</label>
              <input
                type="date"
                value={parsedReceipt.receipt_date}
                onChange={e => setParsedReceipt(prev => prev ? { ...prev, receipt_date: e.target.value } : null)}
                className="w-full bg-card border border-border rounded-xl px-3 py-3 text-[#F9FAFB] focus:outline-none focus:border-purple/50 focus:ring-1 focus:ring-purple/30 transition-all duration-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5 uppercase tracking-wide">Totalt (kr)</label>
              <input
                type="number"
                value={parsedReceipt.total_amount}
                onChange={e => setParsedReceipt(prev => prev ? { ...prev, total_amount: parseFloat(e.target.value) || 0 } : null)}
                className="w-full bg-card border border-border rounded-xl px-3 py-3 text-[#F9FAFB] focus:outline-none focus:border-purple/50 focus:ring-1 focus:ring-purple/30 transition-all duration-200 text-sm"
              />
            </div>
          </div>

          {/* Items list */}
          {parsedReceipt.items.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-2 uppercase tracking-wide">Varer</label>
              <div className="flex flex-col gap-2">
                {parsedReceipt.items.map((item, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-xl p-3 flex flex-col gap-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => updateItem(idx, 'description', e.target.value)}
                      placeholder="Varebeskrivelse"
                      className="bg-transparent border-b border-border pb-1 text-[#F9FAFB] text-sm focus:outline-none focus:border-purple/50 transition-all duration-200"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={item.amount}
                        onChange={e => updateItem(idx, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-24 bg-card-light border border-border rounded-lg px-2 py-1 text-[#F9FAFB] text-sm focus:outline-none focus:border-purple/50 transition-all duration-200"
                      />
                      <span className="text-[#6B7280] text-sm">kr</span>
                      <select
                        value={item.category}
                        onChange={e => updateItem(idx, 'category', e.target.value)}
                        className="flex-1 bg-card-light border border-border rounded-lg px-2 py-1 text-[#F9FAFB] text-sm focus:outline-none focus:border-purple/50 transition-all duration-200 cursor-pointer"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Planned toggle */}
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-2 uppercase tracking-wide">Var dette planlagt?</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setParsedReceipt(prev => prev ? { ...prev, planned: true } : null)}
                className={`flex-1 min-h-[44px] rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer border
                  ${parsedReceipt.planned
                    ? 'bg-green/20 border-green/50 text-green shadow-green-glow'
                    : 'bg-card border-border text-[#6B7280]'
                  }`}
              >
                Ja, planlagt
              </button>
              <button
                type="button"
                onClick={() => setParsedReceipt(prev => prev ? { ...prev, planned: false } : null)}
                className={`flex-1 min-h-[44px] rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer border
                  ${!parsedReceipt.planned
                    ? 'bg-red/20 border-red/50 text-red shadow-red-glow'
                    : 'bg-card border-border text-[#6B7280]'
                  }`}
              >
                Nei, impuls
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red text-sm bg-red/10 border border-red/20 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={isSaving}
            className="w-full min-h-[60px] bg-purple hover:bg-purple-dark text-white font-bold text-base rounded-xl transition-all duration-200 cursor-pointer shadow-purple-glow disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Lagrer...
              </span>
            ) : 'Bekreft og lagre'}
          </button>
        </div>
      </div>
    );
  }

  // IDLE STATE
  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <div className="flex items-center gap-3 p-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-purple/40"
        >
          <ArrowLeft size={18} className="text-[#6B7280]" />
        </button>
        <h1 className="text-xl font-bold text-[#F9FAFB]">Skann kvittering</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {/* Hidden file inputs */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Camera button */}
        <button
          onClick={() => cameraRef.current?.click()}
          className="w-40 h-40 rounded-3xl bg-card border-2 border-border hover:border-green/50 flex flex-col items-center justify-center gap-4 transition-all duration-200 cursor-pointer hover:shadow-green-glow group"
        >
          <Camera size={52} className="text-green group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
          <span className="text-[#F9FAFB] font-semibold text-base">Ta bilde</span>
        </button>

        <p className="text-[#6B7280] text-sm">eller</p>

        {/* Gallery button */}
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-3 bg-card border border-border hover:border-purple/40 rounded-xl px-6 py-4 min-h-[56px] text-[#F9FAFB] font-medium transition-all duration-200 cursor-pointer hover:shadow-purple-glow"
        >
          <Image size={20} className="text-purple" />
          Velg fil fra galleri
        </button>

        {error && (
          <p className="text-red text-sm bg-red/10 border border-red/20 rounded-lg px-3 py-2 w-full text-center">{error}</p>
        )}

        <p className="text-[#6B7280] text-xs text-center max-w-xs mt-4">
          Claude AI analyserer kvitteringen automatisk og henter ut butikk, dato, beløp og varer.
        </p>
      </div>
    </div>
  );
}
