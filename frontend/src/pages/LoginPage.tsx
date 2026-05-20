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
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-purple/20 border border-purple/30 flex items-center justify-center mb-4 shadow-purple-glow">
            <ShieldCheck size={32} className="text-purple" />
          </div>
          <h1 className="text-2xl font-bold text-[#F9FAFB]">ImpulseGuard</h1>
          <p className="text-[#6B7280] text-sm mt-1">Kontroller impulskjøp. Spar mer.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#F9FAFB] mb-1.5">E-post</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="deg@eksempel.no"
              required
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:border-purple/50 focus:ring-1 focus:ring-purple/30 transition-all duration-200"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#F9FAFB] mb-1.5">Passord</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              required
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:border-purple/50 focus:ring-1 focus:ring-purple/30 transition-all duration-200"
            />
          </div>

          {error && <p className="text-red text-sm bg-red/10 border border-red/20 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple hover:bg-purple-dark text-white font-semibold py-3.5 rounded-xl transition-all duration-200 cursor-pointer min-h-[52px] shadow-purple-glow disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Logger inn...
              </span>
            ) : 'Logg inn'}
          </button>
        </form>

        <p className="text-center text-[#6B7280] text-sm mt-6">
          Ingen konto?{' '}
          <Link to="/register" className="text-purple hover:text-purple-dark font-medium transition-colors cursor-pointer">
            Registrer deg
          </Link>
        </p>
      </div>
    </div>
  );
}
