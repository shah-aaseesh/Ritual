import React from 'react';
import { useApp, NavTab } from '../../context/AppContext';
import { LayoutDashboard, Dumbbell, Utensils, ScanLine, FileText } from 'lucide-react';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  isHero?: boolean;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navTabs: NavItem[] = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'mythbuster', label: 'Myth Buster', icon: ScanLine, isHero: true },
    { id: 'calories', label: 'Calories', icon: Utensils },
    { id: 'documents', label: 'Docs AI', icon: FileText },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-xl border-t border-mint-200/80 px-2 py-1.5 safe-bottom shadow-card">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === 'workout' && activeTab === 'gym') || (tab.id === 'mythbuster' && activeTab === 'labellens');
          const isHero = tab.isHero;

          const handleClick = () => {
            setActiveTab(tab.id);
          };

          if (isHero) {
            return (
              <button
                key={tab.id}
                onClick={handleClick}
                className="relative flex flex-col items-center justify-center -mt-4 group focus:outline-none"
                aria-label={tab.label}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 ${
                    isActive
                      ? 'bg-forest-900 text-white ring-4 ring-mint-200 scale-105 shadow-glow'
                      : 'bg-gradient-to-tr from-forest-800 to-mint-600 text-white hover:scale-105 shadow-md shadow-mint-500/30'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span
                  className={`text-[10px] font-extrabold mt-1 transition-colors ${
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
                isActive
                  ? 'text-forest-900 font-bold'
                  : 'text-charcoal-400 hover:text-forest-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-forest-900 stroke-[2.5]' : ''}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-mint-600 text-[9px] font-bold text-white flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'text-forest-950 font-extrabold' : 'text-charcoal-500'}`}>
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
