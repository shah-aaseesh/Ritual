import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else if (isIOS) {
      setShowIOSTip(true);
    }
  };

  if (isInstalled || isDismissed) {
    return null;
  }

  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-8 z-40 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-forest-900 text-cream-50 p-4 rounded-2xl shadow-2xl border border-forest-700/60 flex items-center gap-3 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-forest-800 border border-mint-500/30 flex items-center justify-center shrink-0 text-mint-400">
            <Smartphone className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0 pr-1">
            <h4 className="text-xs font-bold text-cream-100 uppercase tracking-wider">Install Ritual App</h4>
            <p className="text-xs text-cream-300/80 line-clamp-1">Install on your home screen for 1-tap offline access</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-mint-500 hover:bg-mint-400 text-forest-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 rounded-lg text-cream-400 hover:text-cream-100 hover:bg-forest-800/80 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Install Instruction Modal */}
      {showIOSTip && (
        <div className="fixed inset-0 z-50 bg-forest-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-sand-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-forest-900 text-mint-400 flex items-center justify-center font-bold">
                  R
                </div>
                <h3 className="font-bold text-forest-950 text-base">Install Ritual on iOS</h3>
              </div>
              <button onClick={() => setShowIOSTip(false)} className="p-1.5 text-charcoal-400 hover:text-charcoal-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-charcoal-700 bg-sand-50 p-4 rounded-2xl border border-sand-200">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-forest-900 text-mint-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                <p>Tap the <strong>Share button</strong> in Safari's bottom toolbar (the square with an arrow pointing up).</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-forest-900 text-mint-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                <p>Scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-forest-900 text-mint-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                <p>Tap <strong>Add</strong> in the top-right corner to launch Ritual as a standalone app!</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSTip(false)}
              className="w-full py-3 rounded-xl bg-forest-900 text-cream-50 font-semibold text-sm hover:bg-forest-800 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
