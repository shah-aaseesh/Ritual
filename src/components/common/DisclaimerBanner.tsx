import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const DisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-start gap-2 p-3 bg-mint-50/80 border border-mint-200/80 rounded-xl text-xs text-charcoal-700 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
        <p>
          <strong className="font-semibold text-forest-900">Evidence & transparency notice:</strong> Ritual explains published evidence and label transparency. It does not diagnose conditions, determine personal safety, or replace advice from a qualified professional.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-mint-50 to-cream-100 border border-mint-200 rounded-2xl text-xs text-charcoal-700 leading-relaxed shadow-soft">
      <div className="flex items-center gap-2 mb-1.5 text-forest-900 font-semibold">
        <Info className="w-4 h-4 text-forest-700" />
        <span>Scientific Transparency Disclaimer</span>
      </div>
      <p className="text-charcoal-600">
        Ritual explains published scientific evidence and packaging claim transparency. It does not diagnose medical conditions, formulate individual prescriptions, guarantee safety for pregnant or reactive individuals, or replace personalized advice from a qualified dermatologist, trichologist, or healthcare professional.
      </p>
    </div>
  );
};
