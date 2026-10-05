import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await register(email, password);
      authLogin({
        email: response.email,
        userId: response.userId,
        token: response.token,
        subscriptionTier: response.subscriptionTier,
        isPremium: response.isPremium,
      });
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: string | string[] } };
      if (Array.isArray(error.response?.data)) {
        setError(error.response.data.join(', '));
      } else {
        setError(error.response?.data || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full bg-charcoal border border-slate-dark rounded-lg px-4 py-3 text-cream placeholder-slate-light focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors";

  return (
    <div className="relative min-h-screen bg-midnight flex items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-violet/5 via-transparent to-profit-green/5" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-violet/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="bg-charcoal/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-dark shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-accent-violet to-profit-green rounded-xl flex items-center justify-center">
              <span className="text-cream font-bold text-2xl">CM</span>
            </div>
            <h1 className="font-display text-3xl text-cream tracking-wide">CREATE ACCOUNT</h1>
            <p className="text-slate-light mt-2">Start tracking your cab margin</p>
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
                minLength={6}
              />
              <p className="text-slate-light text-xs mt-1">
                Must be at least 6 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label className="block text-silver text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClasses}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-accent-violet to-profit-green hover:from-accent-violet/80 hover:to-profit-green-light text-cream font-display text-lg tracking-wide rounded-xl transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-light">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-cyan hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
