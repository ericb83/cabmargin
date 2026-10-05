import { useState } from 'react';
import CalculatorForm from '../components/CalculatorForm';
import ResultsDisplay from '../components/ResultsDisplay';
import UpgradePrompt from '../components/UpgradePrompt';
import { calculateProfit, saveLoad } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { CalculateRequest, CalculateResponse } from '../types';

export default function Calculator() {
  const [results, setResults] = useState<CalculateResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const { isPremium } = useAuth();

  const handleCalculate = async (data: CalculateRequest) => {
    setIsCalculating(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      const result = await calculateProfit(data);
      setResults(result);
    } catch (err) {
      setError('Failed to calculate profit. Please check your inputs and try again.');
      console.error('Calculation error:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSave = async () => {
    if (!results) return;
    
    if (!isPremium) {
      setShowUpgradePrompt(true);
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      await saveLoad({
        loadRate: results.loadRate,
        distance: results.distance,
        deadheadMiles: results.deadheadMiles,
        fuelPricePerGallon: results.fuelPricePerGallon,
        milesPerGallon: results.milesPerGallon,
        tollsCost: results.tollsCost,
        maintenancePerMile: results.maintenancePerMile,
        insurancePerMile: results.insurancePerMile,
        truckPayment: results.truckPayment,
        trailerPayment: results.trailerPayment,
        dispatchFeePercent: results.dispatchFeePercent,
        factoringFeePercent: results.factoringFeePercent,
        otherExpenses: results.otherExpenses,
        calculatedProfit: results.netProfit,
        profitMargin: results.profitMargin,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { requiresUpgrade?: boolean } } };
      if (error.response?.status === 403 && error.response?.data?.requiresUpgrade) {
        setShowUpgradePrompt(true);
      } else {
        setError('Failed to save load. Please try again.');
      }
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight">
      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <UpgradePrompt 
          message="Upgrade to Premium to save unlimited loads and track your cab margin over time."
          onClose={() => setShowUpgradePrompt(false)} 
        />
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-profit-green/5 via-transparent to-accent-cyan/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-profit-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl text-cream mb-4 tracking-wide">
              CAB MARGIN CALCULATOR
            </h1>
            <p className="text-slate-light text-lg max-w-2xl mx-auto">
              Calculate your true profit per load by factoring in fuel costs, deadhead miles, 
              equipment payments, and all operating expenses.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {error && (
          <div className="mb-6 p-4 bg-loss-red/10 border border-loss-red/30 rounded-xl text-loss-red">
            {error}
          </div>
        )}
        
        {saveSuccess && (
          <div className="mb-6 p-4 bg-profit-green/10 border border-profit-green/30 rounded-xl text-profit-green">
            Load saved successfully!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <div>
            <CalculatorForm onCalculate={handleCalculate} isLoading={isCalculating} />
          </div>

          {/* Results */}
          <div>
            {results ? (
              <ResultsDisplay 
                results={results} 
                onSave={handleSave}
                isSaving={isSaving}
                onUpgradeNeeded={() => setShowUpgradePrompt(true)}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center py-16 px-8 bg-charcoal/30 rounded-2xl border border-slate-dark border-dashed">
                  <div className="w-20 h-20 mx-auto mb-6 bg-slate-dark/50 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🚛</span>
                  </div>
                  <h3 className="font-display text-xl text-silver mb-2">
                    READY TO CALCULATE
                  </h3>
                  <p className="text-slate-light">
                    Enter your load details and click calculate to see your profit breakdown
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
