import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await login(email, password);
      authLogin({
        email: response.email,
        userId: response.userId,
        token: response.token,
        subscriptionTier: response.subscriptionTier,
        isPremium: response.isPremium,
      });
      
      // Redirect to the page they were trying to access, or home
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
    } catch (err: unknown) {
      const error = err as { response?: { data?: string } };
      setError(error.response?.data || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full bg-charcoal border border-slate-dark rounded-lg px-4 py-3 text-cream placeholder-slate-light focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors";

  return (
    <div className="relative min-h-screen bg-midnight flex items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-profit-green/5 via-transparent to-accent-violet/5" />
      <div className="pointer-events-none absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl" />
      
      <div className="relative w-full max-w-md">
        <div className="bg-charcoal/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-dark shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-profit-green to-accent-cyan rounded-xl flex items-center justify-center">
              <span className="text-midnight font-bold text-2xl">CM</span>
            </div>
            <h1 className="font-display text-3xl text-cream tracking-wide">WELCOME BACK</h1>
            <p className="text-slate-light mt-2">Sign in to access your load history</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-loss-red/10 border border-loss-red/30 rounded-xl text-loss-red text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-silver text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-silver text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-profit-green to-accent-cyan hover:from-profit-green-light hover:to-accent-cyan text-midnight font-display text-lg tracking-wide rounded-xl transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-light">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-cyan hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
