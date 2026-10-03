import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, minDurationMs = 1200 }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / minDurationMs) * 100));
      setProgress(pct);

      if (elapsed >= minDurationMs) {
        clearInterval(interval);
        setIsFadingOut(true);
        setTimeout(() => {
          onFinish();
        }, 300);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [minDurationMs, onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-[#FBF9F5] text-charcoal-900 transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundImage: 'radial-gradient(at 10% 10%, rgba(68, 146, 108, 0.08) 0px, transparent 45%), radial-gradient(at 90% 90%, rgba(226, 241, 233, 0.6) 0px, transparent 50%)'
      }}
    >
      {/* Top Header Label */}
      <div className="w-full flex justify-between items-center z-10">
        <span className="text-[10px] font-mono tracking-widest text-forest-700 font-bold uppercase">
          RITUAL HEALTH
        </span>
        <span className="text-[10px] font-mono tracking-wider text-charcoal-400 uppercase font-medium">
          PROTOCOL OS
        </span>
      </div>

      {/* Center Hero Logo & Clean Loading Indicator */}
      <div className="flex flex-col items-center text-center space-y-6 z-10 my-auto">
        {/* Ritual Brand Icon Frame */}
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white border border-mint-200/90 p-4 shadow-card flex items-center justify-center">
            <img 
              src="/icons/icon.svg" 
              alt="Ritual Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Brand Typography */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-forest-950 font-sans">
            RITUAL
          </h1>
          <p className="text-xs sm:text-sm font-medium text-charcoal-600 tracking-normal max-w-xs">
            Evidence-Based Health, Fitness & Longevity
          </p>
        </div>

        {/* Clean, Subtle Progress Bar */}
        <div className="w-56 sm:w-64 space-y-2.5 pt-3">
          <div className="w-full h-1.5 bg-mint-100 rounded-full overflow-hidden border border-mint-200">
            <div 
              className="h-full bg-forest-900 rounded-full transition-all duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-charcoal-500">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin text-forest-700" />
              Loading protocol...
            </span>
            <span className="font-bold text-forest-900">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Badge */}
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-charcoal-500 z-10">
        <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
        <span>Protected by Supabase Cloud Encryption</span>
      </div>
    </div>
  );
};
