import React from 'react';
import { EvidenceTier, ClaimVerdict } from '../../types';
import { CheckCircle2, AlertCircle, HelpCircle, Sparkles, ShieldCheck } from 'lucide-react';

export const EvidenceBadge: React.FC<{ tier: EvidenceTier; size?: 'sm' | 'md' }> = ({ 
  tier, 
  size = 'md' 
}) => {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  switch (tier) {
    case 'strong_evidence':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 ${sizeClasses}`}>
          <ShieldCheck className={isSm ? 'w-3 h-3 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />
          Strong evidence
        </span>
      );
    case 'conditional_evidence':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 ${sizeClasses}`}>
          <AlertCircle className={isSm ? 'w-3 h-3 text-amber-600' : 'w-3.5 h-3.5 text-amber-600'} />
          Conditional evidence
        </span>
      );
    case 'promising_limited':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-teal-50 text-teal-900 border border-teal-200 ${sizeClasses}`}>
          <Sparkles className={isSm ? 'w-3 h-3 text-teal-600' : 'w-3.5 h-3.5 text-teal-600'} />
          Promising but limited
        </span>
      );
    case 'supporting_ingredient':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-charcoal-100 text-charcoal-700 border border-charcoal-200 ${sizeClasses}`}>
          <CheckCircle2 className={isSm ? 'w-3 h-3 text-charcoal-500' : 'w-3.5 h-3.5 text-charcoal-500'} />
          Supporting ingredient
        </span>
      );
    case 'insufficient_info':
    default:
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-cream-200 text-charcoal-700 border border-cream-300 ${sizeClasses}`}>
          <HelpCircle className={isSm ? 'w-3 h-3 text-charcoal-500' : 'w-3.5 h-3.5 text-charcoal-500'} />
          Insufficient information
        </span>
      );
  }
};

export const VerdictBadge: React.FC<{ verdict: ClaimVerdict; size?: 'sm' | 'md' }> = ({
  verdict,
  size = 'md'
}) => {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  switch (verdict) {
    case 'supported':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Supported
        </span>
      );
    case 'partially_supported':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 ${sizeClasses}`}>
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          Partially supported
        </span>
      );
    case 'too_vague_to_verify':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-900 border border-sky-200 ${sizeClasses}`}>
          <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
          Too vague to verify
        </span>
      );
    case 'marketing_heavy':
    default:
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-coral-50 text-coral-700 border border-coral-200 ${sizeClasses}`}>
          <AlertCircle className="w-3.5 h-3.5 text-coral-500" />
          Marketing-heavy
        </span>
      );
  }
};
