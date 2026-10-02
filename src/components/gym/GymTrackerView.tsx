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
  ChevronRight,
  ChevronLeft,
  Award,
  Play,
  Sparkles,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { MuscleGroup, WorkoutSet, ExerciseLog, WorkoutSession } from '../../types';
import { 
  PRESET_EXERCISES, 
  PRESET_ROUTINE_TEMPLATES, 
  DEMO_WORKOUT_SESSIONS, 
  ExerciseDefinition,
  WorkoutTemplate 
} from '../../data/gymData';
import { MOSAIC_PRODUCTS_CATALOG } from '../../data/mosaicProducts';
import { useApp } from '../../context/AppContext';
import { BodyMapHeatmap } from './BodyMapHeatmap';
import { GamificationHub } from './GamificationHub';

type GymSubView = 'hub' | 'workout' | 'challenges' | 'bodymap' | 'milestones' | 'history' | 'supplements';

export const GymTrackerView: React.FC = () => {
  const { showToast } = useApp();

  // Nested Navigation View State
  const [subView, setSubView] = useState<GymSubView>('hub');

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
    setSubView('workout');
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
    setSubView('history');
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
      {/* 🧭 NESTED VIEW HEADER & NAVIGATION BAR                                     */}
      {/* ========================================================================= */}
      {subView !== 'hub' && (
        <div className="flex items-center justify-between bg-[#121217] p-3.5 sm:p-4 rounded-3xl border border-white/10 shadow-lg">
          <button
            type="button"
            onClick={() => setSubView('hub')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-black text-white transition active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Gym Hub</span>
          </button>

          <span className="text-xs font-mono font-black uppercase text-zinc-300 tracking-wider">
            {subView === 'workout' && '⚡ Live Workout Session'}
            {subView === 'challenges' && '🏆 Challenges & Routines'}
            {subView === 'bodymap' && '🧬 Muscle Readiness'}
            {subView === 'milestones' && '🎯 Longevity Objectives'}
            {subView === 'supplements' && '⚡ Evidence-Backed Formulations'}
            {subView === 'history' && '📜 Session History'}
          </span>

          <div className="flex items-center gap-1.5">
            {isWorkoutActive && subView !== 'workout' && (
              <button
                type="button"
                onClick={() => setSubView('workout')}
                className="px-3 py-1.5 rounded-full bg-[#FF3B30] text-white text-xs font-black flex items-center gap-1.5 animate-pulse shadow-md"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Live HUD</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏠 MAIN NESTED HUB SCREEN (CLEAN BITE-SIZED OVERVIEW)                     */}
      {/* ========================================================================= */}
      {subView === 'hub' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Active Workout Floating Banner if Live */}
          {isWorkoutActive && (
            <div 
              onClick={() => setSubView('workout')}
              className="p-5 rounded-[2rem] bg-gradient-to-r from-[#FF3B30]/20 via-[#181822] to-[#121217] border border-[#FF3B30]/50 shadow-xl flex items-center justify-between cursor-pointer group hover:border-[#FF3B30] transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#FF3B30] text-white flex items-center justify-center font-mono font-black shadow-lg shadow-[#FF3B30]/30 animate-pulse">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#FF3B30] block">
                    Session In Progress • Interval {activeInterval}/{totalIntervals}
                  </span>
                  <h3 className="text-base font-black text-white">
                    {activeWorkoutSubtitle} • {activeWorkoutTitle}
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    ⏱️ {formatTimer(elapsedSeconds)} • {currentKcal} kcal • {currentBpm} bpm
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 rounded-full bg-white text-black font-black text-xs group-hover:bg-zinc-200 transition shadow-md">
                Resume HUD ›
              </div>
            </div>
          )}

          {/* Quick Metrics Header Card */}
          <div className="bg-[#0C0C10] rounded-[2.5rem] p-6 sm:p-8 border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-black uppercase text-[#FF3B30] tracking-widest block">
                  ATHLETIC PERFORMANCE HUB
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                  Performance & Recovery
                </h1>
              </div>
              <button
                type="button"
                onClick={() => startRoutine(PRESET_ROUTINE_TEMPLATES[0].id)}
                className="px-4 py-2 rounded-full bg-white text-black hover:bg-zinc-200 font-black text-xs transition shadow-lg flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Quick Start</span>
              </button>
            </div>

            {/* Metric Strip */}
            <div className="grid grid-cols-3 gap-3 pt-1 font-mono text-center">
              <div className="p-3.5 rounded-2xl bg-[#14141C] border border-white/5 space-y-0.5">
                <span className="text-[10px] text-zinc-400 uppercase block">Total Workouts</span>
                <span className="text-lg sm:text-xl font-black text-white">{workoutHistory.length}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#14141C] border border-white/5 space-y-0.5">
                <span className="text-[10px] text-zinc-400 uppercase block">Recovery Index</span>
                <span className="text-lg sm:text-xl font-black text-emerald-400">88% Prime</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#14141C] border border-white/5 space-y-0.5">
                <span className="text-[10px] text-zinc-400 uppercase block">Adherence</span>
                <span className="text-lg sm:text-xl font-black text-[#FF3B30]">14 Days</span>
              </div>
            </div>
          </div>

          {/* Core Nested Mobile Navigation Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tile 1: Workout Session & Logger */}
            <div
              onClick={() => {
                if (!isWorkoutActive) startRoutine(PRESET_ROUTINE_TEMPLATES[0].id);
                else setSubView('workout');
              }}
              className="group p-6 rounded-[2rem] bg-[#121217] hover:bg-[#181822] border border-white/10 hover:border-[#FF3B30]/40 transition-all cursor-pointer shadow-card flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF3B30] to-rose-700 text-white flex items-center justify-center shadow-lg shadow-[#FF3B30]/20 group-hover:scale-105 transition-transform">
                  <Dumbbell className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black uppercase text-[#FF3B30] tracking-wider">
                    {isWorkoutActive ? 'Live Session Active' : 'Live Workout HUD'}
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    {isWorkoutActive ? 'Interactive Set Logger' : 'Start Training Session'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Hevy-grade logger, auto rest timer & heart rate HUD
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition" />
            </div>

            {/* Tile 2: Pick a Challenge */}
            <div
              onClick={() => setSubView('challenges')}
              className="group p-6 rounded-[2rem] bg-[#121217] hover:bg-[#181822] border border-white/10 hover:border-[#FF3B30]/40 transition-all cursor-pointer shadow-card flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                  <Flame className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black uppercase text-amber-400 tracking-wider">
                    6 Athletic Challenges
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    Pick a Challenge
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    HIIT cycles, fat melt, muscle hypertrophy routines
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition" />
            </div>

            {/* Tile 3: Anatomical Body Map & Heatmap */}
            <div
              onClick={() => setSubView('bodymap')}
              className="group p-6 rounded-[2rem] bg-[#121217] hover:bg-[#181822] border border-white/10 hover:border-[#FF3B30]/40 transition-all cursor-pointer shadow-card flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Activity className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black uppercase text-emerald-400 tracking-wider">
                    Kinetic Bio-Readiness
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    Anatomical Body Map
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    3D silhouette muscle heatmaps & recovery diagnostics
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition" />
            </div>

            {/* Tile 4: Longevity Milestones & Adherence */}
            <div
              onClick={() => setSubView('milestones')}
              className="group p-6 rounded-[2rem] bg-[#121217] hover:bg-[#181822] border border-white/10 hover:border-[#FF3B30]/40 transition-all cursor-pointer shadow-card flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black uppercase text-indigo-400 tracking-wider">
                    Longevity Milestones
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    Adherence & Gamification
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Daily objectives, habit streaks, and certified tiers
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition" />
            </div>

            {/* Tile 5: Evidence-Based Performance Formulations */}
            <div
              onClick={() => setSubView('supplements')}
              className="group p-6 rounded-[2rem] bg-[#121217] hover:bg-[#181822] border border-white/10 hover:border-[#FF3B30]/40 transition-all cursor-pointer shadow-card flex items-center justify-between md:col-span-2"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF3B30] via-rose-600 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-[#FF3B30]/20 group-hover:scale-105 transition-transform">
                  <Zap className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black uppercase text-[#FF3B30] tracking-wider">
                      Clinical Grade Formulations
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-bold text-zinc-300">
                      Creapure® • Native Whey • Electrolytes
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    Athletic Supplements & Formulations
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Explore evidence-backed ergogenic aids, micronutrient matrices, and recovery kinetic dosages
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Tile 5: Session History Bar */}
          <div
            onClick={() => setSubView('history')}
            className="p-5 rounded-[2rem] bg-[#121217] hover:bg-[#181822] border border-white/10 flex items-center justify-between cursor-pointer transition shadow-md"
          >
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-[#FF3B30]" />
              <div>
                <h4 className="text-sm font-black text-white">Workout Session History</h4>
                <p className="text-xs text-zinc-400">{workoutHistory.length} recorded workouts • Volume & PR tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-zinc-400">
              <span>View Logs</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔴 SUB-VIEW: LIVE WORKOUT HUD & SET LOGGER                                */}
      {/* ========================================================================= */}
      {subView === 'workout' && (
        <div className="space-y-6 animate-in fade-in duration-200">
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

            {/* Metric Displays */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#14141C] p-4 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
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
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
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
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
                  Total Elapsed
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {formatTimer(elapsedSeconds)}
                  </span>
                </div>
              </div>

              <div className="bg-[#14141C] p-4 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
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

            {/* Large Circular Radial Ring Gauge */}
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Radial SVG Gauge */}
                <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="76"
                    stroke="#262633"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="4 6"
                  />
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
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1 font-mono">
                    {isRestTimerRunning ? 'Rest Interval' : 'Remaining'}
                  </span>
                </div>
              </div>

              {/* Bottom Frosted Pill Control Bar */}
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
                        <span className="text-[10px] font-bold text-zinc-400 uppercase bg-white/5 px-2 py-0.5 rounded-full font-mono">
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
                      <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-zinc-400 uppercase px-2 font-mono">
                        <div className="col-span-2 text-center">Set</div>
                        <div className="col-span-4 text-center">Weight (kg)</div>
                        <div className="col-span-4 text-center">Reps</div>
                        <div className="col-span-2 text-center">Done</div>
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
                        <span>Rest:</span>
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏆 SUB-VIEW: PICK A CHALLENGE GALLERY                                      */}
      {/* ========================================================================= */}
      {subView === 'challenges' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0C0C10] rounded-[2.5rem] p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Select a Challenge</h2>
                <p className="text-xs text-zinc-400">Choose an athletic challenge to load intervals</p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {(['All', 'Starter', 'Sweat Mode', 'Strength'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setChallengeFilter(tab)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                    challengeFilter === tab
                      ? 'bg-white text-black font-extrabold shadow-lg'
                      : 'bg-[#181822] text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Challenges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChallenges.map((challenge, idx) => (
                <div
                  key={challenge.id}
                  className="group relative bg-[#13131A] hover:bg-[#181822] rounded-[2rem] p-6 border border-white/10 hover:border-[#FF3B30]/40 transition-all duration-300 shadow-card flex flex-col justify-between overflow-hidden min-h-[260px]"
                >
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
                    </div>
                  </div>

                  <div className="relative z-10 pt-6 flex items-end justify-between">
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

                    <div className="w-20 h-20 opacity-40 group-hover:opacity-85 transition-all text-[#FF3B30] flex items-center justify-center">
                      {idx % 3 === 0 ? <Activity className="w-16 h-16 stroke-[1.2]" /> : idx % 3 === 1 ? <Flame className="w-16 h-16 stroke-[1.2]" /> : <Dumbbell className="w-16 h-16 stroke-[1.2]" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🧬 SUB-VIEW: BODY MAP HEATMAP                                             */}
      {/* ========================================================================= */}
      {subView === 'bodymap' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <BodyMapHeatmap
            onSelectExercise={(ex) => {
              handleAddExercise(ex);
              setSubView('workout');
            }}
            onStartMuscleWorkout={() => {
              startRoutine('push-day');
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🎯 SUB-VIEW: LONGEVITY & GAMIFICATION                                     */}
      {/* ========================================================================= */}
      {subView === 'milestones' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <GamificationHub />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📜 SUB-VIEW: SESSION HISTORY                                              */}
      {/* ========================================================================= */}
      {subView === 'history' && (
        <div className="bg-[#0C0C10] rounded-[2.5rem] p-6 sm:p-8 border border-white/10 shadow-card space-y-4 animate-in fade-in duration-200">
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
                      <span className="text-[10px] font-black uppercase text-[#FF3B30] bg-[#FF3B30]/10 px-2.5 py-0.5 rounded-full border border-[#FF3B30]/20 font-mono">
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
      )}

      {/* ========================================================================= */}
      {/* ⚡ SUB-VIEW: EVIDENCE-BACKED ATHLETIC FORMULATIONS & SUPPLEMENTS          */}
      {/* ========================================================================= */}
      {subView === 'supplements' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0C0C10] rounded-[2.5rem] p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="text-[10px] font-mono font-black uppercase text-[#FF3B30] tracking-widest block">
                  EVIDENCE-BASED PROTOCOLS
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Athletic Formulations & Ergogenic Matrix
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Peer-reviewed athletic nutrition formulations calibrated for hypertrophy, intra-workout hydration, and rapid CNS recovery.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-black flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Third-Party Tested</span>
                </span>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOSAIC_PRODUCTS_CATALOG.filter(p => 
                p.category.includes('Athletic') || p.category.includes('Recovery') || p.category.includes('Hydration')
              ).map((prod) => (
                <div
                  key={prod.id}
                  className="p-5 rounded-[2rem] bg-[#14141C] border border-white/10 hover:border-[#FF3B30]/40 transition space-y-4 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black uppercase text-[#FF3B30] bg-[#FF3B30]/10 px-2.5 py-0.5 rounded-full border border-[#FF3B30]/20">
                        {prod.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-zinc-400">
                        ₹{prod.sitePrice}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-white group-hover:text-[#FF3B30] transition">
                        {prod.product}
                      </h3>
                      <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                        <span>Key Actives & Dosing</span>
                        <span className="font-mono text-zinc-300">{prod.keyIngredients.join(' • ')}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                        <span>Clinical Advantage</span>
                        <span className="font-mono text-emerald-400 font-bold">{prod.clinicalAdvantage || 'Bio-enhanced formulation'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{prod.potencyBadge || 'Clinical Grade'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast(`Added ${prod.product} to your athletic protocol!`, 'success')}
                      className="px-4 py-1.5 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-black transition active:scale-95 shadow-md flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Protocol</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Clinical Evidence Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#181822] to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-zinc-300">
                  All athletic supplements adhere to clinical threshold dosing with published bio-availability trials.
                </span>
              </div>
              <button
                type="button"
                onClick={() => showToast('Displaying research references and clinical trials', 'info')}
                className="text-emerald-400 font-mono font-bold hover:underline shrink-0"
              >
                View Study References ›
              </button>
            </div>
          </div>
        </div>
      )}

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
