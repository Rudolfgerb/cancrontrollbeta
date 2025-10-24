import React from 'react';
import { Button } from '@/components/ui/button';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Home, Map, ShoppingBag, Users, User, Settings } from 'lucide-react';

type GameView = 'hideout' | 'map' | 'shop' | 'painting' | 'crew' | 'profile' | 'settings';

interface BottomNavBarProps {
  currentView: GameView;
  setCurrentView: (view: GameView) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, setCurrentView }) => {
  const { playClick } = useSoundEffects();

  const navItems = [
    { view: 'hideout', icon: Home, label: 'Hideout' },
    { view: 'map', icon: Map, label: 'Map' },
    { view: 'shop', icon: ShoppingBag, label: 'Shop' },
    { view: 'crew', icon: Users, label: 'Crew' },
    { view: 'profile', icon: User, label: 'Profile' },
    { view: 'settings', icon: Settings, label: 'Settings' },
  ] as const;

  const handleNavClick = (view: GameView) => {
    playClick();
    setCurrentView(view);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-urban-surface border-t-2 border-urban-border z-30 md:hidden safe-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Button
            key={item.view}
            variant="ghost"
            className={`flex flex-col items-center justify-center h-full w-full rounded-none ${
              currentView === item.view ? 'text-primary bg-primary/10' : 'text-muted-foreground'
            }`}
            onClick={() => handleNavClick(item.view)}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-bold">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
