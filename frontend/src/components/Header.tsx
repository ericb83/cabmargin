import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout, isAuthenticated, isPremium } = useAuth();

  return (
    <header className="relative z-20 bg-charcoal border-b border-slate-dark">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-profit-green to-accent-cyan rounded-lg flex items-center justify-center">
              <span className="text-midnight font-bold text-lg">CM</span>
            </div>
            <span className="font-display text-2xl tracking-wide text-cream">
              CAB MARGIN
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className="text-silver hover:text-cream transition-colors"
            >
              Calculator
            </Link>
            
            <Link 
              to="/pricing" 
              className="text-silver hover:text-cream transition-colors"
            >
              Pricing
            </Link>
            
            {isAuthenticated ? (
              <>
                {isPremium && (
                  <>
                    <Link 
                      to="/history" 
                      className="text-silver hover:text-cream transition-colors"
                    >
                      History
                    </Link>
                    <Link 
                      to="/reports" 
                      className="text-silver hover:text-cream transition-colors"
                    >
                      Reports
                    </Link>
                  </>
                )}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-light text-sm">{user?.email}</span>
                    {isPremium && (
                      <span className="px-2 py-0.5 bg-accent-violet/20 text-accent-violet text-xs rounded-full">
                        PRO
                      </span>
                    )}
                  </div>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm bg-slate-dark hover:bg-slate-light/20 text-cream rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link 
                to="/login" 
                className="px-4 py-2 bg-profit-green hover:bg-profit-green-light text-midnight font-medium rounded-lg transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
