import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    return (typeof window !== 'undefined' ? (window as any).deferredInstallPrompt : null) || null;
  });
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    try {
      // Check if already in standalone mode
      if (
        (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)')?.matches) ||
        (typeof window !== 'undefined' && (window.navigator as any)?.standalone === true)
      ) {
        setIsInstalled(true);
        return;
      }

      // Detect platform
      if (typeof window !== 'undefined' && window.navigator?.userAgent) {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
        setIsIOS(isIosDevice);
      }
    } catch (err) {
      console.warn('PWA detection error:', err);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredInstallPrompt = e;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      (window as any).deferredInstallPrompt = null;
      setDeferredPrompt(null);
      setShowInstallModal(false);
    };

    const handleCustomOpen = async () => {
      const prompt = (window as any).deferredInstallPrompt || deferredPrompt;
      if (prompt) {
        try {
          await prompt.prompt();
          const choice = await prompt.userChoice;
          if (choice.outcome === 'accepted') {
            setIsInstalled(true);
            (window as any).deferredInstallPrompt = null;
            setDeferredPrompt(null);
          }
          return;
        } catch (err) {
          console.warn('Prompt error:', err);
        }
      }
      setShowInstallModal(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('open-install-prompt', handleCustomOpen);
    window.addEventListener('pwa-prompt-ready', () => {
      if ((window as any).deferredInstallPrompt) {
        setDeferredPrompt((window as any).deferredInstallPrompt);
      }
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-install-prompt', handleCustomOpen);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    const prompt = (window as any).deferredInstallPrompt || deferredPrompt;
    if (prompt) {
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          (window as any).deferredInstallPrompt = null;
          setDeferredPrompt(null);
          setShowInstallModal(false);
        }
        return;
      } catch (err) {
        console.warn('Native install prompt invocation error:', err);
      }
    }
    setShowInstallModal(true);
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Prompt Bar (Mobile & Desktop) */}
      {!isDismissed && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-8 z-40 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-forest-900 text-cream-50 p-4 rounded-2xl shadow-2xl border border-forest-700/60 flex items-center gap-3 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-forest-800 border border-mint-500/30 flex items-center justify-center shrink-0 text-mint-400">
              <img src="/icons/icon.svg" alt="Ritual" className="w-6 h-6 object-contain" />
            </div>
            
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-bold text-cream-100 uppercase tracking-wider">Install Ritual App</h4>
              <p className="text-xs text-cream-300/80 line-clamp-1">1-tap offline home screen access</p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-mint-500 hover:bg-mint-400 text-forest-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="p-1.5 rounded-lg text-cream-400 hover:text-cream-100 hover:bg-forest-800/80 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Step-by-Step Install Guide Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 bg-forest-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-mint-200 animate-in zoom-in-95 text-charcoal-900">
            <div className="flex items-center justify-between border-b border-mint-100 pb-3">
              <div className="flex items-center gap-2.5">
                <img src="/icons/icon.svg" alt="Ritual" className="w-8 h-8 rounded-xl object-contain shadow-soft" />
                <div>
                  <h3 className="font-black text-forest-950 text-base">Install Ritual App</h3>
                  <span className="text-[10px] text-charcoal-500 font-mono">Progressive Web App</span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowInstallModal(false)} 
                className="p-1.5 text-charcoal-400 hover:text-charcoal-800 rounded-lg font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct 1-Click Install Button if Native Event Available */}
            {deferredPrompt ? (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3.5 rounded-2xl bg-forest-900 hover:bg-forest-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-soft transition active:scale-98"
              >
                <Download className="w-4 h-4 text-mint-300" />
                <span>Install App on Device</span>
              </button>
            ) : isIOS ? (
              <div className="space-y-3 text-xs text-charcoal-700 bg-cream-50 p-4 rounded-2xl border border-mint-200">
                <p className="font-bold text-forest-950">
                  Apple iOS doesn't allow direct 1-click web downloads. To install:
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span>1. Tap Safari Share</span>
                  <Share className="w-4 h-4 text-forest-800" />
                  <span>2. Tap <strong>"Add to Home Screen"</strong></span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-charcoal-700 bg-cream-50 p-4 rounded-2xl border border-mint-200">
                <p className="font-bold text-forest-950">
                  Tap your browser menu (⋮) and choose <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowInstallModal(false)}
              className="w-full py-2.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-forest-950 font-bold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
