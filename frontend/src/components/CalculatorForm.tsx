import { useState } from 'react';
import type { CalculateRequest } from '../types';

interface CalculatorFormProps {
  onCalculate: (data: CalculateRequest) => void;
  isLoading: boolean;
}

export default function CalculatorForm({ onCalculate, isLoading }: CalculatorFormProps) {
  const [formData, setFormData] = useState<CalculateRequest>({
    loadRate: 2500,
    distance: 500,
    deadheadMiles: 50,
    fuelPricePerGallon: 3.50,
    milesPerGallon: 6.5,
    tollsCost: 75,
    maintenancePerMile: 0.15,
    insurancePerMile: 0.08,
    truckPayment: 0,
    trailerPayment: 0,
    dispatchFeePercent: 0,
    factoringFeePercent: 0,
    otherExpenses: 50,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(formData);
  };

  const inputClasses = "w-full bg-charcoal border border-slate-dark rounded-lg px-4 py-3 text-cream placeholder-slate-light focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors";
  const labelClasses = "block text-silver text-sm font-medium mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Load Details Section */}
      <div className="bg-charcoal/50 rounded-2xl p-6 border border-slate-dark">
        <h3 className="font-display text-xl text-cream mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-accent-cyan/20 rounded-lg flex items-center justify-center text-accent-cyan">
            📦
          </span>
          LOAD DETAILS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelClasses}>Load Rate ($)</label>
            <input
              type="number"
              name="loadRate"
              value={formData.loadRate}
              onChange={handleChange}
              className={inputClasses}
              step="0.01"
              min="0"
              required
            />
          </div>
          <div>
            <label className={labelClasses}>Distance (miles)</label>
            <input
              type="number"
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              className={inputClasses}
              step="0.1"
              min="0.1"
              required
            />
          </div>
          <div>
            <label className={labelClasses}>Deadhead Miles</label>
            <input
              type="number"
              name="deadheadMiles"
              value={formData.deadheadMiles}
              onChange={handleChange}
              className={inputClasses}
              step="0.1"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Fuel Section */}
      <div className="bg-charcoal/50 rounded-2xl p-6 border border-slate-dark">
        <h3 className="font-display text-xl text-cream mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-warning-amber/20 rounded-lg flex items-center justify-center text-warning-amber">
            ⛽
          </span>
          FUEL COSTS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClasses}>Fuel Price ($/gallon)</label>
            <input
              type="number"
              name="fuelPricePerGallon"
              value={formData.fuelPricePerGallon}
              onChange={handleChange}
              className={inputClasses}
              step="0.001"
              min="0"
              required
            />
          </div>
          <div>
            <label className={labelClasses}>Miles Per Gallon (MPG)</label>
            <input
              type="number"
              name="milesPerGallon"
              value={formData.milesPerGallon}
              onChange={handleChange}
              className={inputClasses}
              step="0.1"
              min="0.1"
              required
            />
          </div>
        </div>
      </div>

      {/* Fixed Payments Section */}
      <div className="bg-charcoal/50 rounded-2xl p-6 border border-slate-dark">
        <h3 className="font-display text-xl text-cream mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-loss-red/20 rounded-lg flex items-center justify-center text-loss-red">
            🚛
          </span>
          EQUIPMENT PAYMENTS (per load)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClasses}>Truck Payment ($)</label>
            <input
              type="number"
              name="truckPayment"
              value={formData.truckPayment}
              onChange={handleChange}
              className={inputClasses}
              step="0.01"
              min="0"
            />
            <p className="text-slate-light text-xs mt-1">Portion of monthly payment allocated to this load</p>
          </div>
          <div>
            <label className={labelClasses}>Trailer Payment ($)</label>
            <input
              type="number"
              name="trailerPayment"
              value={formData.trailerPayment}
              onChange={handleChange}
              className={inputClasses}
              step="0.01"
              min="0"
            />
            <p className="text-slate-light text-xs mt-1">Portion of monthly payment allocated to this load</p>
          </div>
        </div>
      </div>

      {/* Fees Section */}
      <div className="bg-charcoal/50 rounded-2xl p-6 border border-slate-dark">
        <h3 className="font-display text-xl text-cream mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-accent-violet/20 rounded-lg flex items-center justify-center text-accent-violet">
            📋
          </span>
          FEES & SERVICES
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClasses}>Dispatch Fee (%)</label>
            <input
              type="number"
              name="dispatchFeePercent"
              value={formData.dispatchFeePercent}
              onChange={handleChange}
              className={inputClasses}
              step="0.1"
              min="0"
              max="100"
            />
            <p className="text-slate-light text-xs mt-1">Percentage of load rate paid to dispatcher</p>
          </div>
          <div>
            <label className={labelClasses}>Factoring Fee (%)</label>
            <input
              type="number"
              name="factoringFeePercent"
              value={formData.factoringFeePercent}
              onChange={handleChange}
              className={inputClasses}
              step="0.1"
              min="0"
              max="100"
            />
            <p className="text-slate-light text-xs mt-1">Percentage paid to factoring company</p>
          </div>
        </div>
      </div>

      {/* Operating Expenses Section */}
      <div className="bg-charcoal/50 rounded-2xl p-6 border border-slate-dark">
        <h3 className="font-display text-xl text-cream mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-profit-green/20 rounded-lg flex items-center justify-center text-profit-green">
            💰
          </span>
          OPERATING EXPENSES
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className={labelClasses}>Tolls ($)</label>
            <input
              type="number"
              name="tollsCost"
              value={formData.tollsCost}
              onChange={handleChange}
              className={inputClasses}
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className={labelClasses}>Maintenance ($/mile)</label>
            <input
              type="number"
              name="maintenancePerMile"
              value={formData.maintenancePerMile}
              onChange={handleChange}
              className={inputClasses}
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className={labelClasses}>Insurance ($/mile)</label>
            <input
              type="number"
              name="insurancePerMile"
              value={formData.insurancePerMile}
              onChange={handleChange}
              className={inputClasses}
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className={labelClasses}>Other Expenses ($)</label>
            <input
              type="number"
              name="otherExpenses"
              value={formData.otherExpenses}
              onChange={handleChange}
              className={inputClasses}
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-gradient-to-r from-profit-green to-accent-cyan hover:from-profit-green-light hover:to-accent-cyan text-midnight font-display text-xl tracking-wide rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-profit-green/20 hover:shadow-profit-green/40"
      >
        {isLoading ? 'CALCULATING...' : 'CALCULATE PROFIT'}
      </button>
    </form>
  );
}
