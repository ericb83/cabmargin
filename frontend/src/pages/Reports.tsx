import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getWeeklyReport, getMonthlyReport } from '../services/api';
import type { Report } from '../types';

export default function Reports() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isPremium } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isPremium) {
      navigate('/pricing');
      return;
    }

    fetchReport();
  }, [isAuthenticated, isPremium, period, navigate]);

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = period === 'weekly' 
        ? await getWeeklyReport() 
        : await getMonthlyReport();
      setReport(data);
    } catch (err) {
      setError('Failed to load report');
      console.error('Report error:', err);
    } finally {
      setIsLoading(false);
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
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-light">Loading report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/5 via-transparent to-profit-green/5" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl text-cream tracking-wide">PROFIT REPORTS</h1>
            <p className="text-slate-light mt-2">Track your cab margin over time</p>
          </div>
          
          {/* Period Toggle */}
          <div className="flex bg-charcoal rounded-xl p-1">
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                period === 'weekly'
                  ? 'bg-accent-violet text-cream'
                  : 'text-slate-light hover:text-cream'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                period === 'monthly'
                  ? 'bg-accent-violet text-cream'
                  : 'text-slate-light hover:text-cream'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-loss-red/10 border border-loss-red/30 rounded-xl text-loss-red">
            {error}
          </div>
        )}

        {report && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-charcoal/50 rounded-xl p-6 border border-slate-dark">
                <p className="text-slate-light text-sm uppercase">Total Loads</p>
                <p className="font-display text-3xl text-cream mt-1">{report.totalLoads}</p>
              </div>
              
              <div className="bg-charcoal/50 rounded-xl p-6 border border-slate-dark">
                <p className="text-slate-light text-sm uppercase">Total Revenue</p>
                <p className="font-display text-3xl text-profit-green mt-1">
                  {formatCurrency(report.totalRevenue)}
                </p>
              </div>
              
              <div className="bg-charcoal/50 rounded-xl p-6 border border-slate-dark">
                <p className="text-slate-light text-sm uppercase">Total Profit</p>
                <p className={`font-display text-3xl mt-1 ${
                  report.totalProfit >= 0 ? 'text-profit-green' : 'text-loss-red'
                }`}>
                  {formatCurrency(report.totalProfit)}
                </p>
              </div>
              
              <div className="bg-charcoal/50 rounded-xl p-6 border border-slate-dark">
                <p className="text-slate-light text-sm uppercase">Avg. Margin</p>
                <p className={`font-display text-3xl mt-1 ${
                  report.averageProfitMargin >= 0 ? 'text-profit-green-light' : 'text-loss-red-light'
                }`}>
                  {report.averageProfitMargin.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Profit Breakdown */}
              <div className="bg-charcoal/50 rounded-xl p-6 border border-slate-dark">
                <h3 className="font-display text-xl text-cream mb-6">PROFIT BREAKDOWN</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-dark/50">
                    <span className="text-silver">Total Revenue</span>
                    <span className="text-profit-green font-medium">{formatCurrency(report.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-dark/50">
                    <span className="text-silver">Total Costs</span>
                    <span className="text-loss-red font-medium">{formatCurrency(report.totalCosts)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-dark/50">
                    <span className="text-silver">Net Profit</span>
                    <span className={`font-medium ${report.totalProfit >= 0 ? 'text-profit-green' : 'text-loss-red'}`}>
                      {formatCurrency(report.totalProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-silver">Avg. Profit per Load</span>
                    <span className="text-cream font-medium">{formatCurrency(report.averageProfitPerLoad)}</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-charcoal/50 rounded-xl p-6 border border-slate-dark">
                <h3 className="font-display text-xl text-cream mb-6">PERFORMANCE METRICS</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-dark/50">
                    <span className="text-silver">Total Miles</span>
                    <span className="text-cream font-medium">{report.totalMiles.toLocaleString()} mi</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-dark/50">
                    <span className="text-silver">Avg. Rate per Mile</span>
                    <span className="text-accent-cyan font-medium">{formatCurrency(report.averageRatePerMile)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-dark/50">
                    <span className="text-silver">Profit Margin</span>
                    <span className={`font-medium ${report.averageProfitMargin >= 0 ? 'text-profit-green' : 'text-loss-red'}`}>
                      {report.averageProfitMargin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-silver">Report Period</span>
                    <span className="text-cream font-medium">
                      {formatDate(report.startDate)} - {formatDate(report.endDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Chart */}
            <div className="bg-charcoal/50 rounded-xl p-6 border border-slate-dark">
              <h3 className="font-display text-xl text-cream mb-6">DAILY PROFIT TREND</h3>
              
              {report.totalLoads === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-light">No loads recorded in this period</p>
                  <p className="text-silver text-sm mt-2">Start saving loads to see your profit trends</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Simple bar chart */}
                  <div className="flex items-end gap-1 h-48">
                    {report.dailyBreakdown.map((day, index) => {
                      const maxProfit = Math.max(...report.dailyBreakdown.map(d => Math.abs(d.profit)), 1);
                      const height = Math.abs(day.profit) / maxProfit * 100;
                      const isPositive = day.profit >= 0;
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                          <div 
                            className={`w-full rounded-t transition-all ${
                              day.loadCount === 0 
                                ? 'bg-slate-dark/30' 
                                : isPositive 
                                  ? 'bg-profit-green' 
                                  : 'bg-loss-red'
                            }`}
                            style={{ height: `${Math.max(height, 2)}%` }}
                            title={`${formatDate(day.date)}: ${formatCurrency(day.profit)}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* X-axis labels */}
                  <div className="flex gap-1">
                    {report.dailyBreakdown.map((day, index) => (
                      <div key={index} className="flex-1 text-center">
                        <span className="text-slate-light text-xs">
                          {new Date(day.date).getDate()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Legend */}
              <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-slate-dark/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-profit-green rounded" />
                  <span className="text-slate-light text-sm">Profit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-loss-red rounded" />
                  <span className="text-slate-light text-sm">Loss</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-dark/30 rounded" />
                  <span className="text-slate-light text-sm">No Data</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


