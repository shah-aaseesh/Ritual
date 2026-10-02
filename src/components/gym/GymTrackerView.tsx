import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Plus, 
  Trash2, 
  Check, 
  History, 
  ArrowUpRight, 
  Flame, 
  Activity, 
  SlidersHorizontal
} from 'lucide-react';
import { MuscleGroup, WorkoutSet, ExerciseLog, WorkoutSession } from '../../types';
import { 
  PRESET_EXERCISES, 
  PRESET_ROUTINE_TEMPLATES, 
  DEMO_WORKOUT_SESSIONS, 
  ExerciseDefinition,
  WorkoutTemplate 
} from '../../data/gymData';
import { useApp } from '../../context/AppContext';
import { BodyMapHeatmap } from './BodyMapHeatmap';
import { GamificationHub } from './GamificationHub';

export const GymTrackerView: React.FC = () => {
  const { showToast } = useApp();

  // Active workout state
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);
  const [activeWorkoutTitle, setActiveWorkoutTitle] = useState<string>('30 min HIIT Cycle');
  const [activeWorkoutSubtitle, setActiveWorkoutSubtitle] = useState<string>('Fat Melt');
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeExercises, setActiveExercises] = useState<ExerciseLog[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<WorkoutTemplate | null>(PRESET_ROUTINE_TEMPLATES[0]);

  // Rest Timer State
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(0);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState<boolean>(false);
  const [activeInterval, setActiveInterval] = useState<number>(1);
  const totalIntervals = activeTemplate?.intervals || 20;

  // Filter for Challenge Cards
  const [challengeFilter, setChallengeFilter] = useState<'All' | 'Starter' | 'Sweat Mode' | 'Strength' | 'Body Map'>('All');

  // Exercise picker modal
  const [showAddExerciseModal, setShowAddExerciseModal] = useState<boolean>(false);
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<MuscleGroup | 'All'>('All');
  const [exerciseSearch, setExerciseSearch] = useState<string>('');

  // History & past workouts
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>(() => {
    const saved = localStorage.getItem('ritual_workout_history');
    return saved ? JSON.parse(saved) : DEMO_WORKOUT_SESSIONS;
  });

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('ritual_workout_history', JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  // Elapsed workout timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutActive && workoutStartTime && !isPaused) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - workoutStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, workoutStartTime, isPaused]);

  // Rest timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRestTimerRunning && restSecondsRemaining > 0) {
      timer = setInterval(() => {
        setRestSecondsRemaining(prev => {
          if (prev <= 1) {
            setIsRestTimerRunning(false);
            showToast('⏰ Rest timer complete! Ready for next interval/set.', 'info');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRestTimerRunning, restSecondsRemaining]);

  const startRestTimer = (seconds: number) => {
    setRestSecondsRemaining(seconds);
    setIsRestTimerRunning(true);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start workout from a preset template
  const startRoutine = (templateId: string) => {
    const template = PRESET_ROUTINE_TEMPLATES.find(t => t.id === templateId) || PRESET_ROUTINE_TEMPLATES[0];
    setActiveTemplate(template);

    const initialExercises: ExerciseLog[] = template.exerciseIds.map((exId, idx) => {
      const def = PRESET_EXERCISES.find(e => e.id === exId) || PRESET_EXERCISES[0];
      const sets: WorkoutSet[] = Array.from({ length: def.defaultSets }).map((_, sIdx) => ({
        id: `set-${idx}-${sIdx}`,
        setNumber: sIdx + 1,
        weightKg: def.defaultWeightKg,
        reps: def.defaultReps,
        isCompleted: false
      }));

      return {
        id: `log-${Date.now()}-${idx}`,
        exerciseId: def.id,
        exerciseName: def.name,
        muscleGroup: def.muscleGroup,
        sets
      };
    });

    setActiveWorkoutTitle(template.title);
    setActiveWorkoutSubtitle(template.subtitle);
    setActiveExercises(initialExercises);
    setWorkoutStartTime(Date.now());
    setElapsedSeconds(0);
    setIsPaused(false);
    setActiveInterval(1);
    setIsWorkoutActive(true);
    showToast(`⚡ Started challenge: ${template.subtitle} (${template.title})`, 'success');
  };

  // Add exercise to active workout
  const handleAddExercise = (def: ExerciseDefinition) => {
    const newLog: ExerciseLog = {
      id: `log-${Date.now()}`,
      exerciseId: def.id,
      exerciseName: def.name,
      muscleGroup: def.muscleGroup,
      sets: [
        { id: `s-${Date.now()}-1`, setNumber: 1, weightKg: def.defaultWeightKg, reps: def.defaultReps, isCompleted: false },
        { id: `s-${Date.now()}-2`, setNumber: 2, weightKg: def.defaultWeightKg, reps: def.defaultReps, isCompleted: false },
        { id: `s-${Date.now()}-3`, setNumber: 3, weightKg: def.defaultWeightKg, reps: def.defaultReps, isCompleted: false },
      ]
    };

    setActiveExercises(prev => [...prev, newLog]);
    setShowAddExerciseModal(false);
    showToast(`Added ${def.name}`, 'info');
  };

  // Toggle set completed & auto trigger rest timer
  const toggleSetComplete = (exerciseId: string, setId: string) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => {
          if (s.id !== setId) return s;
          const nextCompleted = !s.isCompleted;
          if (nextCompleted) {
            startRestTimer(90);
            setActiveInterval(prevI => Math.min(prevI + 1, totalIntervals));
          }
          return { ...s, isCompleted: nextCompleted };
        })
      };
    }));
  };

  // Update set weight or reps
  const updateSet = (exerciseId: string, setId: string, field: 'weightKg' | 'reps', val: number) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => {
          if (s.id !== setId) return s;
          return { ...s, [field]: Math.max(0, val) };
        })
      };
    }));
  };

  // Add new set to exercise
  const addSetToExercise = (exerciseId: string) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet: WorkoutSet = {
        id: `set-${Date.now()}`,
        setNumber: ex.sets.length + 1,
        weightKg: lastSet ? lastSet.weightKg : 20,
        reps: lastSet ? lastSet.reps : 10,
        isCompleted: false
      };
      return { ...ex, sets: [...ex.sets, newSet] };
    }));
  };

  // Finish workout
  const finishWorkout = () => {
    const totalVolume = activeExercises.reduce((acc, ex) => {
      return acc + ex.sets.reduce((sAcc, s) => s.isCompleted ? sAcc + (s.weightKg * s.reps) : sAcc, 0);
    }, 0);

    const completedSets = activeExercises.reduce((acc, ex) => {
      return acc + ex.sets.filter(s => s.isCompleted).length;
    }, 0);

    const session: WorkoutSession = {
      id: `session-${Date.now()}`,
      title: `${activeWorkoutSubtitle} - ${activeWorkoutTitle}`,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      totalVolumeKg: totalVolume,
      totalSets: completedSets,
      exercises: activeExercises
    };

    setWorkoutHistory(prev => [session, ...prev]);
    setIsWorkoutActive(false);
    setIsRestTimerRunning(false);
    showToast(`🏁 Challenge Complete! ${totalVolume.toLocaleString()} kg lifted & ${Math.round(elapsedSeconds * 0.12)} kcal burned!`, 'success');
  };

  const filteredChallenges = PRESET_ROUTINE_TEMPLATES.filter(t => {
    if (challengeFilter === 'All' || challengeFilter === 'Body Map') return true;
    return t.category === challengeFilter;
  });

  const filteredExercises = PRESET_EXERCISES.filter(ex => {
    const matchesGroup = selectedMuscleFilter === 'All' || ex.muscleGroup === selectedMuscleFilter;
    const matchesSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  // Calculate dynamic live metrics
  const currentBpm = 135 + Math.floor((elapsedSeconds % 30) / 4);
  const currentKcal = Math.round(elapsedSeconds * 0.133);
  const remainingSeconds = Math.max(0, (activeTemplate ? activeTemplate.durationMinutes * 60 : 1800) - elapsedSeconds);
  const timerDisplay = isRestTimerRunning ? formatTimer(restSecondsRemaining) : formatTimer(remainingSeconds);
  const progressRatio = activeTemplate 
    ? Math.min(1, elapsedSeconds / (activeTemplate.durationMinutes * 60)) 
    : 0.25;

  return (
    <div className="space-y-6 pb-24 text-white">
      {/* ========================================================================= */}
      {/* 🚀 PICK A CHALLENGE & ATHLETIC HERO HUB                                  */}
      {/* ========================================================================= */}
      <div className="bg-[#0C0C10] rounded-[2.5rem] p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping" />
              <span className="text-[11px] font-black uppercase text-[#FF3B30] tracking-widest font-mono">
                ATHLETIC PERFORMANCE SUITE
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
              Pick a Challenge
            </h1>
          </div>

          {/* Quick Start / Biomechanical Setup Button */}
          <button
            type="button"
            onClick={() => startRoutine(PRESET_ROUTINE_TEMPLATES[0].id)}
            className="self-start sm:self-center px-4 py-2.5 rounded-full bg-[#181822] hover:bg-[#22222E] border border-white/15 text-xs font-bold flex items-center gap-2 text-zinc-200 hover:text-white transition shadow-soft"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#FF3B30]" />
            <span>Ready Setup</span>
          </button>
        </div>

        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(['All', 'Starter', 'Sweat Mode', 'Strength', 'Body Map'] as const).map((tab) => {
            const isActive = challengeFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setChallengeFilter(tab)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-black font-extrabold shadow-lg scale-[1.02]'
                    : 'bg-[#181822] text-zinc-400 hover:text-white hover:bg-[#22222E] border border-white/5'
                }`}
              >
                {tab === 'Body Map' ? '🗺️ Anatomical Body Map' : tab}
              </button>
            );
          })}
        </div>

        {/* If Body Map tab is selected, show Interactive Muscle Map */}
        {challengeFilter === 'Body Map' ? (
          <div className="space-y-6 pt-2">
            <BodyMapHeatmap
              onSelectExercise={(ex) => handleAddExercise(ex)}
              onStartMuscleWorkout={(muscle) => {
                const exercisesForMuscle = PRESET_EXERCISES.filter(e => e.muscleGroup === muscle);
                if (exercisesForMuscle.length > 0) {
                  startRoutine('push-day');
                }
              }}
            />
            <GamificationHub />
          </div>
        ) : (
          /* Challenge Cards Grid (Inspired by the Reference Screenshot) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChallenges.map((challenge, idx) => (
              <div
                key={challenge.id}
                className="group relative bg-[#13131A] hover:bg-[#181822] rounded-[2rem] p-6 border border-white/10 hover:border-[#FF3B30]/40 transition-all duration-300 shadow-card flex flex-col justify-between overflow-hidden min-h-[260px]"
              >
                {/* Subtle Crimson Glow in Background on Hover */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#FF3B30]/10 rounded-full blur-3xl group-hover:bg-[#FF3B30]/20 transition-all pointer-events-none" />

                {/* Top Details */}
                <div className="relative z-10 space-y-1">
                  <span className="text-xs font-semibold text-zinc-400 block tracking-wide">
                    {challenge.subtitle}
                  </span>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {challenge.title}
                  </h3>

                  <div className="pt-3 space-y-1 text-xs text-zinc-400 font-medium">
                    <p className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
                      <span>{challenge.intervals} Intervals</span>
                    </p>
                    <p className="text-zinc-200 font-bold text-sm">
                      {challenge.durationMinutes} min
                    </p>
                    {challenge.powerSurgeMinutes && (
                      <p className="text-zinc-400">
                        Power Surge <strong className="text-zinc-200">{challenge.powerSurgeMinutes} min</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Action Pill & Athlete Graphic */}
                <div className="relative z-10 pt-6 flex items-end justify-between">
                  {/* Circular Launch Button with Angled Arrow */}
                  <button
                    type="button"
                    onClick={() => startRoutine(challenge.id)}
                    className="flex items-center gap-2 p-1 pl-3.5 pr-1.5 rounded-full bg-[#20202B] hover:bg-[#282836] border border-white/10 group-hover:border-[#FF3B30]/40 transition-all"
                  >
                    <span className="text-[11px] font-extrabold text-zinc-200 group-hover:text-white">
                      Start Mode
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#FF3B30] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </button>

                  {/* High-End Vector Athlete/Bike Cutout Icon */}
                  <div className="w-20 h-20 opacity-40 group-hover:opacity-85 transition-all text-[#FF3B30] flex items-center justify-center">
                    {idx % 3 === 0 ? (
                      <Activity className="w-16 h-16 stroke-[1.2]" />
                    ) : idx % 3 === 1 ? (
                      <Flame className="w-16 h-16 stroke-[1.2]" />
                    ) : (
                      <Dumbbell className="w-16 h-16 stroke-[1.2]" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🔴 LIVE WORKOUT SESSION HUD & RADIAL GAUGE (Screen 3 Reference Design)      */}
      {/* ========================================================================= */}
      {isWorkoutActive && (
        <div className="bg-[#0C0C10] rounded-[2.5rem] p-6 sm:p-8 border border-[#FF3B30]/40 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Top Session Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#FF3B30] animate-pulse" />
              <div>
                <span className="text-[10px] font-black uppercase text-[#FF3B30] tracking-widest font-mono">
                  LIVE WORKOUT INTERVALS
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {activeWorkoutSubtitle} • {activeWorkoutTitle}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono font-bold text-zinc-300">
                Interval {activeInterval} of {totalIntervals}
              </span>
              <button
                type="button"
                onClick={finishWorkout}
                className="px-4 py-1.5 rounded-full bg-white text-black hover:bg-zinc-200 font-extrabold text-xs transition active:scale-95"
              >
                End Session
              </button>
            </div>
          </div>

          {/* Metric Displays (Heart Rate & Calories Burned) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#14141C] p-4 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Heart Rate
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {currentBpm}
                </span>
                <span className="text-xs font-bold text-[#FF3B30]">bpm</span>
              </div>
            </div>

            <div className="bg-[#14141C] p-4 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Active Burn
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {currentKcal}
                </span>
                <span className="text-xs font-bold text-amber-400">kcal</span>
              </div>
            </div>

            <div className="bg-[#14141C] p-4 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Total Elapsed
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {formatTimer(elapsedSeconds)}
                </span>
              </div>
            </div>

            <div className="bg-[#14141C] p-4 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Total Exercises
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {activeExercises.length}
                </span>
                <span className="text-xs text-zinc-400 font-bold">movements</span>
              </div>
            </div>
          </div>

          {/* Large Circular Radial Ring Gauge (Screen 3 UI) */}
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Radial SVG Gauge */}
              <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 200 200">
                {/* Background Dotted Track */}
                <circle
                  cx="100"
                  cy="100"
                  r="76"
                  stroke="#262633"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="4 6"
                />
                {/* Glowing Crimson Foreground Arc */}
                <circle
                  cx="100"
                  cy="100"
                  r="76"
                  stroke="#FF3B30"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 76}
                  strokeDashoffset={2 * Math.PI * 76 * (1 - (isRestTimerRunning ? restSecondsRemaining / 90 : progressRatio))}
                  className="transition-all duration-500 ease-out"
                />
              </svg>

              {/* Digital Timer Readout Inside Radial Dial */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                  {timerDisplay}
                </span>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
                  {isRestTimerRunning ? 'Rest Interval' : 'Remaining'}
                </span>
              </div>
            </div>

            {/* Bottom Frosted Pill Control Bar (|← , 00/Pause , →|) */}
            <div className="flex items-center gap-3 p-2 bg-[#181822]/90 backdrop-blur-md rounded-full border border-white/10 shadow-2xl">
              <button
                type="button"
                onClick={() => setActiveInterval(prev => Math.max(1, prev - 1))}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
                title="Previous Interval"
              >
                <span className="font-mono font-black text-sm">|←</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPaused(prev => !prev)}
                className="px-6 h-12 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center gap-2 font-mono font-black text-sm transition active:scale-95 shadow-lg"
              >
                <span>{isPaused ? '▶ RESUME' : '00 PAUSE'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  startRestTimer(60);
                  setActiveInterval(prev => Math.min(totalIntervals, prev + 1));
                }}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
                title="Next Interval"
              >
                <span className="font-mono font-black text-sm">→|</span>
              </button>
            </div>
          </div>

          {/* Interactive Set & Exercise Logger */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                Active Workout Set Logger
              </h3>
              <button
                type="button"
                onClick={() => setShowAddExerciseModal(true)}
                className="px-3 py-1.5 rounded-full bg-[#181822] hover:bg-[#22222E] border border-white/15 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5 text-[#FF3B30]" />
                <span>Add Movement</span>
              </button>
            </div>

            <div className="space-y-3">
              {activeExercises.map((ex, exIdx) => (
                <div key={ex.id} className="p-4 rounded-2xl bg-[#14141C] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-[#FF3B30]/20 text-[#FF3B30] font-mono">
                        #{exIdx + 1}
                      </span>
                      <h4 className="text-sm font-black text-white">{ex.exerciseName}</h4>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase bg-white/5 px-2 py-0.5 rounded-full">
                        {ex.muscleGroup}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveExercises(prev => prev.filter(item => item.id !== ex.id))}
                      className="p-1 rounded-lg text-zinc-400 hover:text-[#FF3B30] transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Sets Table */}
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-zinc-400 uppercase px-2">
                      <div className="col-span-2 text-center">Set</div>
                      <div className="col-span-4 text-center">Weight (kg)</div>
                      <div className="col-span-4 text-center">Reps</div>
                      <div className="col-span-2 text-center">Complete</div>
                    </div>

                    {ex.sets.map((set) => (
                      <div
                        key={set.id}
                        className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl text-xs transition ${
                          set.isCompleted ? 'bg-[#FF3B30]/20 border border-[#FF3B30]/40' : 'bg-black/30'
                        }`}
                      >
                        <div className="col-span-2 text-center font-black font-mono text-zinc-300">
                          {set.setNumber}
                        </div>

                        <div className="col-span-4">
                          <input
                            type="number"
                            value={set.weightKg}
                            onChange={(e) => updateSet(ex.id, set.id, 'weightKg', parseFloat(e.target.value) || 0)}
                            className="w-full text-center bg-black/50 border border-white/10 rounded-lg py-1 font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#FF3B30]"
                          />
                        </div>

                        <div className="col-span-4">
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => updateSet(ex.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                            className="w-full text-center bg-black/50 border border-white/10 rounded-lg py-1 font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#FF3B30]"
                          />
                        </div>

                        <div className="col-span-2 flex justify-center">
                          <button
                            type="button"
                            onClick={() => toggleSetComplete(ex.id, set.id)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                              set.isCompleted
                                ? 'bg-[#FF3B30] text-white scale-105'
                                : 'bg-white/10 text-zinc-400 hover:bg-white/20'
                            }`}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => addSetToExercise(ex.id)}
                      className="text-xs font-bold text-[#FF3B30] hover:text-[#FF6961] flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Set</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                      <span>Rest Timer:</span>
                      <button
                        type="button"
                        onClick={() => startRestTimer(60)}
                        className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 font-bold"
                      >
                        60s
                      </button>
                      <button
                        type="button"
                        onClick={() => startRestTimer(90)}
                        className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 font-bold"
                      >
                        90s
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📊 RECENT WORKOUT HISTORY & PRs                                           */}
      {/* ========================================================================= */}
      <div className="bg-[#0C0C10] rounded-[2.5rem] p-6 sm:p-8 border border-white/10 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <History className="w-5 h-5 text-[#FF3B30]" />
            <span>Athletic Session History</span>
          </h2>
          <span className="text-xs text-zinc-400 font-mono font-bold">
            {workoutHistory.length} Recorded
          </span>
        </div>

        {workoutHistory.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#14141C] border border-white/5 text-center text-xs text-zinc-400">
            No completed workouts yet. Launch a challenge above!
          </div>
        ) : (
          <div className="space-y-3">
            {workoutHistory.map((session) => (
              <div
                key={session.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#14141C] border border-white/5 hover:border-white/15 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#FF3B30] bg-[#FF3B30]/10 px-2.5 py-0.5 rounded-full border border-[#FF3B30]/20">
                      {session.date} • {session.startTime}
                    </span>
                    <h3 className="text-base font-black text-white mt-1">{session.title}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="px-3 py-1 rounded-xl bg-white/5 text-zinc-200 font-bold">
                      ⏱️ {session.durationMinutes} mins
                    </div>
                    <div className="px-3 py-1 rounded-xl bg-[#FF3B30]/20 text-[#FF3B30] font-black">
                      ⚡ {session.totalVolumeKg.toLocaleString()} kg Lifted
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {session.exercises.map((ex) => (
                    <div key={ex.id} className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs space-y-1">
                      <span className="font-black text-zinc-200 block">{ex.exerciseName}</span>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                        <span>{ex.sets.filter(s => s.isCompleted).length} sets</span>
                        <span>•</span>
                        <span>Max {Math.max(...ex.sets.map(s => s.weightKg), 0)} kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🔎 ADD EXERCISE MODAL                                                     */}
      {/* ========================================================================= */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121218] rounded-[2rem] max-w-lg w-full p-6 shadow-2xl border border-white/10 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-black text-white">Movement Library</h3>
                <p className="text-xs text-zinc-400">Select an exercise to add to your live workout</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddExerciseModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Muscle Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {(['All', 'Chest', 'Back', 'Quads', 'Hamstrings', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Cardio'] as const).map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setSelectedMuscleFilter(group)}
                  className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition ${
                    selectedMuscleFilter === group
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search exercise (e.g. Bench Press, Squat)..."
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#FF3B30]"
            />

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredExercises.map((def) => (
                <div
                  key={def.id}
                  onClick={() => handleAddExercise(def)}
                  className="p-3 rounded-xl bg-[#181822] hover:bg-[#20202C] border border-white/5 hover:border-[#FF3B30]/40 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white">{def.name}</span>
                      <span className="text-[9px] font-bold text-zinc-400 px-2 py-0.5 bg-white/5 rounded-full">
                        {def.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{def.instructions}</p>
                  </div>
                  <Plus className="w-4 h-4 text-[#FF3B30] shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
