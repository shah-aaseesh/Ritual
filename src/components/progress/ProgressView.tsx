import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  Calendar, 
  Camera, 
  Plus, 
  Sparkles,
  Share2
} from 'lucide-react';
import { SocialShareModal } from '../common/SocialShareModal';
import { ShareCardData } from '../../types';

export const ProgressView: React.FC = () => {
  const { progressHistory, routineSteps, addProgressEntry, showToast } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntry = progressHistory.find(p => p.date === todayStr);

  const [mood, setMood] = useState<'great' | 'good' | 'neutral' | 'low' | 'stressed'>(
    todayEntry?.mood || 'good'
  );
  const [energy, setEnergy] = useState<'high' | 'medium' | 'low'>(
    todayEntry?.energy || 'high'
  );
  const [observation, setObservation] = useState<string>(
    todayEntry?.observation || ''
  );
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(
    todayEntry?.photoUrl
  );

  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(true);
  const [shareModalData, setShareModalData] = useState<ShareCardData | null>(null);

  // 7-day consistency calculation
  const recent7 = progressHistory.slice(-7);
  const completedStepsCount = routineSteps.filter(s => s.isCompletedToday).length;
  const currentCompletionRate = routineSteps.length > 0 ? completedStepsCount / routineSteps.length : 0;
  const avgCompletion = recent7.length > 0 
    ? Math.round((recent7.reduce((acc, curr) => acc + curr.completionRate, 0) / recent7.length) * 100) 
    : 0;
  const totalCheckIns = progressHistory.length;

  const createMilestoneShareData = (): ShareCardData => {
    return {
      type: 'milestone',
      title: '7-Day Consistency Milestone',
      subtitle: `${avgCompletion}% average adherence across 7 days`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      primaryStat: {
        label: 'CONSISTENCY SCORE',
        value: `${avgCompletion}%`,
        unit: '7-DAY'
      },
      secondaryStats: [
        { label: 'CHECK-INS', value: `${totalCheckIns} Total` },
        { label: 'TODAY', value: `${Math.round(currentCompletionRate * 100)}%`, highlight: true },
        { label: 'HABIT STACK', value: `${routineSteps.length} Daily` }
      ],
      highlightItems: ['Habit Consistency', 'Clinical Protocols', 'Daily Journal'],
      badgeText: '🏆 MILESTONE UNLOCKED',
      tagline: 'Discipline Over Motivation'
    };
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPhotoPreview(base64);
      showToast('Progress snapshot attached', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCheckIn = () => {
    addProgressEntry({
      date: todayStr,
      completedStepIds: routineSteps.filter(s => s.isCompletedToday).map(s => s.id),
      totalSteps: routineSteps.length,
      completionRate: currentCompletionRate,
      mood,
      energy,
      observation: observation.trim() || 'You recorded your daily check-in.',
      photoUrl: photoPreview
    });
    showToast('Daily check-in updated in your journal', 'success');
  };

  const moodIcons: Record<string, { label: string; icon: string; bg: string }> = {
    great: { label: 'Great', icon: '😄', bg: 'bg-mint-100 text-forest-800 border-mint-200' },
    good: { label: 'Good', icon: '🙂', bg: 'bg-cream-50 text-forest-900 border-mint-200' },
    neutral: { label: 'Neutral', icon: '😐', bg: 'bg-cream-50 text-charcoal-700 border-mint-100' },
    low: { label: 'Low', icon: '😔', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
    stressed: { label: 'Stressed', icon: '😣', bg: 'bg-rose-50 text-rose-800 border-rose-200' }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in duration-200 text-charcoal-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="px-3 py-1 rounded-full bg-mint-100 text-forest-900 text-[10px] font-extrabold uppercase tracking-wider font-mono border border-mint-200">
            Habit Journal
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-forest-950 tracking-tight mt-1.5">
            Progress & Observations
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600">
            Log consistency and note subjective observations over time without unscientific outcome promises.
          </p>
        </div>

        <button
          onClick={() => setIsCheckInOpen(!isCheckInOpen)}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 rounded-full bg-forest-900 text-white hover:bg-forest-800 font-extrabold text-xs shadow-soft transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-mint-300" />
          <span>{isCheckInOpen ? 'Check-In Form' : 'New Check-In'}</span>
        </button>
      </div>

      {/* 7-Day Consistency Visualization */}
      <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white border border-mint-200/80 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-forest-800" />
            <h3 className="text-lg font-black text-forest-950">
              7-Day Consistency Trend
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-charcoal-500">
              Past 7 check-ins
            </span>
            <button
              type="button"
              onClick={() => setShareModalData(createMilestoneShareData())}
              className="p-1.5 px-3 rounded-xl bg-[#FC5200] hover:bg-[#E04800] text-white font-black text-xs transition active:scale-95 shadow-soft flex items-center gap-1.5"
              title="Share Consistency Card"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Card</span>
            </button>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="grid grid-cols-7 gap-3 pt-4 items-end h-44 border-b border-mint-100 pb-4">
          {recent7.map((entry, idx) => {
            const heightPercent = Math.max(15, Math.round(entry.completionRate * 100));
            const dayLabel = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' });
            const isToday = entry.date === todayStr;

            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-bold text-forest-950 font-mono">
                  {Math.round(entry.completionRate * 100)}%
                </span>
                <div className="w-full bg-cream-50/70 rounded-2xl h-28 flex items-end p-1.5 border border-mint-100">
                  <div
                    className={`w-full rounded-xl transition-all duration-500 ${
                      entry.completionRate >= 0.75
                        ? 'bg-forest-900'
                        : entry.completionRate >= 0.4
                        ? 'bg-amber-500'
                        : 'bg-charcoal-300'
                    } ${isToday ? 'ring-2 ring-forest-800' : ''}`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${isToday ? 'text-forest-950 font-extrabold' : 'text-charcoal-500'}`}>
                  {dayLabel}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-charcoal-600 pt-1 font-mono">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-forest-900 inline-block"></span>
            <span>Completed (75%+)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span>Partial (40–74%)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-charcoal-300 inline-block"></span>
            <span>Missed (&lt;40%)</span>
          </span>
        </div>
      </div>

      {/* Desktop 2-Column Responsive Layout for Check-in & Observation Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Desktop: 5 cols): Daily Check-In Logger Card */}
        {isCheckInOpen && (
          <div className="lg:col-span-5 p-6 rounded-[2rem] bg-white border border-mint-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-forest-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-forest-800" />
                <span>Log Today's Check-In ({todayStr})</span>
              </h3>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Mood selector */}
              <div>
                <label className="block text-charcoal-700 font-bold mb-2">
                  How do you feel today?
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['great', 'good', 'neutral', 'low', 'stressed'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`py-2.5 px-1 rounded-2xl text-center border transition ${
                        mood === m
                          ? 'bg-forest-900 text-white font-extrabold border-forest-900 shadow-soft'
                          : 'bg-cream-50 text-charcoal-700 border-mint-100 hover:bg-mint-50'
                      }`}
                    >
                      <span className="text-lg block">{moodIcons[m].icon}</span>
                      <span className="text-[10px] capitalize mt-0.5 block truncate font-mono">{m}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy selector */}
              <div>
                <label className="block text-charcoal-700 font-bold mb-2">
                  Energy Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['high', 'medium', 'low'] as const).map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEnergy(e)}
                      className={`py-2.5 rounded-2xl text-center border font-bold capitalize transition ${
                        energy === e
                          ? 'bg-forest-900 text-white border-forest-900 shadow-soft'
                          : 'bg-cream-50 text-charcoal-700 border-mint-100 hover:bg-mint-50'
                      }`}
                    >
                      {e} Energy
                    </button>
                  ))}
                </div>
              </div>

              {/* Observation Notes */}
              <div>
                <label className="block text-charcoal-700 font-bold mb-1.5">
                  Personal Observation (e.g. skin texture, scalp feel, sleep latency)
                </label>
                <textarea
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  rows={3}
                  placeholder="What did you observe today?..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-cream-50 border border-mint-200 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-mint-500 text-xs sm:text-sm"
                />
              </div>

              {/* Optional Photo Attachment */}
              <div>
                <label className="block text-charcoal-700 font-bold mb-2">
                  Optional Progress Snapshot (Stored locally on your device)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2.5 rounded-2xl bg-cream-50 hover:bg-mint-50 border border-mint-200 text-forest-950 flex items-center gap-2 font-bold text-xs">
                    <Camera className="w-4 h-4 text-forest-800" />
                    <span>Choose Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {photoPreview && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-mint-400 shadow-soft">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveCheckIn}
                className="w-full py-3.5 rounded-full bg-forest-900 text-white font-extrabold text-sm shadow-soft hover:bg-forest-800 transition active:scale-95"
              >
                Save Daily Record
              </button>
            </div>
          </div>
        )}

        {/* Right Column (Desktop: 7 cols): Observation History Timeline */}
        <div className={`${isCheckInOpen ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-forest-950">
              Observation Timeline
            </h3>
            <span className="text-xs text-charcoal-500 font-mono font-medium">
              Neutral self-records ({progressHistory.length} total)
            </span>
          </div>

          <div className="space-y-3">
            {progressHistory.slice().reverse().map((entry) => {
              const entryMood = entry.mood ? moodIcons[entry.mood] : null;
              const completionPercent = Math.round(entry.completionRate * 100);

              return (
                <div
                  key={entry.id}
                  className="p-5 sm:p-6 rounded-[2rem] bg-white border border-mint-200/80 shadow-card space-y-3 text-xs sm:text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-forest-800" />
                      <span className="font-extrabold text-forest-950">
                        {new Date(entry.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-mint-100 text-forest-800 font-mono border border-mint-200">
                        {completionPercent}% Done
                      </span>
                    </div>

                    {entryMood && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${entryMood.bg}`}>
                        <span>{entryMood.icon}</span>
                        <span>{entryMood.label}</span>
                      </span>
                    )}
                  </div>

                  {entry.observation && (
                    <p className="text-charcoal-700 bg-cream-50/70 p-3.5 rounded-2xl border border-mint-100 leading-relaxed">
                      <strong className="text-forest-950 font-bold">You observed:</strong> "{entry.observation}"
                    </p>
                  )}

                  {entry.photoUrl && (
                    <div className="pt-1">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border border-mint-200 shadow-soft">
                        <img src={entry.photoUrl} alt="Progress Record" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Strava-Style Social Share Modal */}
      {shareModalData && (
        <SocialShareModal
          isOpen={!!shareModalData}
          onClose={() => setShareModalData(null)}
          data={shareModalData}
        />
      )}
    </div>
  );
};
