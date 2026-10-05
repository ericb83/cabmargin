import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { confirmCheckout, getApiErrorMessage } from '../services/api';

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { refreshSubscription } = useAuth();
  const [status, setStatus] = useState<'working' | 'ready' | 'error'>('working');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const finishCheckout = async () => {
      try {
        if (sessionId) {
          await confirmCheckout(sessionId);
        }
        await refreshSubscription();
        if (!cancelled) setStatus('ready');
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'We could not confirm your subscription yet.'));
          setStatus('error');
        }
      }
    };

    finishCheckout();

    return () => {
      cancelled = true;
    };
  }, [refreshSubscription, sessionId]);

  useEffect(() => {
    if (status !== 'ready') return;
    const timer = setTimeout(() => navigate('/'), 4000);
    return () => clearTimeout(timer);
  }, [navigate, status]);

  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-profit-green/10 via-transparent to-accent-cyan/10" />

      <div className="relative text-center">
        <div className="w-24 h-24 mx-auto mb-8 bg-profit-green/20 rounded-full flex items-center justify-center">
          <span className="text-5xl">{status === 'error' ? '!' : '🎉'}</span>
        </div>

        <h1 className="font-display text-4xl md:text-5xl text-cream mb-4">
          {status === 'working' && 'ACTIVATING PREMIUM'}
          {status === 'ready' && 'WELCOME TO PREMIUM!'}
          {status === 'error' && 'CHECKOUT NEEDS A LOOK'}
        </h1>

        <p className="text-slate-light text-lg max-w-md mx-auto mb-8">
          {status === 'working' && 'Confirming your Stripe checkout and unlocking Premium features.'}
          {status === 'ready' && 'Your subscription is now active. You can save unlimited loads and access all premium features.'}
          {status === 'error' && (error || 'Stripe did not confirm this checkout.')}
        </p>

        <div className="space-y-4">
          {status === 'ready' && (
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-gradient-to-r from-profit-green to-accent-cyan text-midnight font-display text-lg rounded-xl hover:from-profit-green-light hover:to-accent-cyan transition-all"
            >
              START CALCULATING
            </button>
          )}

          {status === 'error' && (
            <button
              onClick={() => navigate('/pricing')}
              className="px-8 py-3 bg-gradient-to-r from-accent-violet to-profit-green text-cream font-display text-lg rounded-xl"
            >
              BACK TO PRICING
            </button>
          )}

          {status === 'ready' && (
            <p className="text-slate-light text-sm">
              Redirecting automatically in a few seconds...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
