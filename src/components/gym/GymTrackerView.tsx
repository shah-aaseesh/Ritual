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
  ChevronUp,
  Rotate3d
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
import { HumanBodyModel } from './HumanBodyModel';

type GymTab = 'builder' | 'live' | 'splits' | 'history' | 'supplements';

export const GymTrackerView: React.FC = () => {
  const { showToast } = useApp();

  // Active top-level Tab
  const [activeTab, setActiveTab] = useState<GymTab>('builder');

  // ============================================================================
  // WORKOUT.COOL INTERACTIVE ANATOMICAL MODEL STATE
  // ============================================================================
  const [bodyPerspective, setBodyPerspective] = useState<'front' | 'back' | 'both'>('both');
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroup[]>(['Chest']);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'All'>('All');
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState<string>('');

  // ============================================================================
  // LIVE WORKOUT HUD STATE
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
  const [pickerMuscle, setPickerMuscle] = useState<MuscleGroup | 'All'>('All');
  const [pickerEquipment, setPickerEquipment] = useState<EquipmentType | 'All'>('All');

  // Finished Workout Summary Modal
  const [finishedSummary, setFinishedSummary] = useState<WorkoutSession | null>(null);

  // Technique Cues Open Accordion Map
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
  // WORKOUT.COOL INTERACTIVE ANATOMY HELPERS
  // ============================================================================
  const toggleMuscle = (muscle: MuscleGroup) => {
    setSelectedMuscles(prev => {
      if (prev.includes(muscle)) {
        // If clicking the only selected muscle, keep or clear
        const next = prev.filter(m => m !== muscle);
        return next;
      } else {
        return [...prev, muscle];
      }
    });
  };

  const isMuscleSelected = (muscle: MuscleGroup) => selectedMuscles.includes(muscle);

  // Filtered Exercises for the Generator List
  const matchingGeneratorExercises = useMemo(() => {
    return PRESET_EXERCISES.filter(ex => {
      const matchesMuscle = selectedMuscles.length === 0 || selectedMuscles.includes(ex.muscleGroup);
      const matchesEquip = selectedEquipment === 'All' || ex.equipment === selectedEquipment;
      const matchesSearch = !exerciseSearchQuery || ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase());
      return matchesMuscle && matchesEquip && matchesSearch;
    });
  }, [selectedMuscles, selectedEquipment, exerciseSearchQuery]);

  // ============================================================================
  // WORKOUT LAUNCHERS
  // ============================================================================

  // 1. Start Workout from all currently filtered / selected movements
  const startGeneratedWorkout = () => {
    if (matchingGeneratorExercises.length === 0) {
      showToast('Please select at least 1 muscle group with matching exercises!', 'warning');
      return;
    }

    const initialExercises: ExerciseLog[] = matchingGeneratorExercises.slice(0, 5).map((def, idx) => {
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

    const title = selectedMuscles.length > 0 ? `${selectedMuscles.join(' & ')} Workout` : 'Targeted Workout';
    setActiveWorkoutTitle(title);
    setActiveExercises(initialExercises);
    setWorkoutStartTime(Date.now());
    setElapsedSeconds(0);
    setIsPaused(false);
    setIsWorkoutActive(true);
    setActiveTab('live');
    showToast(`⚡ Started workout with ${initialExercises.length} movements!`, 'success');
  };

  // 2. Start Empty / Blank Workout
  const startEmptyWorkout = () => {
    setActiveWorkoutTitle('Quick Empty Workout');
    setActiveExercises([]);
    setWorkoutStartTime(Date.now());
    setElapsedSeconds(0);
    setIsPaused(false);
    setIsWorkoutActive(true);
    setActiveTab('live');
    showToast('⚡ Started blank session! Add exercises as you go.', 'info');
  };

  // 3. Start from Preset Template (Push, Pull, Legs)
  const startRoutineTemplate = (templateId: string) => {
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
    setActiveTab('live');
    showToast(`⚡ Loaded routine: ${template.title}`, 'success');
  };

  // Add individual exercise from Generator into active session
  const addExerciseToActiveWorkout = (def: ExerciseDefinition) => {
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
    if (!isWorkoutActive) {
      setWorkoutStartTime(Date.now());
      setElapsedSeconds(0);
      setIsWorkoutActive(true);
      setActiveWorkoutTitle(`${def.muscleGroup} Focus`);
    }
    showToast(`Added ${def.name} to workout!`, 'success');
  };

  // Swap exercise with alternative
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

  // Toggle set complete & auto start rest timer
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
          }
          return { ...s, isCompleted: nextCompleted };
        })
      };
    }));
  };

  // Steppers for weight & reps
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

  // Live Metrics
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

  // Plate Calculator
  const plateBreakdown = useMemo(() => {
    const barWeight = 20;
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

  const allMuscles: MuscleGroup[] = ['Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Biceps', 'Triceps', 'Core', 'Cardio'];
  const allEquipments: (EquipmentType | 'All')[] = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight'];

  return (
    <div className="space-y-6 pb-28 text-charcoal-900 font-sans">
      {/* ========================================================================= */}
      {/* 🧭 UNIFIED WORKOUT NAVIGATION TABS                                         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-[2.5rem] p-3 sm:p-4 border border-mint-200/80 shadow-card flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${
              activeTab === 'builder'
                ? 'bg-forest-900 text-white shadow-soft'
                : 'bg-cream-50 text-charcoal-700 hover:bg-mint-100 hover:text-forest-900 border border-mint-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-mint-300" />
            <span>Target Muscle Builder</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 relative ${
              activeTab === 'live'
                ? 'bg-forest-900 text-white shadow-soft'
                : 'bg-cream-50 text-charcoal-700 hover:bg-mint-100 hover:text-forest-900 border border-mint-100'
            }`}
          >
            <Activity className="w-4 h-4 text-mint-400" />
            <span>Active Workout HUD</span>
            {isWorkoutActive && (
              <span className="w-2.5 h-2.5 rounded-full bg-mint-400 animate-ping absolute -top-1 -right-1" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('splits')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${
              activeTab === 'splits'
                ? 'bg-forest-900 text-white shadow-soft'
                : 'bg-cream-50 text-charcoal-700 hover:bg-mint-100 hover:text-forest-900 border border-mint-100'
            }`}
          >
            <Layers className="w-4 h-4 text-forest-700" />
            <span>Curated Splits</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${
              activeTab === 'history'
                ? 'bg-forest-900 text-white shadow-soft'
                : 'bg-cream-50 text-charcoal-700 hover:bg-mint-100 hover:text-forest-900 border border-mint-100'
            }`}
          >
            <History className="w-4 h-4 text-forest-700" />
            <span>History ({workoutHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supplements')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${
              activeTab === 'supplements'
                ? 'bg-forest-900 text-white shadow-soft'
                : 'bg-cream-50 text-charcoal-700 hover:bg-mint-100 hover:text-forest-900 border border-mint-100'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Formulations</span>
          </button>
        </div>

        {/* Quick Start Blank Workout Button */}
        <button
          type="button"
          onClick={startEmptyWorkout}
          className="hidden md:flex px-4 py-2 rounded-2xl bg-mint-100 hover:bg-mint-200 border border-mint-300 text-forest-900 font-extrabold text-xs items-center gap-1.5 shrink-0 transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Quick Blank Workout</span>
        </button>
      </div>

      {/* Floating Active Session Banner (if ongoing and user is on another tab) */}
      {isWorkoutActive && activeTab !== 'live' && (
        <div 
          onClick={() => setActiveTab('live')}
          className="p-4 sm:p-5 rounded-[2rem] bg-gradient-to-r from-mint-50 via-white to-mint-50 border-2 border-mint-400 shadow-card flex items-center justify-between cursor-pointer group hover:border-mint-600 transition animate-in fade-in"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-forest-900 text-mint-300 flex items-center justify-center font-mono font-black shadow-md animate-pulse shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-forest-700 block">
                Session Active • {formatTimer(elapsedSeconds)} • {liveCompletedSets}/{liveTotalSets} Sets
              </span>
              <h3 className="text-sm sm:text-base font-black text-forest-950">
                {activeWorkoutTitle} ({liveTotalVolume.toLocaleString()} kg lifted)
              </h3>
            </div>
          </div>
          <div className="px-4 py-2 rounded-full bg-forest-900 text-white font-black text-xs group-hover:bg-forest-800 transition shadow-soft flex items-center gap-1 shrink-0">
            <span>Resume HUD</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🎯 TAB 1: WORKOUT.COOL INTERACTIVE ANATOMY & WORKOUT BUILDER              */}
      {/* ========================================================================= */}
      {activeTab === 'builder' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Main Hero Card with Interactive Anatomical SVG & Muscle Filter */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-mint-200/80 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mint-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-mint-100 text-forest-800 text-[10px] font-black uppercase tracking-wider font-mono border border-mint-200">
                    INTERACTIVE ANATOMICAL MODEL
                  </span>
                  <span className="text-xs text-charcoal-500 font-mono">
                    Select muscles on the body to generate targeted movements
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-forest-950 tracking-tight mt-1">
                  Target Muscle & Equipment Builder
                </h2>
              </div>

              {/* View Angle Switcher (Anterior Front vs Posterior Back vs Both) */}
              <div className="inline-flex p-1.5 bg-cream-50 rounded-2xl border border-mint-200 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setBodyPerspective('both')}
                  className={`px-3 sm:px-4 py-2 rounded-xl font-black flex items-center gap-1.5 transition active:scale-95 ${
                    bodyPerspective === 'both'
                      ? 'bg-forest-900 text-white shadow-soft'
                      : 'text-charcoal-600 hover:text-forest-900'
                  }`}
                >
                  <Rotate3d className="w-3.5 h-3.5" />
                  <span>Full Body (Both)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBodyPerspective('front')}
                  className={`px-3 sm:px-4 py-2 rounded-xl font-black flex items-center gap-1.5 transition active:scale-95 ${
                    bodyPerspective === 'front'
                      ? 'bg-forest-900 text-white shadow-soft'
                      : 'text-charcoal-600 hover:text-forest-900'
                  }`}
                >
                  <span>Anterior (Front)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBodyPerspective('back')}
                  className={`px-3 sm:px-4 py-2 rounded-xl font-black flex items-center gap-1.5 transition active:scale-95 ${
                    bodyPerspective === 'back'
                      ? 'bg-forest-900 text-white shadow-soft'
                      : 'text-charcoal-600 hover:text-forest-900'
                  }`}
                >
                  <span>Posterior (Back)</span>
                </button>
              </div>
            </div>

            {/* Split View: Left Anatomical Model | Right Muscle Chips & Selected Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Left: Interactive Human Body Anatomical Model Component */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl bg-cream-50/70 border border-mint-200/80 relative">
                <span className="text-[11px] font-mono font-bold text-charcoal-600 mb-2">
                  Tap any muscle on the body model to select:
                </span>

                <HumanBodyModel
                  selectedMuscles={selectedMuscles}
                  onToggleMuscle={toggleMuscle}
                  perspective={bodyPerspective}
                  className="w-full"
                />
              </div>

              {/* Right: Muscle Group Selectors & Equipment Filter Bar */}
              <div className="lg:col-span-7 space-y-5">
                {/* Muscle Group Chips */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-forest-950 font-mono">
                      Target Muscles ({selectedMuscles.length} selected):
                    </label>
                    {selectedMuscles.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedMuscles([])}
                        className="text-[11px] font-bold text-charcoal-500 hover:text-rose-600 underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {allMuscles.map(m => {
                      const selected = isMuscleSelected(m);
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => toggleMuscle(m)}
                          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 ${
                            selected
                              ? 'bg-forest-900 text-white shadow-soft ring-2 ring-forest-900/20'
                              : 'bg-cream-50 text-charcoal-700 hover:bg-mint-100 hover:text-forest-900 border border-mint-200'
                          }`}
                        >
                          <span>{m}</span>
                          {selected ? <Check className="w-3.5 h-3.5 text-mint-300 stroke-[3]" /> : <Plus className="w-3.5 h-3.5 text-charcoal-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Equipment Filter Bar */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-forest-950 font-mono block">
                    Available Equipment:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {allEquipments.map(eq => (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => setSelectedEquipment(eq)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
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

                {/* Search Bar for Exercises */}
                <input
                  type="text"
                  placeholder="Search exercise name (e.g. Incline Bench, Deadlift)..."
                  value={exerciseSearchQuery}
                  onChange={(e) => setExerciseSearchQuery(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-cream-50 border border-mint-200 text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-mint-500"
                />

                {/* Generator Action Banner */}
                <div className="p-4 rounded-2xl bg-mint-50 border border-mint-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-black text-forest-950 block">
                      {matchingGeneratorExercises.length} Movements Matched
                    </span>
                    <span className="text-[11px] text-charcoal-600 font-mono">
                      {selectedMuscles.join(' • ') || 'All Muscles'} ({selectedEquipment})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={startGeneratedWorkout}
                    disabled={matchingGeneratorExercises.length === 0}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 disabled:opacity-50 text-white font-black text-xs transition active:scale-95 shadow-soft flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-mint-300" />
                    <span>Start Routine ({Math.min(matchingGeneratorExercises.length, 5)}) ›</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* REAL-TIME MATCHED EXERCISE CARDS (Workout.cool Style Gallery)             */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-lg font-black text-forest-950">
                  Targeted Movements ({matchingGeneratorExercises.length})
                </h3>
                <p className="text-xs text-charcoal-600">
                  Tap + Add to Workout or launch the routine directly.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-forest-800 bg-mint-100 px-3 py-1 rounded-full border border-mint-200">
                {selectedMuscles.length} Muscle Focus
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchingGeneratorExercises.map((def) => {
                const isOpen = !!expandedCues[def.id];

                return (
                  <div
                    key={def.id}
                    className="p-5 rounded-[2rem] bg-white border border-mint-200/80 hover:border-mint-400 transition shadow-soft hover:shadow-card flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-black uppercase text-forest-800 bg-mint-100 px-2.5 py-0.5 rounded-full border border-mint-200">
                            {def.muscleGroup}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-charcoal-500 bg-cream-50 px-2 py-0.5 rounded-full border border-mint-100">
                            {def.equipment}
                          </span>
                        </div>

                        <span className="text-xs font-mono font-bold text-forest-900">
                          {def.defaultSets} sets × {def.defaultReps} reps
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-black text-forest-950 group-hover:text-forest-800 transition">
                        {def.name}
                      </h4>

                      <p className="text-xs text-charcoal-600 leading-relaxed">
                        {def.instructions}
                      </p>

                      {/* Expandable Coach Cues */}
                      {def.cues && def.cues.length > 0 && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setExpandedCues(prev => ({ ...prev, [def.id]: !prev[def.id] }))}
                            className="text-[11px] font-bold text-forest-800 hover:text-forest-950 flex items-center gap-1 transition"
                          >
                            <Info className="w-3.5 h-3.5 text-mint-600" />
                            <span>Technique & Form Tips ({def.cues.length})</span>
                            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {isOpen && (
                            <ul className="mt-2 p-3 rounded-xl bg-cream-50 border border-mint-100 list-disc pl-4 space-y-0.5 text-[11px] text-charcoal-700 animate-in fade-in">
                              {def.cues.map((c, cIdx) => (
                                <li key={cIdx}>{c}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-mint-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-charcoal-500 font-mono">
                        Base load: {def.defaultWeightKg} kg
                      </span>

                      <button
                        type="button"
                        onClick={() => addExerciseToActiveWorkout(def)}
                        className="px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-black text-xs transition active:scale-95 shadow-soft flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 text-mint-300 stroke-[3]" />
                        <span>Add to Workout</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚡ TAB 2: LIVE WORKOUT HUD & SET LOGGER (STREAMLINED & POWERFUL)          */}
      {/* ========================================================================= */}
      {activeTab === 'live' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* Top Session Control & Metrics Bar */}
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

              {/* Action Buttons: Plate Calc, Pause & Finish */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowPlateCalcModal(true)}
                  className="px-3 py-1.5 rounded-full bg-cream-50 hover:bg-mint-100 text-charcoal-800 border border-mint-200 font-bold text-xs flex items-center gap-1.5 transition"
                  title="Barbell Plate Calculator"
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

            {/* Smart Integrated Rest Timer Banner */}
            {isRestTimerRunning && (
              <div className="p-3.5 rounded-2xl bg-mint-100/90 border border-mint-300 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-forest-900 text-white flex items-center justify-center font-mono font-black text-xs">
                    <Clock className="w-4 h-4 text-mint-300 animate-spin" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase text-forest-800 block">
                      Rest Interval
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

          {/* Active Exercise List */}
          <div className="space-y-4">
            {activeExercises.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] p-10 border border-mint-200/80 shadow-card text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-mint-50 text-forest-800 flex items-center justify-center mx-auto border border-mint-200">
                  <Dumbbell className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-forest-950">No exercises added yet</h3>
                  <p className="text-xs text-charcoal-600 mt-1">
                    Pick movements from the Target Muscle Builder or browse movements below.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('builder')}
                    className="px-5 py-2.5 rounded-2xl bg-forest-900 text-white font-black text-xs shadow-soft hover:bg-forest-800 transition"
                  >
                    Open Muscle Builder
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddExerciseModal(true)}
                    className="px-5 py-2.5 rounded-2xl bg-cream-50 text-forest-900 font-black text-xs border border-mint-200 hover:bg-mint-100 transition"
                  >
                    Browse Library
                  </button>
                </div>
              </div>
            ) : (
              activeExercises.map((ex, exIdx) => {
                const def = PRESET_EXERCISES.find(e => e.id === ex.exerciseId);

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
                      </div>

                      {/* Top Actions: Swap Alternative & Delete */}
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

                          {/* Weight Stepper & Direct Input */}
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

                          {/* Reps Stepper & Direct Input */}
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

                          {/* 1-Tap Completion Checkmark */}
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

                    {/* Bottom Controls: + Add Set & Rest Timer Presets */}
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
              <span>Add Movement to Live Workout</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏆 TAB 3: CURATED SCIENCE-BACKED HYPERTROPHY SPLITS                       */}
      {/* ========================================================================= */}
      {activeTab === 'splits' && (
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
                    onClick={() => startRoutineTemplate(tmpl.id)}
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
      {/* 📜 TAB 4: SESSION HISTORY & VOLUME TRACKER                                 */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-mint-200/80 shadow-card space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-mint-100 pb-4">
            <div>
              <span className="text-[10px] font-mono font-black uppercase text-forest-700 tracking-wider block">
                PERFORMANCE LOGBOOK
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-forest-950 mt-0.5">
                Workout Session History
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
      {/* ⚡ TAB 5: ATHLETIC SUPPLEMENTS & FORMULATIONS                              */}
      {/* ========================================================================= */}
      {activeTab === 'supplements' && (
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

            {/* Muscle Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {(['All', ...allMuscles] as const).map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setPickerMuscle(group)}
                  className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition ${
                    pickerMuscle === group
                      ? 'bg-forest-900 text-white'
                      : 'bg-cream-50 text-charcoal-600 hover:bg-mint-100 hover:text-forest-900 border border-mint-100'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            {/* Equipment Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
              {allEquipments.map((eq) => (
                <button
                  key={eq}
                  type="button"
                  onClick={() => setPickerEquipment(eq)}
                  className={`px-2.5 py-0.5 rounded-md font-medium whitespace-nowrap transition ${
                    pickerEquipment === eq
                      ? 'bg-mint-200 text-forest-950 font-bold border border-mint-400'
                      : 'bg-cream-50 text-charcoal-500 border border-mint-100'
                  }`}
                >
                  {eq}
                </button>
              ))}
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {PRESET_EXERCISES.filter(e => 
                (pickerMuscle === 'All' || e.muscleGroup === pickerMuscle) &&
                (pickerEquipment === 'All' || e.equipment === pickerEquipment)
              ).map((def) => (
                <div
                  key={def.id}
                  onClick={() => {
                    addExerciseToActiveWorkout(def);
                    setShowAddExerciseModal(false);
                  }}
                  className="p-3.5 rounded-2xl bg-cream-50 hover:bg-mint-50 border border-mint-100 hover:border-mint-300 transition cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-forest-950 group-hover:text-forest-800">{def.name}</span>
                      <span className="text-[9px] font-bold text-forest-800 px-2 py-0.5 bg-mint-100 border border-mint-200 rounded-full font-mono">
                        {def.muscleGroup}
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-600 mt-1 line-clamp-1">{def.instructions}</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-white border border-mint-200 flex items-center justify-center text-forest-900 group-hover:bg-forest-900 group-hover:text-white transition shadow-soft shrink-0 ml-2">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              ))}
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
                setActiveTab('history');
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
