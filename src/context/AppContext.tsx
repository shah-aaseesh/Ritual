import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  ShelfProduct, 
  RoutineStep, 
  ProgressEntry, 
  WellnessGoal, 
  DuplicateIngredientAlert,
  AISettings,
  OnboardingProduct,
  HealthDocument
} from '../types';
import { 
  DEMO_USER_PROFILE, 
  DEMO_SHELF_PRODUCTS, 
  DEMO_ROUTINE_STEPS, 
  getDemoProgressHistory, 
  getMissedAdherenceHistory 
} from '../data/demoState';
import { DEMO_HEALTH_DOCUMENTS } from '../data/demoDocuments';
import { generateRoutineFromProfile } from '../services/routineGenerator';

export type NavTab = 'home' | 'workout' | 'calories' | 'mythbuster' | 'documents' | 'today' | 'gym' | 'labellens' | 'smartshelf' | 'routine' | 'progress';
export type AppPillar = 'wellness' | 'health';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface AppContextType {
  profile: UserProfile;
  activePillar: AppPillar;
  setActivePillar: (pillar: AppPillar) => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  shelfProducts: ShelfProduct[];
  routineSteps: RoutineStep[];
  progressHistory: ProgressEntry[];
  healthDocuments: HealthDocument[];
  showRoutineRescue: boolean;
  setShowRoutineRescue: (show: boolean) => void;
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  
  // AI Integration
  aiSettings: AISettings;
  updateAISettings: (settings: Partial<AISettings>) => void;

  // Actions
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeOnboarding: (data: Partial<UserProfile>, scannedProducts?: OnboardingProduct[]) => void;
  addShelfProduct: (product: Omit<ShelfProduct, 'id' | 'dateAdded'>) => void;
  editShelfProduct: (id: string, updates: Partial<ShelfProduct>) => void;
  removeShelfProduct: (id: string) => void;
  addHealthDocument: (doc: HealthDocument) => void;
  removeHealthDocument: (id: string) => void;
  toggleRoutineStep: (stepId: string) => void;
  addRoutineStep: (step: Omit<RoutineStep, 'id' | 'isCompletedToday'>) => void;
  editRoutineStep: (stepId: string, updates: Partial<RoutineStep>) => void;
  removeRoutineStep: (stepId: string) => void;
  reorderRoutineSteps: (fromIndex: number, toIndex: number) => void;
  regenerateRoutine: (goal?: WellnessGoal) => void;
  acceptRescueRoutine: (rescueSteps: RoutineStep[]) => void;
  dismissRescueRoutine: () => void;
  addProgressEntry: (entry: Omit<ProgressEntry, 'id'>) => void;
  
  // Demo & State
  isDemoMode: boolean;
  loadDemoState: () => void;
  resetToCleanState: () => void;
  simulateMissedDays: () => void;

  // Duplication alerts
  duplicateAlerts: DuplicateIngredientAlert[];
}

const STORAGE_KEYS = {
  PROFILE: 'ritual_user_profile_v1',
  SHELF: 'ritual_shelf_products_v1',
  ROUTINE: 'ritual_routine_steps_v1',
  PROGRESS: 'ritual_progress_history_v1',
  IS_DEMO: 'ritual_is_demo_v1',
  AI_SETTINGS: 'ritual_ai_settings_v1',
};

const INITIAL_PROFILE: UserProfile = {
  name: '',
  age: 24,
  primaryGoal: 'hair_health',
  dailyTime: '5_min',
  alreadyOwnsProducts: false,
  isOnboarded: false,
  createdAt: new Date().toISOString()
};

const envApiKey = (import.meta as any).env?.VITE_OPENROUTER_API_KEY || '';
const envModel = (import.meta as any).env?.VITE_OPENROUTER_MODEL || 'google/gemini-3.1-flash-lite';

const INITIAL_AI_SETTINGS: AISettings = {
  enabled: true,
  provider: 'openrouter',
  openRouterApiKey: envApiKey,
  selectedModel: envModel
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_PROFILE;
  });

  const [aiSettings, setAISettings] = useState<AISettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AI_SETTINGS);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (!parsed.openRouterApiKey && envApiKey) {
          parsed.openRouterApiKey = envApiKey;
          parsed.provider = 'openrouter';
        }
        // Exclusively use ultra-fast Gemini 3.1 Flash-Lite
        if (!parsed.selectedModel || !parsed.selectedModel.includes('gemini') || parsed.selectedModel === 'google/gemini-3.5-flash') {
          parsed.selectedModel = 'google/gemini-3.1-flash-lite';
        }
        return parsed;
      } catch (e) { /* fallback */ }
    }
    return INITIAL_AI_SETTINGS;
  });

  const [shelfProducts, setShelfProducts] = useState<ShelfProduct[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHELF);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [];
  });

  const [routineSteps, setRoutineSteps] = useState<RoutineStep[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROUTINE);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [];
  });

  const [progressHistory, setProgressHistory] = useState<ProgressEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [];
  });

  const [healthDocuments, setHealthDocuments] = useState<HealthDocument[]>(() => {
    const saved = localStorage.getItem('ritual_health_docs_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEMO_HEALTH_DOCUMENTS;
  });

  const [activePillar, setActivePillarState] = useState<AppPillar>(() => {
    const saved = localStorage.getItem('ritual_active_pillar_v1');
    return (saved === 'health' || saved === 'wellness') ? saved : 'health';
  });

  const [activeTab, setActiveTab] = useState<NavTab>('home');

  const setActivePillar = (pillar: AppPillar) => {
    setActivePillarState(pillar);
    localStorage.setItem('ritual_active_pillar_v1', pillar);
    if (pillar === 'health') {
      if (activeTab !== 'workout' && activeTab !== 'calories' && activeTab !== 'home' && activeTab !== 'mythbuster' && activeTab !== 'documents') {
        setActiveTab('home');
      }
    } else {
      if (activeTab === 'workout' || activeTab === 'gym') {
        setActiveTab('home');
      }
    }
  };
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_DEMO);
    return saved !== null ? saved === 'true' : false;
  });
  const [showRoutineRescue, setShowRoutineRescue] = useState<boolean>(false);

  // LocalStorage Sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AI_SETTINGS, JSON.stringify(aiSettings));
  }, [aiSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHELF, JSON.stringify(shelfProducts));
  }, [shelfProducts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROUTINE, JSON.stringify(routineSteps));
  }, [routineSteps]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progressHistory));
  }, [progressHistory]);

  useEffect(() => {
    localStorage.setItem('ritual_health_docs_v1', JSON.stringify(healthDocuments));
  }, [healthDocuments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, String(isDemoMode));
  }, [isDemoMode]);

  // Contextual trigger for Routine Rescue: check recent adherence
  useEffect(() => {
    if (progressHistory.length >= 3) {
      const recent3 = progressHistory.slice(-3);
      const missedCount = recent3.filter(p => p.completionRate < 0.3).length;
      if (missedCount >= 2 && routineSteps.length > 2) {
        setShowRoutineRescue(true);
      }
    }
  }, [progressHistory, routineSteps]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  const updateAISettings = (settings: Partial<AISettings>) => {
    setAISettings(prev => ({ ...prev, ...settings }));
    showToast('AI Provider settings updated', 'success');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    showToast('Profile preferences updated', 'success');
  };

  const completeOnboarding = (data: Partial<UserProfile>, scannedProducts?: OnboardingProduct[]) => {
    const updated: UserProfile = {
      ...profile,
      ...data,
      isOnboarded: true,
      createdAt: new Date().toISOString()
    };
    setProfile(updated);
    
    let currentShelf = [...shelfProducts];

    // If onboarding scanned products were provided, convert them to shelf items
    if (scannedProducts && scannedProducts.length > 0) {
      const newItems: ShelfProduct[] = scannedProducts.map((p, idx) => {
        const detectedActives = p.ingredientAnalysis?.detectedIngredients.map(d => d.ingredient.name) || ['Active Formulation'];
        return {
          id: 'prod-onboard-' + Date.now().toString(36) + '-' + idx,
          name: p.name || 'Audited Product',
          brand: p.brand || 'Personal Product',
          category: (p.category.includes('Hair') ? 'Hair' : p.category.includes('Body') ? 'Body' : p.category.includes('Sleep') ? 'Sleep' : 'General') as any,
          relevantGoal: updated.primaryGoal,
          activeIngredients: detectedActives,
          evidenceSummary: p.ingredientAnalysis?.summary.synthesisText || 'Audited during onboarding with Label Lens.',
          evidenceTier: p.ingredientAnalysis?.detectedIngredients[0]?.ingredient.evidenceTier || 'promising_limited',
          timeOfDay: idx % 2 === 0 ? 'morning' : 'evening',
          dateAdded: new Date().toISOString().split('T')[0]
        };
      });
      currentShelf = [...newItems, ...shelfProducts];
      setShelfProducts(currentShelf);
    }

    // Auto-generate fresh routine for the chosen goal with these products
    const newRoutine = generateRoutineFromProfile(
      updated.primaryGoal, 
      updated.dailyTime, 
      currentShelf
    );
    setRoutineSteps(newRoutine);
    setActiveTab('routine'); // Send user straight to their generated routine as requested!
    showToast(`Welcome to Ritual, ${updated.name || 'friend'}!`, 'success');
  };

  const addShelfProduct = (productData: Omit<ShelfProduct, 'id' | 'dateAdded'>) => {
    const newProduct: ShelfProduct = {
      ...productData,
      id: 'prod-' + Date.now().toString(36),
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setShelfProducts(prev => [newProduct, ...prev]);
    showToast(`Saved "${newProduct.name}" to Smart Shelf`, 'success');

    // Also auto-refresh routine with the new shelf item if applicable
    const updatedRoutine = generateRoutineFromProfile(profile.primaryGoal, profile.dailyTime, [newProduct, ...shelfProducts]);
    setRoutineSteps(updatedRoutine);
  };

  const editShelfProduct = (id: string, updates: Partial<ShelfProduct>) => {
    setShelfProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    showToast('Product details updated', 'success');
  };

  const removeShelfProduct = (id: string) => {
    const p = shelfProducts.find(x => x.id === id);
    setShelfProducts(prev => prev.filter(x => x.id !== id));
    showToast(`Removed "${p?.name || 'Product'}" from shelf`, 'info');
  };

  const addHealthDocument = (doc: HealthDocument) => {
    setHealthDocuments(prev => [doc, ...prev]);
  };

  const removeHealthDocument = (id: string) => {
    setHealthDocuments(prev => prev.filter(d => d.id !== id));
  };

  const toggleRoutineStep = (stepId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    setRoutineSteps(prev => {
      const target = prev.find(s => s.id === stepId);
      if (target && !target.isCompletedToday) {
        const currentXp = parseInt(localStorage.getItem('ritual_user_xp') || '3450');
        const nextXp = currentXp + 50;
        localStorage.setItem('ritual_user_xp', nextXp.toString());
        showToast(`⚡ +50 XP Earned! (${target.action})`, 'success');
      }

      const updated = prev.map(step => {
        if (step.id === stepId) {
          return { ...step, isCompletedToday: !step.isCompletedToday };
        }
        return step;
      });

      // Update today's progress history entry
      const completedSteps = updated.filter(s => s.isCompletedToday);
      const completionRate = updated.length > 0 ? completedSteps.length / updated.length : 0;
      
      setProgressHistory(historyPrev => {
        const existingTodayIdx = historyPrev.findIndex(h => h.date === todayStr);
        if (existingTodayIdx >= 0) {
          const newHist = [...historyPrev];
          newHist[existingTodayIdx] = {
            ...newHist[existingTodayIdx],
            completedStepIds: completedSteps.map(s => s.id),
            totalSteps: updated.length,
            completionRate
          };
          return newHist;
        } else {
          return [
            ...historyPrev,
            {
              id: `prog-${todayStr}`,
              date: todayStr,
              completedStepIds: completedSteps.map(s => s.id),
              totalSteps: updated.length,
              completionRate,
              observation: 'Daily routine recorded.'
            }
          ];
        }
      });

      return updated;
    });
  };

  const addRoutineStep = (step: Omit<RoutineStep, 'id' | 'isCompletedToday'>) => {
    const newStep: RoutineStep = {
      ...step,
      id: 'step-' + Date.now().toString(36),
      isCompletedToday: false
    };
    setRoutineSteps(prev => [...prev, newStep]);
    showToast('Added new routine step', 'success');
  };

  const editRoutineStep = (stepId: string, updates: Partial<RoutineStep>) => {
    setRoutineSteps(prev => prev.map(s => s.id === stepId ? { ...s, ...updates } : s));
    showToast('Updated routine step', 'success');
  };

  const removeRoutineStep = (stepId: string) => {
    setRoutineSteps(prev => prev.filter(s => s.id !== stepId));
    showToast('Removed step from routine', 'info');
  };

  const reorderRoutineSteps = (fromIndex: number, toIndex: number) => {
    setRoutineSteps(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  };

  const regenerateRoutine = (goal: WellnessGoal = profile.primaryGoal) => {
    const fresh = generateRoutineFromProfile(goal, profile.dailyTime, shelfProducts);
    setRoutineSteps(fresh);
    showToast('Routine recalculated based on current shelf and goal', 'success');
  };

  const acceptRescueRoutine = (rescueSteps: RoutineStep[]) => {
    setRoutineSteps(rescueSteps);
    setShowRoutineRescue(false);
    showToast('Simplified routine activated! Momentum starts small.', 'success');
  };

  const dismissRescueRoutine = () => {
    setShowRoutineRescue(false);
  };

  const addProgressEntry = (entry: Omit<ProgressEntry, 'id'>) => {
    const newEntry: ProgressEntry = {
      ...entry,
      id: `prog-${entry.date}-${Date.now().toString(36)}`
    };
    setProgressHistory(prev => {
      const existing = prev.findIndex(p => p.date === entry.date);
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = { ...copy[existing], ...newEntry };
        return copy;
      }
      return [...prev, newEntry];
    });
    showToast('Check-in recorded to journal', 'success');
  };

  const loadDemoState = () => {
    setProfile(DEMO_USER_PROFILE);
    setShelfProducts(DEMO_SHELF_PRODUCTS);
    setRoutineSteps(DEMO_ROUTINE_STEPS);
    setProgressHistory(getDemoProgressHistory());
    setShowRoutineRescue(false);
    setIsDemoMode(true);
    setActiveTab('today');
    showToast('Loaded complete demo profile & data', 'success');
  };

  const resetToCleanState = () => {
    setProfile(INITIAL_PROFILE);
    setShelfProducts([]);
    setRoutineSteps([]);
    setProgressHistory([]);
    setShowRoutineRescue(false);
    setIsDemoMode(false);
    showToast('Reset to clean state. Ready for fresh onboarding.', 'info');
  };

  const simulateMissedDays = () => {
    setProgressHistory(getMissedAdherenceHistory());
    setShowRoutineRescue(true);
    showToast('Simulated 3 missed days. Routine Rescue is active!', 'warning');
  };

  // Compute duplicate active ingredient alerts across shelf products
  const duplicateAlerts: DuplicateIngredientAlert[] = [];
  const ingredientMap = new Map<string, string[]>();

  shelfProducts.forEach(prod => {
    prod.activeIngredients.forEach(ing => {
      const normalizedIng = ing.split('(')[0].trim().toLowerCase();
      if (normalizedIng.length > 2) {
        const existing = ingredientMap.get(normalizedIng) || [];
        if (!existing.includes(prod.name)) {
          existing.push(prod.name);
          ingredientMap.set(normalizedIng, existing);
        }
      }
    });
  });

  ingredientMap.forEach((productNames, ingredientName) => {
    if (productNames.length > 1) {
      const capName = ingredientName.charAt(0).toUpperCase() + ingredientName.slice(1);
      duplicateAlerts.push({
        ingredientName: capName,
        productNames,
        neutralMessage: `This ingredient appears in ${productNames.length} products (${productNames.join(' & ')}). Review the total amount and usage instructions.`
      });
    }
  });

  return (
    <AppContext.Provider value={{
      profile,
      activePillar,
      setActivePillar,
      activeTab,
      setActiveTab,
      shelfProducts,
      routineSteps,
      progressHistory,
      healthDocuments,
      showRoutineRescue,
      setShowRoutineRescue,
      toasts,
      showToast,
      aiSettings,
      updateAISettings,
      updateProfile,
      completeOnboarding,
      addShelfProduct,
      editShelfProduct,
      removeShelfProduct,
      addHealthDocument,
      removeHealthDocument,
      toggleRoutineStep,
      addRoutineStep,
      editRoutineStep,
      removeRoutineStep,
      reorderRoutineSteps,
      regenerateRoutine,
      acceptRescueRoutine,
      dismissRescueRoutine,
      addProgressEntry,
      isDemoMode,
      loadDemoState,
      resetToCleanState,
      simulateMissedDays,
      duplicateAlerts
    }}>
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
