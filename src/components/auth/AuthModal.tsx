import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Loader2, ShieldCheck, Sparkles, CheckCircle } from 'lucide-react';
import { signInUser, signUpUser } from '../../services/supabase';
import { useApp } from '../../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { updateProfile, showToast } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    if (mode === 'signup') {
      const res = await signUpUser(email.trim(), password, name.trim());
      setIsLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        if (name.trim()) {
          updateProfile({ name: name.trim(), email: email.trim() });
        } else {
          updateProfile({ email: email.trim() });
        }
        localStorage.setItem('ritual_auth_user', JSON.stringify({ email: email.trim(), name: name.trim() || email.split('@')[0] }));
        showToast('Account created successfully!', 'success');
        onClose();
      }
    } else {
      const res = await signInUser(email.trim(), password);
      setIsLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        const userEmail = res.data?.user?.email || email.trim();
        const userName = res.data?.user?.user_metadata?.full_name || userEmail.split('@')[0];
        updateProfile({ name: userName, email: userEmail });
        localStorage.setItem('ritual_auth_user', JSON.stringify({ email: userEmail, name: userName }));
        showToast(`Welcome back, ${userName}!`, 'success');
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] max-w-md w-full p-6 sm:p-7 shadow-modal border border-mint-200 text-charcoal-900 space-y-5">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-mint-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-forest-900 text-mint-300 flex items-center justify-center font-black shadow-soft">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-forest-950 font-sans tracking-tight">
                {mode === 'signin' ? 'Sign In to Ritual' : 'Create Ritual Account'}
              </h2>
              <p className="text-xs text-charcoal-500 font-medium">
                {mode === 'signin' ? 'Access your cloud routines & workouts' : 'Sync routines across all your devices'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-mint-50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Mode Toggle Pill */}
        <div className="grid grid-cols-2 gap-1 bg-cream-50 p-1 rounded-2xl border border-mint-200">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMsg(null); }}
            className={`py-2 rounded-xl text-xs font-black transition ${
              mode === 'signin'
                ? 'bg-forest-900 text-white shadow-xs'
                : 'text-charcoal-600 hover:text-forest-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(null); }}
            className={`py-2 rounded-xl text-xs font-black transition ${
              mode === 'signup'
                ? 'bg-forest-900 text-white shadow-xs'
                : 'text-charcoal-600 hover:text-forest-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="font-bold text-charcoal-700 block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Patel"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-cream-50 border border-mint-200 focus:outline-none focus:ring-2 focus:ring-mint-500 font-medium text-charcoal-900"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-bold text-charcoal-700 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-cream-50 border border-mint-200 focus:outline-none focus:ring-2 focus:ring-mint-500 font-medium text-charcoal-900"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-charcoal-700 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-cream-50 border border-mint-200 focus:outline-none focus:ring-2 focus:ring-mint-500 font-medium text-charcoal-900"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 disabled:opacity-60 text-white font-extrabold text-xs shadow-soft transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Create My Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Cloud Privacy Badge */}
        <div className="pt-2 border-t border-mint-100 flex items-center justify-center gap-2 text-[11px] text-charcoal-500">
          <ShieldCheck className="w-4 h-4 text-forest-700" />
          <span>Secured with Supabase End-to-End Auth</span>
        </div>

      </div>
    </div>
  );
};
