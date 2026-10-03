import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, minDurationMs = 1400 }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Bio-Engine...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / minDurationMs) * 100));
      setProgress(pct);

      if (pct < 35) {
        setStatusText('Calibrating Metabolic Engine...');
      } else if (pct < 75) {
        setStatusText('Connecting Supabase Cloud Sync...');
      } else {
        setStatusText('Protocol Ready.');
      }

      if (elapsed >= minDurationMs) {
        clearInterval(interval);
        setIsFadingOut(true);
        setTimeout(() => {
          onFinish();
        }, 350);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [minDurationMs, onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-[#0D1E15] text-[#FAF7F2] transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#25E296]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Spacing */}
      <div className="w-full flex justify-between items-center z-10">
        <span className="text-[10px] font-mono tracking-widest text-[#25E296] font-bold uppercase opacity-80">
          CLINICAL WELLNESS OS
        </span>
        <span className="text-[10px] font-mono tracking-wider text-cream-200/50 uppercase font-medium">
          v1.0.0 PROD
        </span>
      </div>

      {/* Center Hero Logo & Loader */}
      <div className="flex flex-col items-center text-center space-y-7 z-10 my-auto">
        {/* Animated Logo Container */}
        <div className="relative group">
          {/* Pulsing Outer Ring */}
          <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-r from-[#25E296] to-[#14B8A6] opacity-30 blur-lg animate-pulse" />
          
          {/* Logo Frame */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] bg-[#142B1F] border border-[#25E296]/40 p-3.5 shadow-2xl flex items-center justify-center">
            <img 
              src="/icons/icon.svg" 
              alt="Ritual Logo" 
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(37,226,150,0.5)]" 
            />
          </div>
        </div>

        {/* Brand Text */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-sans flex items-center justify-center gap-2">
            <span>RITUAL</span>
            <Sparkles className="w-5 h-5 text-[#25E296]" />
          </h1>
          <p className="text-xs sm:text-sm font-medium text-cream-200/80 tracking-wide max-w-xs">
            Evidence-Based Health, Fitness & Longevity Protocol
          </p>
        </div>

        {/* Minimalist Progress Loader */}
        <div className="w-64 sm:w-72 space-y-2.5 pt-2">
          {/* Progress Bar Track */}
          <div className="w-full h-1.5 bg-[#1B3828] rounded-full overflow-hidden border border-[#25E296]/20">
            <div 
              className="h-full bg-gradient-to-r from-[#25E296] via-[#34D399] to-[#6EE7B7] rounded-full transition-all duration-75 ease-out shadow-[0_0_10px_#25E296]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Status Label & Percentage */}
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-cream-300/80 animate-pulse">{statusText}</span>
            <span className="text-[#25E296] font-bold">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Badge */}
      <div className="flex items-center gap-2 text-[11px] font-mono text-cream-200/50 z-10">
        <ShieldCheck className="w-3.5 h-3.5 text-[#25E296]" />
        <span>Supabase Encrypted Cloud Architecture</span>
      </div>
    </div>
  );
};
