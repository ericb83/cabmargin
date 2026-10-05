import { useNavigate } from 'react-router-dom';

interface UpgradePromptProps {
  message?: string;
  onClose?: () => void;
}

export default function UpgradePrompt({ message, onClose }: UpgradePromptProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-midnight/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-charcoal rounded-2xl p-8 max-w-md w-full border border-slate-dark relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-light hover:text-cream"
          >
            ✕
          </button>
        )}

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-accent-violet/20 rounded-full flex items-center justify-center">
            <span className="text-3xl">⭐</span>
          </div>

          <h3 className="font-display text-2xl text-cream mb-3">
            UPGRADE TO PREMIUM
          </h3>

          <p className="text-slate-light mb-6">
            {message || 'This feature requires a premium subscription. Upgrade to save loads, view history, and access reports.'}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/pricing')}
              className="w-full py-3 bg-gradient-to-r from-accent-violet to-profit-green text-cream font-display tracking-wide rounded-xl hover:from-accent-violet/80 hover:to-profit-green-light transition-all"
            >
              VIEW PLANS
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-dark hover:bg-slate-light/20 text-cream rounded-xl transition-colors"
              >
                Maybe Later
              </button>
            )}
          </div>

          <p className="text-slate-light text-sm mt-4">
            Starting at just $6.67/month
          </p>
        </div>
      </div>
    </div>
  );
}


