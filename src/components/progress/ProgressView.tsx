import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  Calendar, 
  Camera, 
  Plus, 
  Sparkles
} from 'lucide-react';

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

  // 7-day consistency calculation
  const recent7 = progressHistory.slice(-7);
  const completedStepsCount = routineSteps.filter(s => s.isCompletedToday).length;
  const currentCompletionRate = routineSteps.length > 0 ? completedStepsCount / routineSteps.length : 0;

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
    great: { label: 'Great', icon: '😄', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    good: { label: 'Good', icon: '🙂', bg: 'bg-white/10 text-white border-white/20' },
    neutral: { label: 'Neutral', icon: '😐', bg: 'bg-white/5 text-zinc-300 border-white/10' },
    low: { label: 'Low', icon: '😔', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    stressed: { label: 'Stressed', icon: '😣', bg: 'bg-[#FF3B30]/20 text-[#FF3B30] border-[#FF3B30]/30' }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in duration-200 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-extrabold uppercase tracking-wider font-mono border border-white/10">
            Habit Journal
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1.5">
            Progress & Observations
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Log consistency and note subjective observations over time without unscientific outcome promises.
          </p>
        </div>

        <button
          onClick={() => setIsCheckInOpen(!isCheckInOpen)}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 font-extrabold text-xs shadow-lg transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#FF3B30]" />
          <span>{isCheckInOpen ? 'Check-In Form' : 'New Check-In'}</span>
        </button>
      </div>

      {/* 7-Day Consistency Visualization */}
      <div className="p-6 sm:p-8 rounded-[2.5rem] bg-[#0C0C10] border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#FF3B30]" />
            <h3 className="text-lg font-black text-white">
              7-Day Consistency Trend
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-zinc-400">
            Past 7 check-ins
          </span>
        </div>

        {/* Bar Chart Visualization */}
        <div className="grid grid-cols-7 gap-3 pt-4 items-end h-44 border-b border-white/10 pb-4">
          {recent7.map((entry, idx) => {
            const heightPercent = Math.max(15, Math.round(entry.completionRate * 100));
            const dayLabel = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' });
            const isToday = entry.date === todayStr;

            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-bold text-zinc-300 font-mono">
                  {Math.round(entry.completionRate * 100)}%
                </span>
                <div className="w-full bg-[#14141C] rounded-2xl h-28 flex items-end p-1.5 border border-white/5">
                  <div
                    className={`w-full rounded-xl transition-all duration-500 ${
                      entry.completionRate >= 0.75
                        ? 'bg-[#FF3B30]'
                        : entry.completionRate >= 0.4
                        ? 'bg-amber-400'
                        : 'bg-zinc-600'
                    } ${isToday ? 'ring-2 ring-white' : ''}`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${isToday ? 'text-white font-extrabold' : 'text-zinc-500'}`}>
                  {dayLabel}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 pt-1 font-mono">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF3B30] inline-block"></span>
            <span>Completed (75%+)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
            <span>Partial (40–74%)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-zinc-600 inline-block"></span>
            <span>Missed (&lt;40%)</span>
          </span>
        </div>
      </div>

      {/* Desktop 2-Column Responsive Layout for Check-in & Observation Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Desktop: 5 cols): Daily Check-In Logger Card */}
        {isCheckInOpen && (
          <div className="lg:col-span-5 p-6 rounded-[2rem] bg-[#0C0C10] border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF3B30]" />
                <span>Log Today's Check-In ({todayStr})</span>
              </h3>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Mood selector */}
              <div>
                <label className="block text-zinc-300 font-bold mb-2">
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
                          ? 'bg-white text-black font-extrabold border-white shadow-md'
                          : 'bg-[#14141C] text-zinc-300 border-white/5 hover:bg-white/5'
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
                <label className="block text-zinc-300 font-bold mb-2">
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
                          ? 'bg-white text-black border-white shadow-md'
                          : 'bg-[#14141C] text-zinc-300 border-white/5 hover:bg-white/5'
                      }`}
                    >
                      {e} Energy
                    </button>
                  ))}
                </div>
              </div>

              {/* Observation Notes */}
              <div>
                <label className="block text-zinc-300 font-bold mb-1.5">
                  Personal Observation (e.g. skin texture, scalp feel, sleep latency)
                </label>
                <textarea
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  rows={3}
                  placeholder="What did you observe today?..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#FF3B30] text-xs sm:text-sm"
                />
              </div>

              {/* Optional Photo Attachment */}
              <div>
                <label className="block text-zinc-300 font-bold mb-2">
                  Optional Progress Snapshot (Stored locally on your device)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2.5 rounded-2xl bg-[#14141C] hover:bg-[#1E1E28] border border-white/10 text-white flex items-center gap-2 font-bold text-xs">
                    <Camera className="w-4 h-4 text-[#FF3B30]" />
                    <span>Choose Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {photoPreview && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#FF3B30]">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveCheckIn}
                className="w-full py-3.5 rounded-full bg-white text-black font-extrabold text-sm shadow-lg hover:bg-zinc-200 transition active:scale-95"
              >
                Save Daily Record
              </button>
            </div>
          </div>
        )}

        {/* Right Column (Desktop: 7 cols): Observation History Timeline */}
        <div className={`${isCheckInOpen ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white">
              Observation Timeline
            </h3>
            <span className="text-xs text-zinc-400 font-mono font-medium">
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
                  className="p-5 sm:p-6 rounded-[2rem] bg-[#0C0C10] border border-white/10 shadow-card space-y-3 text-xs sm:text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#FF3B30]" />
                      <span className="font-extrabold text-white">
                        {new Date(entry.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 font-mono">
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
                    <p className="text-zinc-300 bg-black/40 p-3.5 rounded-2xl border border-white/5 leading-relaxed">
                      <strong className="text-white font-bold">You observed:</strong> "{entry.observation}"
                    </p>
                  )}

                  {entry.photoUrl && (
                    <div className="pt-1">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-sm">
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
    </div>
  );
};
