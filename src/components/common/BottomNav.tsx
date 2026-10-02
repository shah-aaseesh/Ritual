import React from 'react';
import { useApp, NavTab } from '../../context/AppContext';
import { Sun, ScanLine, Layers, CheckSquare, TrendingUp, Dumbbell, Utensils, Leaf } from 'lucide-react';

interface NavItem {
  id: NavTab | 'switch_health' | 'switch_wellness';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  isHero?: boolean;
  isSwitch?: boolean;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, activePillar, setActivePillar, shelfProducts } = useApp();

  const wellnessTabs: NavItem[] = [
    { id: 'today', label: 'Ritual', icon: Sun },
    { id: 'smartshelf', label: 'Shelf', icon: Layers, badge: shelfProducts.length > 0 ? shelfProducts.length : undefined },
    { id: 'labellens', label: 'Rx Scan', icon: ScanLine, isHero: true },
    { id: 'routine', label: 'Routine', icon: CheckSquare },
    { id: 'switch_health', label: 'Health ↗', icon: Dumbbell, isSwitch: true },
  ];

  const healthTabs: NavItem[] = [
    { id: 'gym', label: 'Gym Log', icon: Dumbbell },
    { id: 'calories', label: 'Calories', icon: Utensils },
    { id: 'labellens', label: 'Rx Scan', icon: ScanLine, isHero: true },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'switch_wellness', label: 'Wellness ↗', icon: Leaf, isSwitch: true },
  ];

  const tabs = activePillar === 'health' ? healthTabs : wellnessTabs;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-lg border-t border-cream-200/80 px-2 py-1.5 safe-bottom shadow-modal">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isHero = tab.id === 'labellens';

          const isSwitch = (tab as any).isSwitch;

          const handleClick = () => {
            if (tab.id === 'switch_health') {
              setActivePillar('health');
              setActiveTab('gym');
            } else if (tab.id === 'switch_wellness') {
              setActivePillar('wellness');
              setActiveTab('today');
            } else {
              setActiveTab(tab.id as NavTab);
            }
          };

          if (isHero) {
            return (
              <button
                key={tab.id}
                onClick={handleClick}
                className={`relative flex flex-col items-center justify-center -mt-4 group focus:outline-none`}
                aria-label={tab.label}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 ${
                    isActive
                      ? 'bg-forest-900 text-mint-300 ring-4 ring-mint-200/60 scale-105'
                      : 'bg-forest-800 text-cream-50 hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-semibold mt-1 transition-colors ${
                    isActive ? 'text-forest-900' : 'text-charcoal-500'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={handleClick}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 focus:outline-none ${
                isSwitch
                  ? 'text-mint-700 font-semibold bg-mint-50/80 hover:bg-mint-100/90'
                  : isActive
                  ? 'text-forest-950 font-semibold'
                  : 'text-charcoal-400 hover:text-charcoal-700'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-forest-900' : ''}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-mint-500 text-[9px] font-bold text-white flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'text-forest-950 font-bold' : 'text-charcoal-500'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-forest-900 mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
