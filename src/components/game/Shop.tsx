import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { ShoppingBag, Lock, Check } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { toast } from 'sonner';

const availableColors = [
  { id: '#FF1493', name: 'Neon Pink', cost: 0, fameRequired: 0 },
  { id: '#00FFFF', name: 'Neon Cyan', cost: 0, fameRequired: 0 },
  { id: '#ADFF2F', name: 'Neon Lime', cost: 20, fameRequired: 10 },
  { id: '#FF6B35', name: 'Neon Orange', cost: 30, fameRequired: 25 },
  { id: '#9D4EDD', name: 'Electric Purple', cost: 40, fameRequired: 50 },
  { id: '#FFD700', name: 'Gold', cost: 60, fameRequired: 100 },
  { id: '#FF00FF', name: 'Magenta', cost: 50, fameRequired: 75 },
  { id: '#00FF00', name: 'Toxic Green', cost: 45, fameRequired: 60 },
];

const availableDesigns = [
  { id: 'simple-tag', name: 'Simple Tag', type: 'tag', cost: 0, fameRequired: 0 },
  { id: 'bubble-throw', name: 'Bubble Throw-up', type: 'throwup', cost: 50, fameRequired: 30 },
  { id: 'wildstyle', name: 'Wildstyle', type: 'piece', cost: 100, fameRequired: 75 },
  { id: 'character', name: 'Character', type: 'piece', cost: 150, fameRequired: 120 },
  { id: '3d-piece', name: '3D Piece', type: 'piece', cost: 200, fameRequired: 200 },
];

export const Shop: React.FC = () => {
  const { gameState, spendMoney, unlockColor, selectColor, unlockDesign, selectDesign } = useGame();
  const { playSuccess, playClick } = useSoundEffects();

  const handleBuyColor = (color: typeof availableColors[0]) => {
    if (gameState.inventory.colors.includes(color.id)) {
      selectColor(color.id);
      playClick();
      toast.success(`${color.name} ausgewählt!`);
      return;
    }

    if (gameState.fame < color.fameRequired) {
      toast.error(`Nicht genug Fame! Benötigt: ${color.fameRequired}`);
      return;
    }

    if (spendMoney(color.cost)) {
      unlockColor(color.id);
      selectColor(color.id);
      playSuccess();
      toast.success(`${color.name} gekauft und ausgewählt!`);
    } else {
      toast.error(`Nicht genug Geld! Benötigt: $${color.cost}`);
    }
  };

  const handleBuyDesign = (design: typeof availableDesigns[0]) => {
    if (gameState.inventory.designs.includes(design.id)) {
      selectDesign(design.id);
      playClick();
      toast.success(`${design.name} ausgewählt!`);
      return;
    }

    if (gameState.fame < design.fameRequired) {
      toast.error(`Nicht genug Fame! Benötigt: ${design.fameRequired}`);
      return;
    }

    if (spendMoney(design.cost)) {
      unlockDesign(design.id);
      selectDesign(design.id);
      playSuccess();
      toast.success(`${design.name} gekauft und ausgewählt!`);
    } else {
      toast.error(`Nicht genug Geld! Benötigt: $${design.cost}`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-urban-dark overflow-y-auto">
      {/* Header */}
      <div className="bg-urban-surface border-b-2 border-urban-border p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-black uppercase tracking-tight">Shop</h2>
        </div>
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Geld: </span>
            <span className="font-black text-neon-lime">${gameState.money}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Fame: </span>
            <span className="font-black text-neon-orange">{gameState.fame}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Colors Section */}
        <section>
          <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary" />
            Spray Colors
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableColors.map((color) => {
              const isOwned = gameState.inventory.colors.includes(color.id);
              const isSelected = gameState.inventory.selectedColor === color.id;
              const isLocked = !isOwned && gameState.fame < color.fameRequired;

              return (
                <Card
                  key={color.id}
                  className={`p-4 cursor-pointer transition-all relative ${
                    isSelected ? 'border-2 border-primary shadow-neon' : 'hover:border-primary/50'
                  } ${isLocked ? 'opacity-50' : ''}`}
                  onClick={() => !isLocked && handleBuyColor(color)}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className="w-full h-16 rounded-lg mb-3 border-2 border-border"
                    style={{ backgroundColor: color.id }}
                  />
                  <div className="text-sm font-bold mb-1">{color.name}</div>
                  <div className="flex items-center justify-between text-xs">
                    {isOwned ? (
                      <span className="text-neon-lime font-bold">OWNED</span>
                    ) : (
                      <>
                        <span className="text-muted-foreground">${color.cost}</span>
                        {isLocked && (
                          <div className="flex items-center gap-1 text-destructive">
                            <Lock className="w-3 h-3" />
                            <span>{color.fameRequired}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Designs Section */}
        <section>
          <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-secondary" />
            Graffiti Designs
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {availableDesigns.map((design) => {
              const isOwned = gameState.inventory.designs.includes(design.id);
              const isSelected = gameState.inventory.selectedDesign === design.id;
              const isLocked = !isOwned && gameState.fame < design.fameRequired;

              return (
                <Card
                  key={design.id}
                  className={`p-4 cursor-pointer transition-all relative ${
                    isSelected ? 'border-2 border-secondary shadow-neon' : 'hover:border-secondary/50'
                  } ${isLocked ? 'opacity-50' : ''}`}
                  onClick={() => !isLocked && handleBuyDesign(design)}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-secondary-foreground" />
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold mb-1">{design.name}</div>
                      <div className="text-xs text-muted-foreground uppercase">{design.type}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                      design.type === 'tag' ? 'bg-neon-lime/20 text-neon-lime' :
                      design.type === 'throwup' ? 'bg-neon-cyan/20 text-neon-cyan' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {design.type.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-3">
                    {isOwned ? (
                      <span className="text-neon-lime font-bold">UNLOCKED</span>
                    ) : (
                      <>
                        <span className="text-muted-foreground font-bold">${design.cost}</span>
                        {isLocked && (
                          <div className="flex items-center gap-1 text-destructive">
                            <Lock className="w-4 h-4" />
                            <span>{design.fameRequired} Fame</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
