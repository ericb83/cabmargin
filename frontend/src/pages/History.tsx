import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoads, deleteLoad } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Load } from '../types';

export default function History() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchLoads();
  }, [isAuthenticated, navigate]);

  const fetchLoads = async () => {
    try {
      const data = await getLoads();
      setLoads(data);
    } catch (err) {
      setError('Failed to load history');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this load?')) return;
    
    setDeletingId(id);
    try {
      await deleteLoad(id);
      setLoads(loads.filter(load => load.id !== id));
    } catch (err) {
      setError('Failed to delete load');
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-light">Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/5 via-transparent to-accent-cyan/5" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-cream tracking-wide">LOAD HISTORY</h1>
          <p className="text-slate-light mt-2">View and manage your saved load calculations</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-loss-red/10 border border-loss-red/30 rounded-xl text-loss-red">
            {error}
          </div>
        )}

        {loads.length === 0 ? (
          <div className="text-center py-16 bg-charcoal/30 rounded-2xl border border-slate-dark border-dashed">
            <div className="w-20 h-20 mx-auto mb-6 bg-slate-dark/50 rounded-full flex items-center justify-center">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="font-display text-xl text-silver mb-2">NO SAVED LOADS</h3>
            <p className="text-slate-light mb-6">
              Calculate a load and save it to see it here
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-accent-cyan hover:bg-accent-cyan/80 text-midnight font-medium rounded-xl transition-colors"
            >
              Go to Calculator
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {loads.map((load) => (
              <div
                key={load.id}
                className="bg-charcoal/50 rounded-xl p-6 border border-slate-dark hover:border-slate-light/30 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-slate-light text-xs uppercase">Load Rate</p>
                      <p className="text-cream font-semibold text-lg">
                        {formatCurrency(load.loadRate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-light text-xs uppercase">Distance</p>
                      <p className="text-cream font-semibold text-lg">
                        {load.distance} mi
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-light text-xs uppercase">Net Profit</p>
                      <p className={`font-semibold text-lg ${
                        load.calculatedProfit >= 0 ? 'text-profit-green' : 'text-loss-red'
                      }`}>
                        {formatCurrency(load.calculatedProfit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-light text-xs uppercase">Margin</p>
                      <p className={`font-semibold text-lg ${
                        load.profitMargin >= 0 ? 'text-profit-green-light' : 'text-loss-red-light'
                      }`}>
                        {load.profitMargin.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-slate-light text-sm">
                      {formatDate(load.createdAt)}
                    </span>
                    <button
                      onClick={() => handleDelete(load.id)}
                      disabled={deletingId === load.id}
                      className="px-4 py-2 bg-loss-red/20 hover:bg-loss-red/30 text-loss-red rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === load.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                <div className="mt-4 pt-4 border-t border-slate-dark/50 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-slate-light text-xs">Deadhead</p>
                    <p className="text-silver">{load.deadheadMiles} mi</p>
                  </div>
                  <div>
                    <p className="text-slate-light text-xs">Fuel Price</p>
                    <p className="text-silver">${load.fuelPricePerGallon.toFixed(2)}/gal</p>
                  </div>
                  <div>
                    <p className="text-slate-light text-xs">MPG</p>
                    <p className="text-silver">{load.milesPerGallon}</p>
                  </div>
                  <div>
                    <p className="text-slate-light text-xs">Tolls</p>
                    <p className="text-silver">{formatCurrency(load.tollsCost)}</p>
                  </div>
                  <div>
                    <p className="text-slate-light text-xs">Other</p>
                    <p className="text-silver">{formatCurrency(load.otherExpenses)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {loads.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-charcoal/50 rounded-xl p-6 border border-slate-dark">
              <p className="text-slate-light text-sm uppercase">Total Loads</p>
              <p className="font-display text-3xl text-cream mt-1">{loads.length}</p>
            </div>
            <div className="bg-charcoal/50 rounded-xl p-6 border border-slate-dark">
              <p className="text-slate-light text-sm uppercase">Total Revenue</p>
              <p className="font-display text-3xl text-profit-green mt-1">
                {formatCurrency(loads.reduce((sum, l) => sum + l.loadRate, 0))}
              </p>
            </div>
            <div className="bg-charcoal/50 rounded-xl p-6 border border-slate-dark">
              <p className="text-slate-light text-sm uppercase">Total Profit</p>
              <p className={`font-display text-3xl mt-1 ${
                loads.reduce((sum, l) => sum + l.calculatedProfit, 0) >= 0 
                  ? 'text-profit-green' 
                  : 'text-loss-red'
              }`}>
                {formatCurrency(loads.reduce((sum, l) => sum + l.calculatedProfit, 0))}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

