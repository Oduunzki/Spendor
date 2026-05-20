// Spendor — LoginPage

import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Innlogging mislyktes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-card border border-green/25 flex items-center justify-center mb-4 text-green">
            <ShieldCheck size={28} strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#F5F3FF] tracking-tight">Spendor</h1>
          <p className="text-[#6E6889] text-xs mt-1.5">Gamifisert sparing for impulskontroll</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field
            id="email" type="email" label="E-post"
            placeholder="deg@eksempel.no" required
            value={email} onChange={setEmail}
          />
          <Field
            id="password" type="password" label="Passord"
            placeholder="••••••" required
            value={password} onChange={setPassword}
          />

          {error && <p className="text-red text-sm bg-red/10 border border-red/20 rounded-xl px-3 py-2 font-semibold">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green hover:bg-green-dark text-[#0E2A18] font-extrabold py-3.5 rounded-2xl transition-colors cursor-pointer min-h-[52px] disabled:opacity-50 disabled:cursor-not-allowed mt-2 tracking-tight"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-[#0E2A18]/30 border-t-[#0E2A18] rounded-full animate-spin" />
                Logger inn...
              </span>
            ) : 'Logg inn'}
          </button>
        </form>

        <p className="text-center text-[#6E6889] text-xs mt-6">
          Ingen konto?{' '}
          <Link to="/register" className="text-green font-bold hover:underline transition-colors cursor-pointer">
            Registrer deg
          </Link>
        </p>
      </div>
    </div>
  );
}

interface FieldProps {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}
function Field({ id, type, label, placeholder, required, value, onChange }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-[#B8B2D1] mb-1.5 tracking-tight">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-[#F5F3FF] placeholder-[#4A4560] focus:outline-none focus:border-green/30 transition-colors font-semibold"
      />
    </div>
  );
}
