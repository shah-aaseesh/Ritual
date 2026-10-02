import React, { useState, useEffect, useMemo } from 'react';
import { 
  Dumbbell, 
  Plus, 
  Trash2, 
  Check, 
  History, 
  ArrowUpRight, 
  Activity, 
  ChevronRight,
  ChevronLeft,
  Award,
  Sparkles,
  Zap,
  ShieldCheck,
  RefreshCw,
  Layers,
  Calculator,
  Info,
  Clock,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MuscleGroup, WorkoutSet, ExerciseLog, WorkoutSession } from '../../types';
import { 
  PRESET_EXERCISES, 
  PRESET_ROUTINE_TEMPLATES, 
  DEMO_WORKOUT_SESSIONS, 
  ExerciseDefinition,
  EquipmentType
} from '../../data/gymData';
import { MOSAIC_PRODUCTS_CATALOG } from '../../data/mosaicProducts';
import { useApp } from '../../context/AppContext';
import { BodyMapHeatmap } from './BodyMapHeatmap';
import { GamificationHub } from './GamificationHub';

type GymSubView = 'hub' | 'workout' | 'generator' | 'challenges' | 'bodymap' | 'milestones' | 'history' | 'supplements';

export const GymTrackerView: React.FC = () => {
  const { showToast } = useApp();

  // Navigation Subview
  const [subView, setSubView] = useState<GymSubView>('hub');

  // ============================================================================
  // WORKOUT GENERATOR (Workout.cool Style Muscle & Equipment Picker)
  // ============================================================================
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroup[]>(['Chest', 'Triceps']);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'All'>('All');

  // ============================================================================
  // ACTIVE WORKOUT STATE
  // ============================================================================
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);
  const [activeWorkoutTitle, setActiveWorkoutTitle] = useState<string>('Custom Workout');
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeExercises, setActiveExercises] = useState<ExerciseLog[]>([]);

  // Rest Timer State
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(0);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState<boolean>(false);

  // Exercise Swap Modal State
  const [swapExerciseTarget, setSwapExerciseTarget] = useState<ExerciseLog | null>(null);

  // Plate Calculator Modal State
  const [plateCalcWeight, setPlateCalcWeight] = useState<number>(60);
  const [showPlateCalcModal, setShowPlateCalcModal] = useState<boolean>(false);

  // Exercise Picker Modal
  const [showAddExerciseModal, setShowAddExerciseModal] = useState<boolean>(false);
  const [exercisePickerMuscle, setExercisePickerMuscle] = useState<MuscleGroup | 'All'>('All');
  const [exercisePickerEquipment, setExercisePickerEquipment] = useState<EquipmentType | 'All'>('All');
  const [exerciseSearch, setExerciseSearch] = useState<string>('');

  // Finished Workout Summary Modal
  const [finishedSummary, setFinishedSummary] = useState<WorkoutSession | null>(null);

  // Form Cues Expanded Accordion (key: exerciseId)
  const [expandedCues, setExpandedCues] = useState<Record<string, boolean>>({});

  // Workout History
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>(() => {
    const saved = localStorage.getItem('ritual_workout_history');
    return saved ? JSON.parse(saved) : DEMO_WORKOUT_SESSIONS;
  });

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('ritual_workout_history', JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  // Elapsed workout stopwatch timer
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
            showToast('⏰ Rest complete! Time for the next set.', 'info');
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

  const addRestTime = (extraSeconds: number) => {
    setRestSecondsRemaining(prev => prev + extraSeconds);
    if (!isRestTimerRunning) {
      setIsRestTimerRunning(true);
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================================================
  // WORKOUT LAUNCHERS
  // ============================================================================

  // 1. Start Empty/Blank Workout
  const startEmptyWorkout = () => {
    setActiveWorkoutTitle('Quick Empty Workout');
    setActiveExercises([]);
    setWorkoutStartTime(Date.now());
    setElapsedSeconds(0);
    setIsPaused(false);
    setIsWorkoutActive(true);
    setSubView('workout');
    showToast('⚡ Started empty workout session! Add your first exercise below.', 'info');
  };

  // 2. Start from Preset Template (Push, Pull, Legs, etc.)
  const startRoutine = (templateId: string) => {
    const template = PRESET_ROUTINE_TEMPLATES.find(t => t.id === templateId) || PRESET_ROUTINE_TEMPLATES[0];

    const initialExercises: ExerciseLog[] = template.exerciseIds.map((exId, idx) => {
      const def = PRESET_EXERCISES.find(e => e.id === exId) || PRESET_EXERCISES[0];
      const sets: WorkoutSet[] = Array.from({ length: def.defaultSets }).map((_, sIdx) => ({
        id: `set-${Date.now()}-${idx}-${sIdx}`,
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
    setIsPaused(false);
    setIsWorkoutActive(true);
    setSubView('workout');
    showToast(`⚡ Loaded routine: ${template.title}`, 'success');
  };

  // 3. Generate Custom Routine from Selected Muscles & Equipment (Workout.cool feature)
  const generateCustomRoutine = () => {
    if (selectedMuscles.length === 0) {
      showToast('Please select at least 1 muscle group!', 'warning');
      return;
    }

    const matchedExercises = PRESET_EXERCISES.filter(ex => {
      const matchesMuscle = selectedMuscles.includes(ex.muscleGroup);
      const matchesEquip = selectedEquipment === 'All' || ex.equipment === selectedEquipment;
      return matchesMuscle && matchesEquip;
    });

    if (matchedExercises.length === 0) {
      showToast('No exercises match this muscle + equipment combo. Try selecting "All Equipment".', 'warning');
      return;
    }

    // Pick top 4-5 balanced movements
    const chosen = matchedExercises.slice(0, 5);
    const initialExercises: ExerciseLog[] = chosen.map((def, idx) => {
      const sets: WorkoutSet[] = Array.from({ length: def.defaultSets }).map((_, sIdx) => ({
        id: `set-${Date.now()}-${idx}-${sIdx}`,
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

    setActiveWorkoutTitle(`${selectedMuscles.join(' & ')} Blast`);
    setActiveExercises(initialExercises);
    setWorkoutStartTime(Date.now());
    setElapsedSeconds(0);
    setIsPaused(false);
    setIsWorkoutActive(true);
    setSubView('workout');
    showToast(`🎯 Generated custom ${selectedMuscles.join(' + ')} routine!`, 'success');
  };

  // ============================================================================
  // EXERCISE & SET MANAGEMENT
  // ============================================================================

  // Add Exercise to active workout
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
    showToast(`Added ${def.name}`, 'success');
  };

  // Swap exercise with an alternative
  const handleSwapExercise = (oldLogId: string, newDef: ExerciseDefinition) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.id !== oldLogId) return ex;
      return {
        ...ex,
        exerciseId: newDef.id,
        exerciseName: newDef.name,
        muscleGroup: newDef.muscleGroup,
        sets: ex.sets.map(s => ({
          ...s,
          weightKg: newDef.defaultWeightKg,
          reps: newDef.defaultReps
        }))
      };
    }));
    setSwapExerciseTarget(null);
    showToast(`Swapped to ${newDef.name}`, 'info');
  };

  // Toggle set complete & trigger rest timer
  const toggleSetComplete = (exerciseId: string, setId: string) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => {
          if (s.id !== setId) return s;
          const nextCompleted = !s.isCompleted;
          if (nextCompleted) {
            startRestTimer(90); // Auto 90s rest timer
          }
          return { ...s, isCompleted: nextCompleted };
        })
      };
    }));
  };

  // Fast adjust weight (stepper)
  const adjustWeight = (exerciseId: string, setId: string, delta: number) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => {
          if (s.id !== setId) return s;
          return { ...s, weightKg: Math.max(0, Math.round((s.weightKg + delta) * 10) / 10) };
        })
      };
    }));
  };

  // Fast adjust reps (stepper)
  const adjustReps = (exerciseId: string, setId: string, delta: number) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => {
          if (s.id !== setId) return s;
          return { ...s, reps: Math.max(1, s.reps + delta) };
        })
      };
    }));
  };

  // Direct set weight/reps input
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

  // Smart Add Set (Auto duplicates last set's weight & reps)
  const addSetToExercise = (exerciseId: string) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet: WorkoutSet = {
        id: `set-${Date.now()}-${ex.sets.length + 1}`,
        setNumber: ex.sets.length + 1,
        weightKg: lastSet ? lastSet.weightKg : 20,
        reps: lastSet ? lastSet.reps : 10,
        isCompleted: false
      };
      return { ...ex, sets: [...ex.sets, newSet] };
    }));
  };

  // Remove set from exercise
  const removeSetFromExercise = (exerciseId: string, setId: string) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      if (ex.sets.length <= 1) return ex;
      const filtered = ex.sets.filter(s => s.id !== setId);
      return {
        ...ex,
        sets: filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }))
      };
    }));
  };

  // Finish Workout & show summary modal
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
    setFinishedSummary(session);
    showToast(`🏁 Workout Complete! ${totalVolume.toLocaleString()} kg lifted!`, 'success');
  };

  // ============================================================================
  // DERIVED METRICS
  // ============================================================================
  const liveTotalVolume = useMemo(() => {
    return activeExercises.reduce((acc, ex) => {
      return acc + ex.sets.reduce((sAcc, s) => s.isCompleted ? sAcc + (s.weightKg * s.reps) : sAcc, 0);
    }, 0);
  }, [activeExercises]);

  const liveCompletedSets = useMemo(() => {
    return activeExercises.reduce((acc, ex) => {
      return acc + ex.sets.filter(s => s.isCompleted).length;
    }, 0);
  }, [activeExercises]);

  const liveTotalSets = useMemo(() => {
    return activeExercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  }, [activeExercises]);

  // Plate Calculator computation
  const plateBreakdown = useMemo(() => {
    const barWeight = 20; // standard Olympic barbell
    const targetPerSide = Math.max(0, (plateCalcWeight - barWeight) / 2);
    const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    
    let remaining = targetPerSide;
    const plates: { plate: number; count: number }[] = [];

    for (const p of availablePlates) {
      if (remaining >= p) {
        const count = Math.floor(remaining / p);
        plates.push({ plate: p, count });
        remaining -= count * p;
      }
    }

    return {
      barWeight,
      perSide: targetPerSide,
      plates,
      exactMatch: remaining === 0
    };
  }, [plateCalcWeight]);

  // Muscle toggle in Generator
  const toggleMuscle = (muscle: MuscleGroup) => {
    setSelectedMuscles(prev => {
      if (prev.includes(muscle)) {
        return prev.filter(m => m !== muscle);
      } else {
        return [...prev, muscle];
      }
    });
  };

  // Filtered exercises for picker modal
  const pickerExercises = useMemo(() => {
    return PRESET_EXERCISES.filter(ex => {
      const matchesMuscle = exercisePickerMuscle === 'All' || ex.muscleGroup === exercisePickerMuscle;
      const matchesEquip = exercisePickerEquipment === 'All' || ex.equipment === exercisePickerEquipment;
      const matchesSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase());
      return matchesMuscle && matchesEquip && matchesSearch;
    });
  }, [exercisePickerMuscle, exercisePickerEquipment, exerciseSearch]);

  const allMuscles: MuscleGroup[] = ['Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Biceps', 'Triceps', 'Core', 'Cardio'];
  const allEquipments: (EquipmentType | 'All')[] = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight'];

  return (
    <div className="space-y-6 pb-28 text-charcoal-900">
      {/* ========================================================================= */}
      {/* 🧭 TOP NAVIGATION BAR                                                      */}
      {/* ========================================================================= */}
      {subView !== 'hub' && (
        <div className="flex items-center justify-between bg-white p-3.5 sm:p-4 rounded-3xl border border-mint-200/80 shadow-card">
          <button
            type="button"
            onClick={() => setSubView('hub')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mint-100 hover:bg-mint-200 text-xs font-black text-forest-900 transition active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Athletic Hub</span>
          </button>

          <span className="text-xs font-mono font-black uppercase text-forest-950 tracking-wider">
            {subView === 'workout' && '⚡ Active Session HUD'}
            {subView === 'generator' && '🎯 Custom Muscle Builder'}
            {subView === 'challenges' && '🏆 Science-Backed Splits'}
            {subView === 'bodymap' && '🧬 Muscle Heatmap'}
            {subView === 'milestones' && '🎯 Longevity Objectives'}
            {subView === 'supplements' && '⚡ Ergogenic Formulations'}
            {subView === 'history' && '📜 Workout Session Logs'}
          </span>

          <div className="flex items-center gap-1.5">
            {isWorkoutActive && subView !== 'workout' && (
              <button
                type="button"
                onClick={() => setSubView('workout')}
                className="px-3 py-1.5 rounded-full bg-forest-900 text-white text-xs font-black flex items-center gap-1.5 animate-pulse shadow-soft"
              >
                <Activity className="w-3.5 h-3.5 text-mint-400" />
                <span>Resume HUD</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏠 MAIN ATHLETIC HUB (CLEAN, MODULAR & INTUITIVE)                         */}
      {/* ========================================================================= */}
      {subView === 'hub' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Live Workout Banner if Active */}
          {isWorkoutActive && (
            <div 
              onClick={() => setSubView('workout')}
              className="p-5 rounded-[2.5rem] bg-gradient-to-r from-mint-50 via-white to-mint-50 border-2 border-mint-400 shadow-card flex items-center justify-between cursor-pointer group hover:border-mint-600 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-forest-900 text-mint-300 flex items-center justify-center font-mono font-black shadow-md animate-pulse">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-mint-500 animate-ping" />
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-forest-700">
                      Workout In Progress
                    </span>
                  </div>
                  <h3 className="text-base font-black text-forest-950">
                    {activeWorkoutTitle}
                  </h3>
                  <p className="text-xs text-charcoal-600 font-mono mt-0.5">
                    ⏱️ {formatTimer(elapsedSeconds)} • {liveCompletedSets}/{liveTotalSets} sets • {liveTotalVolume.toLocaleString()} kg
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 rounded-full bg-forest-900 text-white font-black text-xs group-hover:bg-forest-800 transition shadow-soft flex items-center gap-1">
                <span>Resume</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Hero Action: Quick Start vs Generate Custom Routine */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-mint-200/80 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-black uppercase text-forest-700 tracking-widest block">
                  SCIENCE-BASED PERFORMANCE
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-forest-950 tracking-tight mt-0.5">
                  Workout & Strength Tracker
                </h1>
                <p className="text-xs text-charcoal-600 mt-1 max-w-xl">
                  Log sets effortlessly with smart steppers, automated rest timers, and custom muscle targeting.
                </p>
              </div>

              {/* Instant 1-Tap Start Empty Workout */}
              <button
                type="button"
                onClick={startEmptyWorkout}
                className="px-6 py-3 rounded-2xl bg-forest-900 hover:bg-forest-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-soft transition active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4 text-mint-300 stroke-[3]" />
                <span>Quick Empty Workout</span>
              </button>
            </div>

            {/* Quick Launch Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Tile 1: Workout.cool Style Muscle Routine Generator */}
              <div
                onClick={() => setSubView('generator')}
                className="p-6 rounded-[2rem] bg-gradient-to-br from-mint-50/80 via-white to-mint-50/30 border border-mint-200/90 hover:border-mint-400 transition-all cursor-pointer shadow-soft hover:shadow-card group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-mint-100 text-forest-900 flex items-center justify-center group-hover:scale-105 transition-transform border border-mint-200">
                    <Sparkles className="w-6 h-6 text-mint-700" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase text-mint-700 tracking-wider">
                      Interactive Generator
                    </span>
                    <h3 className="text-lg font-black text-forest-950 mt-0.5">
                      Target Specific Muscles
                    </h3>
                    <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                      Select target muscle groups & available equipment to build a custom routine instantly.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center gap-1.5 text-xs font-extrabold text-forest-900 group-hover:text-mint-700 transition">
                  <span>Build Custom Routine</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Tile 2: Pre-Built Curated Splits */}
              <div
                onClick={() => setSubView('challenges')}
                className="p-6 rounded-[2rem] bg-white hover:bg-cream-50/50 border border-mint-200/80 hover:border-mint-400 transition-all cursor-pointer shadow-soft hover:shadow-card group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-cream-50 text-forest-900 flex items-center justify-center group-hover:scale-105 transition-transform border border-mint-200">
                    <Layers className="w-6 h-6 text-forest-800" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase text-forest-700 tracking-wider">
                      Hypertrophy Splits
                    </span>
                    <h3 className="text-lg font-black text-forest-950 mt-0.5">
                      Push / Pull / Legs
                    </h3>
                    <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                      Calibrated exercise splits designed for progressive overload and optimal volume.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center gap-1.5 text-xs font-extrabold text-forest-900 group-hover:text-mint-700 transition">
                  <span>Browse Routines</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Tile 3: Anatomical Heatmap & Readiness */}
              <div
                onClick={() => setSubView('bodymap')}
                className="p-6 rounded-[2rem] bg-white hover:bg-cream-50/50 border border-mint-200/80 hover:border-mint-400 transition-all cursor-pointer shadow-soft hover:shadow-card group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-cream-50 text-forest-900 flex items-center justify-center group-hover:scale-105 transition-transform border border-mint-200">
                    <Activity className="w-6 h-6 text-teal-700" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase text-teal-700 tracking-wider">
                      Visual Readiness
                    </span>
                    <h3 className="text-lg font-black text-forest-950 mt-0.5">
                      Body Heatmap & Recovery
                    </h3>
                    <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                      Interactive anatomical diagram highlighting trained muscle volume and rest status.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center gap-1.5 text-xs font-extrabold text-forest-900 group-hover:text-mint-700 transition">
                  <span>View Body Map</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats & Session History Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setSubView('history')}
              className="p-5 rounded-[2rem] bg-white hover:bg-mint-50/30 border border-mint-200/80 flex items-center justify-between cursor-pointer transition shadow-soft group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-mint-100 flex items-center justify-center text-forest-900">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-forest-950">Workout History & PRs</h4>
                  <p className="text-xs text-charcoal-600 font-mono mt-0.5">
                    {workoutHistory.length} completed sessions logged
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-charcoal-400 group-hover:text-forest-900 group-hover:translate-x-1 transition" />
            </div>

            <div
              onClick={() => setSubView('supplements')}
              className="p-5 rounded-[2rem] bg-white hover:bg-mint-50/30 border border-mint-200/80 flex items-center justify-between cursor-pointer transition shadow-soft group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-mint-100 flex items-center justify-center text-forest-900">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-forest-950">Athletic Nutrition & Formulations</h4>
                  <p className="text-xs text-charcoal-600 font-mono mt-0.5">
                    Creapure®, Electrolytes & Native Whey
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-charcoal-400 group-hover:text-forest-900 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🎯 SUB-VIEW: WORKOUT.COOL STYLE INTERACTIVE ROUTINE GENERATOR             */}
      {/* ========================================================================= */}
      {subView === 'generator' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-mint-200/80 shadow-card space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase text-forest-700 tracking-wider">
                  WORKOUT.COOL ALGORITHM
                </span>
                <span className="px-2 py-0.5 rounded-full bg-mint-100 text-forest-800 text-[9px] font-black uppercase font-mono">
                  Smart Builder
                </span>
              </div>
              <h2 className="text-2xl font-black text-forest-950">
                Generate Custom Workout
              </h2>
              <p className="text-xs text-charcoal-600">
                Choose the target muscles you want to train and filter by available equipment.
              </p>
            </div>

            {/* Step 1: Select Target Muscles */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-black uppercase tracking-wider text-forest-950 font-mono block">
                1. Select Target Muscle Groups:
              </label>
              <div className="flex flex-wrap gap-2">
                {allMuscles.map(m => {
                  const isSelected = selectedMuscles.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMuscle(m)}
                      className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 active:scale-95 ${
                        isSelected
                          ? 'bg-forest-900 text-white shadow-soft ring-2 ring-forest-900/20'
                          : 'bg-cream-50 text-charcoal-700 hover:bg-mint-100 hover:text-forest-900 border border-mint-200'
                      }`}
                    >
                      <span>{m}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-mint-300 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Equipment */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-black uppercase tracking-wider text-forest-950 font-mono block">
                2. Filter by Available Equipment:
              </label>
              <div className="flex flex-wrap gap-2">
                {allEquipments.map(eq => (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => setSelectedEquipment(eq)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                      selectedEquipment === eq
                        ? 'bg-mint-200 text-forest-950 font-black border border-mint-400 shadow-soft'
                        : 'bg-cream-50 text-charcoal-600 hover:bg-mint-50 border border-mint-100'
                    }`}
                  >
                    {eq}
                  </button>
                ))}
              </div>
            </div>

            {/* Generation Preview Banner & CTA */}
            <div className="p-5 rounded-2xl bg-cream-50/70 border border-mint-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-black text-forest-950">
                  Targeting: {selectedMuscles.length > 0 ? selectedMuscles.join(' • ') : 'None selected'}
                </span>
                <p className="text-[11px] text-charcoal-600 font-mono">
                  Equipment: {selectedEquipment} • Calibrated for hypertrophy & strength
                </p>
              </div>

              <button
                type="button"
                onClick={generateCustomRoutine}
                disabled={selectedMuscles.length === 0}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-forest-900 hover:bg-forest-800 disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-soft transition active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-mint-300" />
                <span>Launch Generated Workout ›</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚡ SUB-VIEW: ACTIVE WORKOUT HUD & SET LOGGER (STREAMLINED & POWERFUL)       */}
      {/* ========================================================================= */}
      {subView === 'workout' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Sticky Session Control Bar */}
          <div className="bg-white rounded-[2.5rem] p-5 sm:p-6 border border-mint-200/80 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mint-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full bg-mint-500 animate-pulse shrink-0" />
                <div>
                  <span className="text-[10px] font-mono font-black uppercase text-forest-700 tracking-wider block">
                    LIVE LOGGING HUD
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-forest-950 leading-tight">
                    {activeWorkoutTitle}
                  </h2>
                </div>
              </div>

              {/* Top Controls: Plate Calc, Pause & Finish */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowPlateCalcModal(true)}
                  className="px-3 py-1.5 rounded-full bg-cream-50 hover:bg-mint-100 text-charcoal-800 border border-mint-200 font-bold text-xs flex items-center gap-1.5 transition"
                  title="Open Barbell Plate Calculator"
                >
                  <Calculator className="w-3.5 h-3.5 text-forest-800" />
                  <span className="hidden sm:inline">Plate Calc</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPaused(prev => !prev)}
                  className="px-3 py-1.5 rounded-full bg-cream-50 hover:bg-mint-100 text-charcoal-800 border border-mint-200 font-mono font-bold text-xs transition"
                >
                  {isPaused ? '▶ Resume' : '⏸ Pause'}
                </button>

                <button
                  type="button"
                  onClick={finishWorkout}
                  className="px-4 py-1.5 rounded-full bg-forest-900 text-white hover:bg-forest-800 font-black text-xs transition active:scale-95 shadow-soft flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-mint-300" />
                  <span>Finish Workout</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-cream-50/70 p-3 rounded-2xl border border-mint-100 text-center">
                <span className="text-[10px] font-bold text-charcoal-500 uppercase font-mono block">
                  Elapsed Time
                </span>
                <span className="text-lg sm:text-xl font-black text-forest-950 font-mono">
                  {formatTimer(elapsedSeconds)}
                </span>
              </div>

              <div className="bg-cream-50/70 p-3 rounded-2xl border border-mint-100 text-center">
                <span className="text-[10px] font-bold text-charcoal-500 uppercase font-mono block">
                  Volume Lifted
                </span>
                <span className="text-lg sm:text-xl font-black text-forest-950 font-mono">
                  {liveTotalVolume.toLocaleString()} <span className="text-xs font-normal">kg</span>
                </span>
              </div>

              <div className="bg-cream-50/70 p-3 rounded-2xl border border-mint-100 text-center">
                <span className="text-[10px] font-bold text-charcoal-500 uppercase font-mono block">
                  Completed Sets
                </span>
                <span className="text-lg sm:text-xl font-black text-forest-950 font-mono">
                  {liveCompletedSets} <span className="text-xs text-charcoal-500 font-normal">/ {liveTotalSets}</span>
                </span>
              </div>
            </div>

            {/* Smart Floating Rest Timer Banner (Integrated) */}
            {isRestTimerRunning && (
              <div className="p-3.5 rounded-2xl bg-mint-100/90 border border-mint-300 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-forest-900 text-white flex items-center justify-center font-mono font-black text-xs">
                    <Clock className="w-4 h-4 text-mint-300 animate-spin" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase text-forest-800 block">
                      Active Rest Interval
                    </span>
                    <span className="text-base font-black text-forest-950 font-mono">
                      {formatTimer(restSecondsRemaining)} remaining
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => addRestTime(30)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-mint-200 text-forest-900 font-bold border border-mint-200 transition"
                  >
                    +30s
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRestTimerRunning(false)}
                    className="px-2.5 py-1 rounded-lg bg-forest-900 text-white font-bold transition"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Exercise List */}
          <div className="space-y-4">
            {activeExercises.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] p-10 border border-mint-200/80 shadow-card text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-mint-50 text-forest-800 flex items-center justify-center mx-auto border border-mint-200">
                  <Dumbbell className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-forest-950">No movements added yet</h3>
                  <p className="text-xs text-charcoal-600 mt-1">
                    Tap the button below to pick your first exercise from our database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddExerciseModal(true)}
                  className="px-6 py-3 rounded-2xl bg-forest-900 text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 shadow-soft hover:bg-forest-800 transition"
                >
                  <Plus className="w-4 h-4 text-mint-300 stroke-[3]" />
                  <span>Add First Exercise</span>
                </button>
              </div>
            ) : (
              activeExercises.map((ex, exIdx) => {
                const def = PRESET_EXERCISES.find(e => e.id === ex.exerciseId);
                const isCuesOpen = !!expandedCues[ex.id];

                return (
                  <div 
                    key={ex.id}
                    className="bg-white rounded-[2rem] p-5 sm:p-6 border border-mint-200/80 shadow-card space-y-4"
                  >
                    {/* Exercise Card Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-mint-100 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black px-2 py-0.5 rounded-md bg-mint-100 text-forest-900 font-mono border border-mint-200">
                            #{exIdx + 1}
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-forest-950">
                            {ex.exerciseName}
                          </h3>
                          <span className="text-[10px] font-bold text-forest-800 bg-cream-50 px-2 py-0.5 rounded-full font-mono border border-mint-100">
                            {ex.muscleGroup}
                          </span>
                          {def && (
                            <span className="text-[10px] font-bold text-charcoal-500 bg-cream-50 px-2 py-0.5 rounded-full font-mono border border-mint-100">
                              {def.equipment}
                            </span>
                          )}
                        </div>

                        {/* Expandable Coach Cues */}
                        {def?.cues && def.cues.length > 0 && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setExpandedCues(prev => ({ ...prev, [ex.id]: !prev[ex.id] }))}
                              className="text-[11px] font-bold text-forest-800 hover:text-forest-950 flex items-center gap-1 transition"
                            >
                              <Info className="w-3.5 h-3.5 text-mint-600" />
                              <span>Form Cues & Technique</span>
                              {isCuesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>

                            {isCuesOpen && (
                              <div className="mt-2 p-3 rounded-xl bg-cream-50/80 border border-mint-100 text-xs space-y-1 text-charcoal-700 animate-in fade-in">
                                <p className="font-semibold text-forest-950">{def.instructions}</p>
                                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-charcoal-600">
                                  {def.cues.map((cue, cIdx) => (
                                    <li key={cIdx}>{cue}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Top Action Buttons (Swap Alternative, Delete) */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSwapExerciseTarget(ex)}
                          className="p-2 rounded-xl bg-cream-50 hover:bg-mint-100 text-charcoal-700 border border-mint-100 transition"
                          title="Swap with Alternative Exercise"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-forest-800" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveExercises(prev => prev.filter(item => item.id !== ex.id))}
                          className="p-2 rounded-xl bg-cream-50 hover:bg-rose-50 text-charcoal-400 hover:text-rose-600 border border-mint-100 transition"
                          title="Delete Exercise"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Sets Logging Table */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-12 gap-2 text-[10px] font-black text-charcoal-500 uppercase px-2 font-mono">
                        <div className="col-span-2 text-center">Set</div>
                        <div className="col-span-4 text-center">Weight (kg)</div>
                        <div className="col-span-4 text-center">Reps</div>
                        <div className="col-span-2 text-center">Done</div>
                      </div>

                      {ex.sets.map((set) => (
                        <div
                          key={set.id}
                          className={`grid grid-cols-12 gap-2 items-center p-2 rounded-2xl text-xs transition-all ${
                            set.isCompleted 
                              ? 'bg-mint-100/90 border border-mint-300 shadow-sm' 
                              : 'bg-cream-50/80 border border-mint-100'
                          }`}
                        >
                          {/* Set Number */}
                          <div className="col-span-2 text-center font-black font-mono text-forest-950 flex items-center justify-center gap-1">
                            <span>{set.setNumber}</span>
                            {ex.sets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSetFromExercise(ex.id, set.id)}
                                className="text-[10px] text-charcoal-400 hover:text-rose-500 opacity-60 hover:opacity-100"
                                title="Remove set"
                              >
                                ×
                              </button>
                            )}
                          </div>

                          {/* Weight Stepper & Input */}
                          <div className="col-span-4 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => adjustWeight(ex.id, set.id, -2.5)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-mint-200 text-charcoal-700 font-bold flex items-center justify-center border border-mint-200 shrink-0 text-xs"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="0.5"
                              value={set.weightKg}
                              onChange={(e) => updateSet(ex.id, set.id, 'weightKg', parseFloat(e.target.value) || 0)}
                              className="w-full text-center bg-white border border-mint-200 rounded-lg py-1 font-mono font-bold text-forest-950 focus:outline-none focus:ring-2 focus:ring-mint-500 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => adjustWeight(ex.id, set.id, +2.5)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-mint-200 text-charcoal-700 font-bold flex items-center justify-center border border-mint-200 shrink-0 text-xs"
                            >
                              +
                            </button>
                          </div>

                          {/* Reps Stepper & Input */}
                          <div className="col-span-4 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => adjustReps(ex.id, set.id, -1)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-mint-200 text-charcoal-700 font-bold flex items-center justify-center border border-mint-200 shrink-0 text-xs"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={set.reps}
                              onChange={(e) => updateSet(ex.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                              className="w-full text-center bg-white border border-mint-200 rounded-lg py-1 font-mono font-bold text-forest-950 focus:outline-none focus:ring-2 focus:ring-mint-500 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => adjustReps(ex.id, set.id, +1)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-mint-200 text-charcoal-700 font-bold flex items-center justify-center border border-mint-200 shrink-0 text-xs"
                            >
                              +
                            </button>
                          </div>

                          {/* 1-Tap Completion Button */}
                          <div className="col-span-2 flex justify-center">
                            <button
                              type="button"
                              onClick={() => toggleSetComplete(ex.id, set.id)}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                set.isCompleted
                                  ? 'bg-forest-900 text-white scale-105 shadow-soft'
                                  : 'bg-white text-charcoal-400 hover:bg-mint-200 hover:text-forest-900 border border-mint-200'
                              }`}
                              title={set.isCompleted ? 'Completed' : 'Mark Done'}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Row: + Add Set & Rest Presets */}
                    <div className="flex items-center justify-between pt-2 border-t border-mint-100">
                      <button
                        type="button"
                        onClick={() => addSetToExercise(ex.id)}
                        className="px-3 py-1.5 rounded-xl bg-mint-100 hover:bg-mint-200 text-forest-900 font-bold text-xs flex items-center gap-1.5 transition border border-mint-200"
                      >
                        <Plus className="w-3.5 h-3.5 text-forest-900" />
                        <span>Add Set (Auto-Copy)</span>
                      </button>

                      <div className="flex items-center gap-1 text-[10px] text-charcoal-500 font-mono">
                        <span className="hidden sm:inline">Rest:</span>
                        <button
                          type="button"
                          onClick={() => startRestTimer(60)}
                          className="px-2 py-0.5 rounded-md bg-cream-50 hover:bg-mint-100 text-charcoal-700 font-bold border border-mint-200"
                        >
                          60s
                        </button>
                        <button
                          type="button"
                          onClick={() => startRestTimer(90)}
                          className="px-2 py-0.5 rounded-md bg-cream-50 hover:bg-mint-100 text-charcoal-700 font-bold border border-mint-200"
                        >
                          90s
                        </button>
                        <button
                          type="button"
                          onClick={() => startRestTimer(120)}
                          className="px-2 py-0.5 rounded-md bg-cream-50 hover:bg-mint-100 text-charcoal-700 font-bold border border-mint-200"
                        >
                          2m
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Big Add Movement Button */}
            <button
              type="button"
              onClick={() => setShowAddExerciseModal(true)}
              className="w-full py-4 rounded-3xl bg-white hover:bg-mint-50/50 border-2 border-dashed border-mint-300 hover:border-mint-500 text-forest-900 font-black text-sm flex items-center justify-center gap-2 transition shadow-soft"
            >
              <Plus className="w-5 h-5 text-forest-800" />
              <span>Add Another Movement</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏆 SUB-VIEW: CURATED HYPERTROPHY ROUTINE SPLITS                            */}
      {/* ========================================================================= */}
      {subView === 'challenges' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-mint-200/80 shadow-card space-y-6">
            <div>
              <span className="text-[10px] font-mono font-black uppercase text-forest-700 tracking-wider block">
                SCIENCE-BACKED PROTOCOLS
              </span>
              <h2 className="text-2xl font-black text-forest-950 mt-0.5">
                Curated Hypertrophy Splits
              </h2>
              <p className="text-xs text-charcoal-600">
                Choose a pre-structured routine calibrated with prime movements and optimal volume.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRESET_ROUTINE_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="p-6 rounded-[2rem] bg-cream-50/70 border border-mint-200/80 hover:border-mint-400 transition-all shadow-soft flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black uppercase text-forest-800 bg-mint-100 px-2.5 py-0.5 rounded-full border border-mint-200">
                        {tmpl.subtitle}
                      </span>
                      <span className="text-xs font-mono font-bold text-charcoal-600">
                        ⏱️ {tmpl.durationMinutes}m
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-forest-950 group-hover:text-forest-800 transition">
                      {tmpl.title}
                    </h3>

                    <div className="pt-2 space-y-1">
                      <span className="text-[10px] font-mono font-black uppercase text-charcoal-500 block">
                        Included Movements ({tmpl.exerciseIds.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {tmpl.exerciseIds.map(eId => {
                          const e = PRESET_EXERCISES.find(x => x.id === eId);
                          return (
                            <span key={eId} className="text-[10px] bg-white px-2 py-0.5 rounded-md text-forest-900 border border-mint-100 font-medium">
                              {e?.name || eId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => startRoutine(tmpl.id)}
                    className="w-full py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-black text-xs transition active:scale-95 flex items-center justify-center gap-1.5 shadow-soft"
                  >
                    <span>Start This Split</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
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
      {/* 🎯 SUB-VIEW: LONGEVITY OBJECTIVES & GAMIFICATION                          */}
      {/* ========================================================================= */}
      {subView === 'milestones' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <GamificationHub />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📜 SUB-VIEW: SESSION HISTORY & VOLUME TRACKER                             */}
      {/* ========================================================================= */}
      {subView === 'history' && (
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-mint-200/80 shadow-card space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-mint-100 pb-4">
            <div>
              <span className="text-[10px] font-mono font-black uppercase text-forest-700 tracking-wider block">
                PERFORMANCE LOGBOOK
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-forest-950 mt-0.5">
                Workout Session Logs
              </h2>
            </div>
            <span className="text-xs text-charcoal-600 font-mono font-bold bg-mint-100 px-3 py-1 rounded-full border border-mint-200">
              {workoutHistory.length} Recorded
            </span>
          </div>

          {workoutHistory.length === 0 ? (
            <div className="p-10 rounded-2xl bg-cream-50/70 border border-mint-100 text-center text-xs text-charcoal-600">
              No completed workouts yet. Launch a session to start tracking!
            </div>
          ) : (
            <div className="space-y-3">
              {workoutHistory.map((session) => (
                <div
                  key={session.id}
                  className="p-5 rounded-2xl bg-cream-50/70 border border-mint-100 hover:border-mint-300 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-mint-200/60 pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase text-forest-800 bg-mint-100 px-2.5 py-0.5 rounded-full border border-mint-200 font-mono">
                        {session.date} • {session.startTime}
                      </span>
                      <h3 className="text-base font-black text-forest-950 mt-1">{session.title}</h3>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <div className="px-3 py-1 rounded-xl bg-white border border-mint-100 text-charcoal-800 font-bold shadow-soft">
                        ⏱️ {session.durationMinutes} mins
                      </div>
                      <div className="px-3 py-1 rounded-xl bg-mint-100 text-forest-900 border border-mint-200 font-black">
                        ⚡ {session.totalVolumeKg.toLocaleString()} kg Lifted
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {session.exercises.map((ex) => (
                      <div key={ex.id} className="p-2.5 rounded-xl bg-white border border-mint-100 text-xs space-y-1">
                        <span className="font-black text-forest-950 block">{ex.exerciseName}</span>
                        <div className="flex items-center gap-1.5 text-[11px] text-charcoal-500 font-mono">
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
      {/* ⚡ SUB-VIEW: ATHLETIC SUPPLEMENTS & EVIDENCE-BACKED FORMULATIONS          */}
      {/* ========================================================================= */}
      {subView === 'supplements' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-mint-200/80 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mint-100 pb-5">
              <div>
                <span className="text-[10px] font-mono font-black uppercase text-forest-700 tracking-widest block">
                  ERGOGENIC AIDS
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-forest-950 mt-1">
                  Athletic Formulations & Kinetic Dosage
                </h2>
                <p className="text-xs text-charcoal-600 mt-0.5">
                  Peer-reviewed sports nutrition calibrated for hypertrophy, power output, and rapid CNS recovery.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-mint-100 border border-mint-200 text-forest-800 text-xs font-mono font-black flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-mint-600" />
                  <span>100% Informed Choice Certified</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOSAIC_PRODUCTS_CATALOG.filter(p => 
                p.category.includes('Athletic') || p.category.includes('Recovery') || p.category.includes('Hydration')
              ).map((prod) => (
                <div
                  key={prod.id}
                  className="p-5 rounded-[2rem] bg-cream-50/70 border border-mint-200/80 hover:border-mint-400 transition space-y-4 flex flex-col justify-between group shadow-soft"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black uppercase text-forest-800 bg-mint-100 px-2.5 py-0.5 rounded-full border border-mint-200">
                        {prod.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-forest-900">
                        ₹{prod.sitePrice}
                      </span>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="w-16 h-16 rounded-2xl bg-white border border-mint-200 shrink-0 overflow-hidden relative flex items-center justify-center">
                        {prod.imageUrl && (
                          <img
                            src={prod.imageUrl}
                            alt={prod.product}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-black text-forest-950 group-hover:text-forest-800 transition leading-tight">
                          {prod.product}
                        </h3>
                        <p className="text-xs text-charcoal-600 mt-1 leading-relaxed line-clamp-2">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-mint-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-charcoal-600 text-[11px]">
                        <span>Key Actives</span>
                        <span className="font-mono text-forest-950 font-bold">{prod.keyIngredients.join(' • ')}</span>
                      </div>
                      <div className="flex items-center justify-between text-charcoal-600 text-[11px]">
                        <span>Clinical Advantage</span>
                        <span className="font-mono text-mint-700 font-bold">{prod.clinicalAdvantage || 'Bio-enhanced matrix'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-mint-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-charcoal-600">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{prod.potencyBadge || 'Clinical Grade'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast(`Added ${prod.product} to your athletic protocol!`, 'success')}
                      className="px-4 py-1.5 rounded-full bg-forest-900 text-white hover:bg-forest-800 text-xs font-black transition active:scale-95 shadow-soft flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Protocol</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔎 MODAL 1: ADD EXERCISE PICKER MODAL                                     */}
      {/* ========================================================================= */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-6 shadow-modal border border-mint-200 space-y-4 max-h-[85vh] flex flex-col text-charcoal-900">
            <div className="flex items-center justify-between border-b border-mint-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-forest-950">Movement Database</h3>
                <p className="text-xs text-charcoal-600">Select an exercise to add to your live workout</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddExerciseModal(false)}
                className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-700 bg-cream-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Muscle Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {(['All', ...allMuscles] as const).map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setExercisePickerMuscle(group)}
                  className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition ${
                    exercisePickerMuscle === group
                      ? 'bg-forest-900 text-white'
                      : 'bg-cream-50 text-charcoal-600 hover:bg-mint-100 hover:text-forest-900 border border-mint-100'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            {/* Equipment Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
              {allEquipments.map((eq) => (
                <button
                  key={eq}
                  type="button"
                  onClick={() => setExercisePickerEquipment(eq)}
                  className={`px-2.5 py-0.5 rounded-md font-medium whitespace-nowrap transition ${
                    exercisePickerEquipment === eq
                      ? 'bg-mint-200 text-forest-950 font-bold border border-mint-400'
                      : 'bg-cream-50 text-charcoal-500 border border-mint-100'
                  }`}
                >
                  {eq}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search movement (e.g. Bench Press, Squat, Lat Pulldown)..."
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              className="w-full p-3 rounded-xl bg-cream-50 border border-mint-200 text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-mint-500"
            />

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {pickerExercises.length === 0 ? (
                <div className="p-6 text-center text-xs text-charcoal-500">
                  No exercises matched your search. Try changing the filters.
                </div>
              ) : (
                pickerExercises.map((def) => (
                  <div
                    key={def.id}
                    onClick={() => handleAddExercise(def)}
                    className="p-3.5 rounded-2xl bg-cream-50 hover:bg-mint-50 border border-mint-100 hover:border-mint-300 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-forest-950 group-hover:text-forest-800">{def.name}</span>
                        <span className="text-[9px] font-bold text-forest-800 px-2 py-0.5 bg-mint-100 border border-mint-200 rounded-full font-mono">
                          {def.muscleGroup}
                        </span>
                        <span className="text-[9px] font-bold text-charcoal-500 px-2 py-0.5 bg-white border border-mint-100 rounded-full font-mono">
                          {def.equipment}
                        </span>
                      </div>
                      <p className="text-[11px] text-charcoal-600 mt-1 line-clamp-1">{def.instructions}</p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-white border border-mint-200 flex items-center justify-center text-forest-900 group-hover:bg-forest-900 group-hover:text-white transition shadow-soft shrink-0 ml-2">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔄 MODAL 2: EXERCISE ALTERNATIVE / SWAP MODAL                              */}
      {/* ========================================================================= */}
      {swapExerciseTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-6 shadow-modal border border-mint-200 space-y-4 text-charcoal-900">
            <div className="flex items-center justify-between border-b border-mint-100 pb-3">
              <div>
                <h3 className="text-base font-black text-forest-950">Swap Exercise</h3>
                <p className="text-xs text-charcoal-600">
                  Replacing: <span className="font-bold text-forest-900">{swapExerciseTarget.exerciseName}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSwapExerciseTarget(null)}
                className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-700 bg-cream-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-charcoal-600">
              Is equipment occupied? Select a scientifically compatible biomechanical alternative below:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(() => {
                const currentDef = PRESET_EXERCISES.find(e => e.id === swapExerciseTarget.exerciseId);
                const altIds = currentDef?.alternatives || [];
                const alts = PRESET_EXERCISES.filter(e => altIds.includes(e.id) || (e.muscleGroup === swapExerciseTarget.muscleGroup && e.id !== swapExerciseTarget.exerciseId));

                return alts.map(altDef => (
                  <div
                    key={altDef.id}
                    onClick={() => handleSwapExercise(swapExerciseTarget.id, altDef)}
                    className="p-3 rounded-xl bg-cream-50 hover:bg-mint-100/70 border border-mint-100 hover:border-mint-300 transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-forest-950">{altDef.name}</span>
                        <span className="text-[9px] font-bold text-charcoal-600 bg-white px-2 py-0.5 rounded-full border border-mint-100 font-mono">
                          {altDef.equipment}
                        </span>
                      </div>
                      <p className="text-[10px] text-charcoal-500 mt-0.5">{altDef.instructions}</p>
                    </div>
                    <RefreshCw className="w-4 h-4 text-forest-800 shrink-0 ml-2" />
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔢 MODAL 3: BARBELL PLATE CALCULATOR                                      */}
      {/* ========================================================================= */}
      {showPlateCalcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-6 shadow-modal border border-mint-200 space-y-4 text-charcoal-900">
            <div className="flex items-center justify-between border-b border-mint-100 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-forest-800" />
                <h3 className="text-base font-black text-forest-950">Barbell Plate Calculator</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPlateCalcModal(false)}
                className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-700 bg-cream-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Weight Slider & Input */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-charcoal-600 font-mono block">
                Total Barbell Weight: {plateCalcWeight} kg
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="20"
                  max="250"
                  step="2.5"
                  value={plateCalcWeight}
                  onChange={(e) => setPlateCalcWeight(parseFloat(e.target.value))}
                  className="w-full accent-forest-900"
                />
                <input
                  type="number"
                  step="2.5"
                  value={plateCalcWeight}
                  onChange={(e) => setPlateCalcWeight(Math.max(20, parseFloat(e.target.value) || 20))}
                  className="w-20 text-center p-2 rounded-xl bg-cream-50 border border-mint-200 font-mono font-bold text-xs"
                />
              </div>
            </div>

            {/* Visual Bar Loading Breakdown */}
            <div className="p-4 rounded-2xl bg-cream-50/70 border border-mint-100 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-charcoal-600">Olympic Barbell:</span>
                <span className="font-black text-forest-950">{plateBreakdown.barWeight} kg</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono border-t border-mint-100 pt-2">
                <span className="text-charcoal-600">Weight Per Side:</span>
                <span className="font-black text-forest-950">{plateBreakdown.perSide} kg</span>
              </div>

              {/* Plates list */}
              <div className="space-y-1.5 pt-2 border-t border-mint-100">
                <span className="text-[10px] font-black uppercase text-charcoal-500 font-mono block">
                  Plates to load on EACH side:
                </span>
                {plateBreakdown.plates.length === 0 ? (
                  <p className="text-xs text-charcoal-500 italic">Empty bar (20kg)</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {plateBreakdown.plates.map((p, pIdx) => (
                      <div key={pIdx} className="px-3 py-1.5 rounded-xl bg-mint-100 border border-mint-200 text-xs font-mono font-black text-forest-950 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-forest-900" />
                        <span>{p.count} × {p.plate} kg</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPlateCalcModal(false)}
              className="w-full py-2.5 rounded-xl bg-forest-900 text-white font-black text-xs transition active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏁 MODAL 4: WORKOUT COMPLETE CELEBRATION & SUMMARY MODAL                  */}
      {/* ========================================================================= */}
      {finishedSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-6 sm:p-8 shadow-modal border border-mint-200 space-y-6 text-charcoal-900 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-mint-100 text-forest-900 flex items-center justify-center mx-auto border border-mint-200 shadow-soft">
              <Award className="w-8 h-8 text-forest-800" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black uppercase text-mint-700 tracking-wider">
                SESSION RECORDED
              </span>
              <h2 className="text-2xl font-black text-forest-950">
                Outstanding Session!
              </h2>
              <p className="text-xs text-charcoal-600">
                You crushed {finishedSummary.title} on {finishedSummary.date}.
              </p>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-cream-50/70 border border-mint-100">
                <span className="text-[10px] font-bold text-charcoal-500 uppercase font-mono block">
                  Duration
                </span>
                <span className="text-lg font-black text-forest-950 font-mono">
                  {finishedSummary.durationMinutes}m
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-cream-50/70 border border-mint-100">
                <span className="text-[10px] font-bold text-charcoal-500 uppercase font-mono block">
                  Volume
                </span>
                <span className="text-lg font-black text-forest-950 font-mono">
                  {finishedSummary.totalVolumeKg.toLocaleString()} <span className="text-xs font-normal">kg</span>
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-cream-50/70 border border-mint-100">
                <span className="text-[10px] font-bold text-charcoal-500 uppercase font-mono block">
                  Sets Done
                </span>
                <span className="text-lg font-black text-forest-950 font-mono">
                  {finishedSummary.totalSets}
                </span>
              </div>
            </div>

            {/* Post-Workout Recovery Tip */}
            <div className="p-4 rounded-2xl bg-mint-50 border border-mint-200 text-left text-xs space-y-1 text-charcoal-700">
              <div className="flex items-center gap-2 font-black text-forest-900">
                <ShieldCheck className="w-4 h-4 text-mint-600" />
                <span>Anabolic Recovery Window</span>
              </div>
              <p className="text-[11px] text-charcoal-600">
                Hydrate with 500ml of electrolyte water and consume 25-35g of high-leucine protein within 45 minutes for optimal muscle protein synthesis (MPS).
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setFinishedSummary(null);
                setSubView('history');
              }}
              className="w-full py-3.5 rounded-2xl bg-forest-900 hover:bg-forest-800 text-white font-black text-xs sm:text-sm transition active:scale-95 shadow-soft"
            >
              View In Session History ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
