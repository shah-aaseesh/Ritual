import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Play, 
  Plus, 
  Trash2, 
  Check, 
  Timer, 
  History, 
  Sparkles
} from 'lucide-react';
import { MuscleGroup, WorkoutSet, ExerciseLog, WorkoutSession } from '../../types';
import { PRESET_EXERCISES, PRESET_ROUTINE_TEMPLATES, DEMO_WORKOUT_SESSIONS, ExerciseDefinition } from '../../data/gymData';
import { useApp } from '../../context/AppContext';

export const GymTrackerView: React.FC = () => {
  const { showToast } = useApp();

  // Active workout state
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);
  const [activeWorkoutTitle, setActiveWorkoutTitle] = useState<string>('Push Power Session');
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [activeExercises, setActiveExercises] = useState<ExerciseLog[]>([]);

  // Rest Timer State
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(0);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState<boolean>(false);

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
    if (isWorkoutActive && workoutStartTime) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - workoutStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, workoutStartTime]);

  // Rest timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRestTimerRunning && restSecondsRemaining > 0) {
      timer = setInterval(() => {
        setRestSecondsRemaining(prev => {
          if (prev <= 1) {
            setIsRestTimerRunning(false);
            showToast('⏰ Rest timer complete! Ready for next set.', 'info');
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
    const template = PRESET_ROUTINE_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

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
    setActiveExercises(initialExercises);
    setWorkoutStartTime(Date.now());
    setElapsedSeconds(0);
    setIsWorkoutActive(true);
    showToast(`🏋️ Started "${template.title}" workout!`, 'success');
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
            startRestTimer(90); // default 90s rest timer on complete
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

  // Finish workout & calculate PRs and volume
  const finishWorkout = () => {
    const totalVolume = activeExercises.reduce((acc, ex) => {
      return acc + ex.sets.reduce((sAcc, s) => s.isCompleted ? sAcc + (s.weightKg * s.reps) : sAcc, 0);
    }, 0);

    const completedSets = activeExercises.reduce((acc, ex) => {
      return acc + ex.sets.filter(s => s.isCompleted).length;
    }, 0);

    const session: WorkoutSession = {
      id: `session-${Date.now()}`,
      title: activeWorkoutTitle,
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
    showToast(`🎉 Workout complete! ${totalVolume.toLocaleString()} kg total volume lifted!`, 'success');
  };

  const filteredExercises = PRESET_EXERCISES.filter(ex => {
    const matchesGroup = selectedMuscleFilter === 'All' || ex.muscleGroup === selectedMuscleFilter;
    const matchesSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* ========================================================================= */}
      {/* 🏋️ GYM SUITE HERO HEADER                                                  */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black uppercase tracking-wider font-mono">
              HEALTH SUITE • GYM LOG
            </span>
            <span className="text-xs font-bold text-charcoal-400">Hevy-Grade Strength Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-950 tracking-tight mt-1">
            Workout & Strength Engine
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600">
            Log sets, reps, track progressive overload, and monitor 1RM personal records.
          </p>
        </div>

        {!isWorkoutActive && (
          <button
            type="button"
            onClick={() => startRoutine('push-day')}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-forest-950 to-forest-900 text-cream-50 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-card hover:scale-[1.02] active:scale-95 transition"
          >
            <Play className="w-4 h-4 fill-current text-mint-300" />
            <span>Start Quick Workout</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🔥 ACTIVE LIVE WORKOUT SESSION (IF ACTIVE)                                */}
      {/* ========================================================================= */}
      {isWorkoutActive && (
        <div className="rounded-3xl bg-forest-950 text-cream-50 p-5 sm:p-6 border border-emerald-500/30 shadow-2xl space-y-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent animate-shimmer-sweep pointer-events-none" />

          {/* Top Session HUD */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-black uppercase text-mint-300 tracking-widest font-mono">
                  LIVE SESSION IN PROGRESS
                </span>
              </div>
              <input
                type="text"
                value={activeWorkoutTitle}
                onChange={(e) => setActiveWorkoutTitle(e.target.value)}
                className="text-lg sm:text-xl font-black bg-transparent border-b border-transparent hover:border-white/30 focus:border-emerald-400 focus:outline-none text-white w-full"
              />
            </div>

            {/* Time & Action Controls */}
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-center font-mono">
                <span className="text-[9px] text-cream-400 block uppercase font-bold">Elapsed</span>
                <span className="text-sm font-black text-emerald-400">{formatTimer(elapsedSeconds)}</span>
              </div>

              <button
                type="button"
                onClick={finishWorkout}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-mint-400 text-forest-950 font-black text-xs shadow-soft hover:brightness-110 active:scale-95 transition"
              >
                Finish Session 🏁
              </button>
            </div>
          </div>

          {/* Rest Timer Floating Bar */}
          {restSecondsRemaining > 0 && (
            <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-between text-xs animate-pulse">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-cream-200">Rest Timer:</span>
                <span className="text-base font-black font-mono text-emerald-400">
                  {formatTimer(restSecondsRemaining)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => startRestTimer(restSecondsRemaining + 30)}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold"
                >
                  +30s
                </button>
                <button
                  type="button"
                  onClick={() => setRestSecondsRemaining(0)}
                  className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Active Exercises List */}
          <div className="space-y-4">
            {activeExercises.map((ex, exIdx) => (
              <div key={ex.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono">
                      #{exIdx + 1}
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-white">{ex.exerciseName}</h3>
                    <span className="text-[10px] font-bold text-cream-400 uppercase bg-white/5 px-2 py-0.5 rounded-full">
                      {ex.muscleGroup}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveExercises(prev => prev.filter(item => item.id !== ex.id))}
                    className="p-1 rounded-lg text-cream-400 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sets Table */}
                <div className="space-y-1.5">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-cream-400 uppercase px-2">
                    <div className="col-span-2 text-center">Set</div>
                    <div className="col-span-4 text-center">Weight (kg)</div>
                    <div className="col-span-4 text-center">Reps</div>
                    <div className="col-span-2 text-center">Done</div>
                  </div>

                  {ex.sets.map((set) => (
                    <div
                      key={set.id}
                      className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl text-xs transition ${
                        set.isCompleted ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-black/20'
                      }`}
                    >
                      <div className="col-span-2 text-center font-black font-mono text-cream-300">
                        {set.setNumber}
                      </div>

                      <div className="col-span-4">
                        <input
                          type="number"
                          value={set.weightKg}
                          onChange={(e) => updateSet(ex.id, set.id, 'weightKg', parseFloat(e.target.value) || 0)}
                          className="w-full text-center bg-black/40 border border-white/10 rounded-lg py-1 font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        />
                      </div>

                      <div className="col-span-4">
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSet(ex.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                          className="w-full text-center bg-black/40 border border-white/10 rounded-lg py-1 font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        />
                      </div>

                      <div className="col-span-2 flex justify-center">
                        <button
                          type="button"
                          onClick={() => toggleSetComplete(ex.id, set.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                            set.isCompleted
                              ? 'bg-emerald-500 text-forest-950 scale-105'
                              : 'bg-white/10 text-cream-400 hover:bg-white/20'
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
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Set</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-[10px] text-cream-400 font-mono">
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
                    <button
                      type="button"
                      onClick={() => startRestTimer(120)}
                      className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 font-bold"
                    >
                      120s
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setShowAddExerciseModal(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-white/20 hover:border-emerald-400/60 text-cream-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Exercise from Movement Library</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📋 PRESET WORKOUT ROUTINES                                                */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-forest-950 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Workout Routine Templates</span>
          </h2>
          <span className="text-xs text-charcoal-500 font-bold">4 Verified Splits</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_ROUTINE_TEMPLATES.map((routine) => (
            <div
              key={routine.id}
              className="p-4 rounded-3xl bg-white border border-cream-200 hover:border-forest-800 shadow-soft transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-forest-900 text-mint-300 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-forest-950 leading-snug">{routine.title}</h3>
                <p className="text-[11px] text-charcoal-500">
                  {routine.exerciseIds.length} compound & isolation movements
                </p>
              </div>

              <button
                type="button"
                onClick={() => startRoutine(routine.id)}
                className="w-full py-2 rounded-xl bg-cream-100 hover:bg-forest-900 hover:text-cream-50 text-forest-950 text-xs font-black flex items-center justify-center gap-1.5 transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Routine</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📊 RECENT WORKOUT HISTORY & PRs                                           */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-forest-950 flex items-center gap-2">
            <History className="w-4 h-4 text-forest-900" />
            <span>Workout History & Volume Logs</span>
          </h2>
          <span className="text-xs text-charcoal-500 font-mono font-bold">
            {workoutHistory.length} Sessions Logged
          </span>
        </div>

        {workoutHistory.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-cream-200 text-center text-xs text-charcoal-400">
            No completed workouts yet. Start a session above to track progressive overload!
          </div>
        ) : (
          <div className="space-y-3">
            {workoutHistory.map((session) => (
              <div
                key={session.id}
                className="p-4 sm:p-5 rounded-3xl bg-white border border-cream-200 shadow-soft space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cream-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {session.date} • {session.startTime}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-forest-950 mt-1">{session.title}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="px-3 py-1 rounded-xl bg-cream-100 text-forest-950 font-bold">
                      ⏱️ {session.durationMinutes} mins
                    </div>
                    <div className="px-3 py-1 rounded-xl bg-forest-900 text-mint-300 font-black">
                      ⚡ {session.totalVolumeKg.toLocaleString()} kg Total Volume
                    </div>
                  </div>
                </div>

                {/* Exercises in Session */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {session.exercises.map((ex) => (
                    <div key={ex.id} className="p-2.5 rounded-xl bg-cream-50 border border-cream-200 text-xs space-y-1">
                      <span className="font-black text-forest-950 block">{ex.exerciseName}</span>
                      <div className="flex items-center gap-1.5 text-[11px] text-charcoal-600 font-mono">
                        <span>{ex.sets.filter(s => s.isCompleted).length} sets</span>
                        <span>•</span>
                        <span>Max {Math.max(...ex.sets.map(s => s.weightKg), 0)} kg</span>
                      </div>
                    </div>
                  ))}
                </div>

                {session.notes && (
                  <p className="text-xs text-charcoal-600 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                    "{session.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🔎 ADD EXERCISE MODAL                                                     */}
      {/* ========================================================================= */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-cream-300 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-forest-950">Exercise Movement Library</h3>
                <p className="text-xs text-charcoal-500">Select an exercise to add to your live workout</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddExerciseModal(false)}
                className="p-1 rounded-full text-charcoal-400 hover:text-forest-900"
              >
                ✕
              </button>
            </div>

            {/* Muscle Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {(['All', 'Chest', 'Back', 'Quads', 'Hamstrings', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Cardio'] as const).map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setSelectedMuscleFilter(group)}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition ${
                    selectedMuscleFilter === group
                      ? 'bg-forest-900 text-cream-50'
                      : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search exercise name (e.g. Bench Press, Squat)..."
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs font-bold text-forest-950 focus:outline-none focus:ring-1 focus:ring-forest-900"
            />

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredExercises.map((def) => (
                <div
                  key={def.id}
                  onClick={() => handleAddExercise(def)}
                  className="p-3 rounded-2xl bg-cream-50 hover:bg-emerald-50 border border-cream-200 hover:border-emerald-300 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-forest-950">{def.name}</span>
                      <span className="text-[9px] font-bold text-charcoal-500 px-2 py-0.5 bg-white rounded-full border border-cream-200">
                        {def.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-500 mt-0.5">{def.instructions}</p>
                  </div>
                  <Plus className="w-4 h-4 text-emerald-700 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
