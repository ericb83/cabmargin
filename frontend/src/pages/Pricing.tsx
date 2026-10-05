import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPricingInfo, createCheckoutSession, createBillingPortalSession, getApiErrorMessage } from '../services/api';
import type { PricingInfo } from '../types';

export default function Pricing() {
  const [pricing, setPricing] = useState<PricingInfo | null>(null);
  const [pending, setPending] = useState<'monthly' | 'annual' | 'portal' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isPremium } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const data = await getPricingInfo();
        setPricing(data);
      } catch (err) {
        console.error('Failed to fetch pricing:', err);
      }
    };
    fetchPricing();
  }, []);

  const handleSubscribe = async (interval: 'monthly' | 'annual') => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/pricing');
      return;
    }

    if (!pricing?.configured) {
      setError('Stripe is not configured yet. Add your test keys before subscribing.');
      return;
    }

    setPending(interval);
    setError(null);
    try {
      const priceId = interval === 'annual' ? pricing.annualPriceId : pricing.monthlyPriceId;
      const { checkoutUrl } = await createCheckoutSession(priceId);
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to start checkout. Please try again.'));
      setPending(null);
    }
  };

  const handleManageBilling = async () => {
    setPending('portal');
    setError(null);
    try {
      const { url } = await createBillingPortalSession();
      window.location.href = url;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to open billing. Please try again.'));
      setPending(null);
    }
  };

  const monthlyPrice = pricing?.monthlyPrice ?? 9.99;
  const annualPrice = pricing?.annualPrice ?? 79.99;
  const annualPerMonth = (annualPrice / 12).toFixed(2);
  const checkoutDisabled = pending !== null || pricing?.configured !== true;

  const features = {
    free: [
      { name: 'Cab Margin Calculator', included: true },
      { name: 'All expense inputs', included: true },
      { name: 'Real-time calculations', included: true },
      { name: 'Save loads to history', included: false },
      { name: 'View load history', included: false },
      { name: 'Weekly profit reports', included: false },
      { name: 'Monthly profit reports', included: false },
      { name: 'Export reports', included: false },
    ],
    premium: [
      { name: 'Cab Margin Calculator', included: true },
      { name: 'All expense inputs', included: true },
      { name: 'Real-time calculations', included: true },
      { name: 'Save unlimited loads', included: true },
      { name: 'Full load history', included: true },
      { name: 'Weekly profit reports', included: true },
      { name: 'Monthly profit reports', included: true },
      { name: 'Export reports (CSV/PDF)', included: true },
    ],
  };

  return (
    <div className="min-h-screen bg-midnight">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/10 via-transparent to-profit-green/10" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-violet/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="font-display text-5xl md:text-6xl text-cream tracking-wide mb-4">
              SIMPLE PRICING
            </h1>
            <p className="text-slate-light text-xl max-w-2xl mx-auto">
              Start free, then choose monthly or annual when you want the full history and reports
            </p>
          </div>

        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {error && (
          <div className="mb-6 p-4 bg-loss-red/10 border border-loss-red/30 rounded-xl text-loss-red text-sm">
            {error}
          </div>
        )}
        {pricing && !pricing.configured && (
          <div className="mb-6 p-4 bg-accent-violet/10 border border-accent-violet/30 rounded-xl text-cream text-sm">
            Billing keys are not set yet, so checkout stays disabled until Stripe test keys and price IDs are added.
          </div>
        )}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Free Plan */}
          <div className="bg-charcoal/50 rounded-2xl p-8 border border-slate-dark">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl text-cream mb-2">FREE</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-display text-5xl text-cream">$0</span>
                <span className="text-slate-light">/forever</span>
              </div>
              <p className="text-slate-light mt-4">
                Perfect for trying out the calculator
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  {feature.included ? (
                    <span className="w-6 h-6 bg-profit-green/20 rounded-full flex items-center justify-center text-profit-green text-sm">
                      ✓
                    </span>
                  ) : (
                    <span className="w-6 h-6 bg-slate-dark/50 rounded-full flex items-center justify-center text-slate-light text-sm">
                      ✕
                    </span>
                  )}
                  <span className={feature.included ? 'text-cream' : 'text-slate-light'}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-slate-dark hover:bg-slate-light/20 text-cream font-medium rounded-xl transition-colors"
            >
              Get Started Free
            </button>
          </div>

          {/* Monthly Premium */}
          <div className="bg-charcoal/50 rounded-2xl p-8 border border-accent-cyan/40">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl text-cream mb-2">MONTHLY</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-display text-5xl text-cream">${monthlyPrice.toFixed(2)}</span>
                <span className="text-slate-light">/month</span>
              </div>
              <p className="text-slate-light mt-4">
                Premium, billed every month
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.premium.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-profit-green/20 rounded-full flex items-center justify-center text-profit-green text-sm">
                    ✓
                  </span>
                  <span className="text-cream">{feature.name}</span>
                </li>
              ))}
            </ul>

            {isPremium ? (
              <button
                onClick={handleManageBilling}
                disabled={pending !== null}
                className="w-full py-3 bg-slate-dark hover:bg-slate-light/20 text-cream font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {pending === 'portal' ? 'Loading...' : 'Manage Billing'}
              </button>
            ) : (
              <button
                onClick={() => handleSubscribe('monthly')}
                disabled={checkoutDisabled}
                className="w-full py-3 bg-accent-cyan hover:bg-accent-cyan/80 text-midnight font-display text-lg tracking-wide rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                {pending === 'monthly' ? 'Loading...' : 'Subscribe Monthly'}
              </button>
            )}
          </div>

          {/* Annual Premium */}
          <div className="bg-gradient-to-br from-accent-violet/20 to-profit-green/20 rounded-2xl p-8 border-2 border-accent-violet/50 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-accent-violet text-cream text-sm font-medium px-4 py-1 rounded-full">
                MOST POPULAR
              </span>
            </div>

            <div className="text-center mb-8">
              <h3 className="font-display text-2xl text-cream mb-2">ANNUAL</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-display text-5xl text-cream">${annualPerMonth}</span>
                <span className="text-slate-light">/month</span>
              </div>
              <p className="text-profit-green text-sm mt-1">
                Billed annually at ${annualPrice.toFixed(2)}/year
              </p>
              <p className="text-slate-light mt-4">
                Save 33% compared with monthly
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.premium.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-profit-green/20 rounded-full flex items-center justify-center text-profit-green text-sm">
                    ✓
                  </span>
                  <span className="text-cream">{feature.name}</span>
                </li>
              ))}
            </ul>

            {isPremium ? (
              <button
                onClick={handleManageBilling}
                disabled={pending !== null}
                className="w-full py-3 bg-gradient-to-r from-accent-violet to-profit-green hover:from-accent-violet/80 hover:to-profit-green-light text-cream font-display text-lg tracking-wide rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                {pending === 'portal' ? 'Loading...' : 'Manage Billing'}
              </button>
            ) : (
              <button
                onClick={() => handleSubscribe('annual')}
                disabled={checkoutDisabled}
                className="w-full py-3 bg-gradient-to-r from-accent-violet to-profit-green hover:from-accent-violet/80 hover:to-profit-green-light text-cream font-display text-lg tracking-wide rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                {pending === 'annual' ? 'Loading...' : 'Subscribe Annually'}
              </button>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="font-display text-3xl text-cream text-center mb-10">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-charcoal/30 rounded-xl p-6 border border-slate-dark">
              <h4 className="text-cream font-medium mb-2">Can I cancel anytime?</h4>
              <p className="text-slate-light">
                Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="bg-charcoal/30 rounded-xl p-6 border border-slate-dark">
              <h4 className="text-cream font-medium mb-2">What payment methods do you accept?</h4>
              <p className="text-slate-light">
                We accept all major credit cards through Stripe, including Visa, Mastercard, and American Express.
              </p>
            </div>
            <div className="bg-charcoal/30 rounded-xl p-6 border border-slate-dark">
              <h4 className="text-cream font-medium mb-2">Is my data secure?</h4>
              <p className="text-slate-light">
                Absolutely. We use industry-standard encryption and never share your data with third parties.
              </p>
            </div>
            <div className="bg-charcoal/30 rounded-xl p-6 border border-slate-dark">
              <h4 className="text-cream font-medium mb-2">Do you offer refunds?</h4>
              <p className="text-slate-light">
                We offer a 7-day money-back guarantee. If you're not satisfied, contact us for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


