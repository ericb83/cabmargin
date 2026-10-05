import { Link } from 'react-router-dom';
import type { CalculateResponse } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ResultsDisplayProps {
  results: CalculateResponse;
  onSave: () => void;
  isSaving: boolean;
  onUpgradeNeeded?: () => void;
}

export default function ResultsDisplay({ results, onSave, isSaving, onUpgradeNeeded }: ResultsDisplayProps) {
  const { isAuthenticated, isPremium } = useAuth();
  const isProfitable = results.netProfit > 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleSaveClick = () => {
    if (!isPremium && onUpgradeNeeded) {
      onUpgradeNeeded();
    } else {
      onSave();
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Profit Card */}
      <div className={`rounded-2xl p-8 border-2 ${
        isProfitable 
          ? 'bg-gradient-to-br from-profit-green/10 to-profit-green/5 border-profit-green/30' 
          : 'bg-gradient-to-br from-loss-red/10 to-loss-red/5 border-loss-red/30'
      }`}>
        <div className="text-center">
          <p className="text-silver text-sm uppercase tracking-wider mb-2">Net Profit</p>
          <p className={`font-display text-5xl md:text-6xl ${
            isProfitable ? 'text-profit-green' : 'text-loss-red'
          }`}>
            {formatCurrency(results.netProfit)}
          </p>
          <div className="mt-4 flex justify-center gap-8">
            <div>
              <p className="text-slate-light text-xs uppercase">Margin</p>
              <p className={`text-xl font-semibold ${
                isProfitable ? 'text-profit-green-light' : 'text-loss-red-light'
              }`}>
                {formatPercent(results.profitMargin)}
              </p>
            </div>
            <div>
              <p className="text-slate-light text-xs uppercase">Rate/Mile</p>
              <p className="text-xl font-semibold text-accent-cyan">
                {formatCurrency(results.ratePerMile)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revenue */}
        <div className="bg-charcoal/50 rounded-xl p-5 border border-slate-dark">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 bg-profit-green/20 rounded-lg flex items-center justify-center text-profit-green text-lg">
              📈
            </span>
            <h4 className="font-display text-lg text-cream">REVENUE</h4>
          </div>
          <p className="text-3xl font-semibold text-profit-green">
            {formatCurrency(results.loadRate)}
          </p>
          <p className="text-slate-light text-sm mt-1">
            {results.distance} loaded miles
          </p>
        </div>

        {/* Total Costs */}
        <div className="bg-charcoal/50 rounded-xl p-5 border border-slate-dark">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 bg-loss-red/20 rounded-lg flex items-center justify-center text-loss-red text-lg">
              📉
            </span>
            <h4 className="font-display text-lg text-cream">TOTAL COSTS</h4>
          </div>
          <p className="text-3xl font-semibold text-loss-red">
            {formatCurrency(results.totalCosts)}
          </p>
          <p className="text-slate-light text-sm mt-1">
            {results.totalMiles} total miles
          </p>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-charcoal/50 rounded-xl p-5 border border-slate-dark">
        <h4 className="font-display text-lg text-cream mb-4">COST BREAKDOWN</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-slate-dark/50">
            <span className="text-silver flex items-center gap-2">
              <span className="text-warning-amber">⛽</span> Fuel Cost
            </span>
            <span className="text-cream font-medium">{formatCurrency(results.fuelCost)}</span>
          </div>
          
          {results.truckPayment > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-slate-dark/50">
              <span className="text-silver flex items-center gap-2">
                <span className="text-loss-red">🚛</span> Truck Payment
              </span>
              <span className="text-cream font-medium">{formatCurrency(results.truckPayment)}</span>
            </div>
          )}
          
          {results.trailerPayment > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-slate-dark/50">
              <span className="text-silver flex items-center gap-2">
                <span className="text-loss-red">📦</span> Trailer Payment
              </span>
              <span className="text-cream font-medium">{formatCurrency(results.trailerPayment)}</span>
            </div>
          )}
          
          {results.dispatchFeeCost > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-slate-dark/50">
              <span className="text-silver flex items-center gap-2">
                <span className="text-accent-violet">📋</span> Dispatch Fee ({results.dispatchFeePercent}%)
              </span>
              <span className="text-cream font-medium">{formatCurrency(results.dispatchFeeCost)}</span>
            </div>
          )}
          
          {results.factoringFeeCost > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-slate-dark/50">
              <span className="text-silver flex items-center gap-2">
                <span className="text-accent-violet">💳</span> Factoring Fee ({results.factoringFeePercent}%)
              </span>
              <span className="text-cream font-medium">{formatCurrency(results.factoringFeeCost)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center py-2 border-b border-slate-dark/50">
            <span className="text-silver flex items-center gap-2">
              <span className="text-accent-cyan">🛣️</span> Tolls
            </span>
            <span className="text-cream font-medium">{formatCurrency(results.tollsCost)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-slate-dark/50">
            <span className="text-silver flex items-center gap-2">
              <span className="text-accent-cyan">🔧</span> Maintenance
            </span>
            <span className="text-cream font-medium">
              {formatCurrency(results.totalMiles * results.maintenancePerMile)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-slate-dark/50">
            <span className="text-silver flex items-center gap-2">
              <span className="text-profit-green">🛡️</span> Insurance
            </span>
            <span className="text-cream font-medium">
              {formatCurrency(results.totalMiles * results.insurancePerMile)}
            </span>
          </div>
          
          {results.otherExpenses > 0 && (
            <div className="flex justify-between items-center py-2">
              <span className="text-silver flex items-center gap-2">
                <span className="text-slate-light">📋</span> Other Expenses
              </span>
              <span className="text-cream font-medium">{formatCurrency(results.otherExpenses)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      {isAuthenticated ? (
        isPremium ? (
          <button
            onClick={onSave}
            disabled={isSaving}
            className="w-full py-3 bg-accent-violet hover:bg-accent-violet/80 text-cream font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save to History'}
          </button>
        ) : (
          <button
            onClick={handleSaveClick}
            className="w-full py-3 bg-gradient-to-r from-accent-violet to-profit-green text-cream font-medium rounded-xl hover:from-accent-violet/80 hover:to-profit-green-light transition-all"
          >
            ⭐ Upgrade to Save Loads
          </button>
        )
      ) : (
        <div className="text-center py-4 bg-charcoal/30 rounded-xl border border-slate-dark">
          <p className="text-slate-light">
            <Link to="/login" className="text-accent-cyan hover:underline">Sign in</Link> to save calculations to your history
          </p>
        </div>
      )}
    </div>
  );
}
