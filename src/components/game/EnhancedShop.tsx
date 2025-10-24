import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGame } from '@/contexts/GameContext';
import {
  SprayCan, Paintbrush, Palette, ShoppingCart,
  Star, DollarSign, Lock, Check, Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface Tool {
  id: string;
  name: string;
  type: 'spray' | 'brush' | 'marker' | 'roller';
  description: string;
  cost: number;
  durability: number;
  stats: {
    coverageSpeed: number;
    precision: number;
    flowRate: number;
    sprayWidth: number;
  };
  unlocked: boolean;
  owned: boolean;
}

interface PaintColor {
  id: string;
  name: string;
  color: string;
  cost: number; // per 100ml
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
}

const TOOLS: Tool[] = [
  {
    id: 'tool-basic-spray',
    name: 'Basic Spray Can',
    type: 'spray',
    description: 'Standard Sprühdose für Anfänger',
    cost: 0,
    durability: 100,
    stats: {  coverageSpeed: 1.0,
      precision: 0.5,
      flowRate: 1.0,
      sprayWidth: 1.0,
    },
    unlocked: true,
    owned: true,
  },
  {
    id: 'tool-fat-cap',
    name: 'Fat Cap Spray',
    type: 'spray',
    description: 'Breite Düse für große Flächen',
    cost: 50,
    durability: 150,
    stats: {
      coverageSpeed: 1.8,
      precision: 0.3,
      flowRate: 1.5,
      sprayWidth: 2.0,
    },
    unlocked: true,
    owned: false,
  },
  {
    id: 'tool-skinny-cap',
    name: 'Skinny Cap',
    type: 'spray',
    description: 'Schmale Düse für Details',
    cost: 50,
    durability: 150,
    stats: {
      coverageSpeed: 0.6,
      precision: 1.8,
      flowRate: 0.7,
      sprayWidth: 0.4,
    },
    unlocked: true,
    owned: false,
  },
  {
    id: 'tool-marker',
    name: 'Pro Marker',
    type: 'marker',
    description: 'Professioneller Marker für präzise Linien',
    cost: 35,
    durability: 200,
    stats: {
      coverageSpeed: 0.8,
      precision: 2.0,
      flowRate: 0.8,
      sprayWidth: 0.3,
    },
    unlocked: true,
    owned: false,
  },
  {
    id: 'tool-brush',
    name: 'Paint Brush',
    type: 'brush',
    description: 'Pinsel für sanfte Übergänge',
    cost: 75,
    durability: 180,
    stats: {
      coverageSpeed: 1.2,
      precision: 1.5,
      flowRate: 1.0,
      sprayWidth: 0.8,
    },
    unlocked: false,
    owned: false,
  },
  {
    id: 'tool-roller',
    name: 'Paint Roller',
    type: 'roller',
    description: 'Rolle für riesige Flächen',
    cost: 120,
    durability: 120,
    stats: {
      coverageSpeed: 2.5,
      precision: 0.2,
      flowRate: 2.0,
      sprayWidth: 3.0,
    },
    unlocked: false,
    owned: false,
  },
];

const PAINT_COLORS: PaintColor[] = [
  { id: 'c1', name: 'Hot Pink', color: '#FF1493', cost: 0, rarity: 'common', unlocked: true },
  { id: 'c2', name: 'Cyan', color: '#00FFFF', cost: 0, rarity: 'common', unlocked: true },
  { id: 'c3', name: 'Neon Lime', color: '#00FF00', cost: 10, rarity: 'common', unlocked: true },
  { id: 'c4', name: 'Orange Blast', color: '#FF6600', cost: 10, rarity: 'common', unlocked: true },
  { id: 'c5', name: 'Purple Haze', color: '#9933FF', cost: 15, rarity: 'rare', unlocked: true },
  { id: 'c6', name: 'Gold Rush', color: '#FFD700', cost: 20, rarity: 'rare', unlocked: false },
  { id: 'c7', name: 'Blood Red', color: '#FF0000', cost: 10, rarity: 'common', unlocked: true },
  { id: 'c8', name: 'Pure White', color: '#FFFFFF', cost: 5, rarity: 'common', unlocked: true },
  { id: 'c9', name: 'Midnight Black', color: '#000000', cost: 5, rarity: 'common', unlocked: true },
  { id: 'c10', name: 'Chrome Silver', color: '#C0C0C0', cost: 25, rarity: 'epic', unlocked: false },
  { id: 'c11', name: 'Toxic Green', color: '#39FF14', cost: 30, rarity: 'epic', unlocked: false },
  { id: 'c12', name: 'Legendary Gold', color: '#FFD700', cost: 50, rarity: 'legendary', unlocked: false },
];

export const EnhancedShop: React.FC = () => {
  const { gameState, spendMoney, addMoney } = useGame();
  const [selectedTab, setSelectedTab] = useState<'tools' | 'colors' | 'specials'>('tools');
  const [ownedTools, setOwnedTools] = useState<string[]>(['tool-basic-spray']);
  const [ownedColors, setOwnedColors] = useState<string[]>(['c1', 'c2', 'c3', 'c4', 'c5', 'c7', 'c8', 'c9']);

  const handleBuyTool = (tool: Tool) => {
    if (ownedTools.includes(tool.id)) {
      toast.error('Du besitzt dieses Tool bereits!');
      return;
    }

    if (!tool.unlocked) {
      toast.error('Dieses Tool ist noch nicht freigeschaltet!');
      return;
    }

    if (spendMoney(tool.cost)) {
      setOwnedTools([...ownedTools, tool.id]);
      toast.success(`${tool.name} gekauft!`);
    } else {
      toast.error('Nicht genug Geld!');
    }
  };

  const handleBuyColor = (color: PaintColor, quantity: number = 1) => {
    if (!color.unlocked) {
      toast.error('Diese Farbe ist noch nicht freigeschaltet!');
      return;
    }

    const totalCost = color.cost * quantity;
    if (spendMoney(totalCost)) {
      if (!ownedColors.includes(color.id)) {
        setOwnedColors([...ownedColors, color.id]);
      }
      toast.success(`${color.name} x${quantity} gekauft!`);
    } else {
      toast.error('Nicht genug Geld!');
    }
  };

  const getRarityColor = (rarity: PaintColor['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-urban-dark p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase mb-2">Shop</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-neon-lime" />
            <span className="text-xl font-bold">${gameState.money}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-neon-orange" />
            <span className="text-xl font-bold">{gameState.fame} Fame</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)} className="flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tools">
            <SprayCan className="w-4 h-4 mr-2" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="colors">
            <Palette className="w-4 h-4 mr-2" />
            Farben
          </TabsTrigger>
          <TabsTrigger value="specials">
            <Zap className="w-4 h-4 mr-2" />
            Specials
          </TabsTrigger>
        </TabsList>

        {/* Tools Tab */}
        <TabsContent value="tools" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {TOOLS.map(tool => {
              const owned = ownedTools.includes(tool.id);
              return (
                <Card key={tool.id} className={`p-4 lg:p-5 min-h-[220px] ${owned ? 'border-neon-lime' : ''}`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{tool.name}</h3>
                        <p className="text-xs text-muted-foreground">{tool.description}</p>
                      </div>
                      {owned && <Check className="w-5 h-5 text-neon-lime" />}
                      {!tool.unlocked && <Lock className="w-5 h-5 text-muted-foreground" />}
                    </div>

                    {/* Stats */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coverage Speed:</span>
                        <span className="font-bold">{(tool.stats.coverageSpeed * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Precision:</span>
                        <span className="font-bold">{(tool.stats.precision * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Durability:</span>
                        <span className="font-bold">{tool.durability}</span>
                      </div>
                    </div>

                    {/* Price & Buy */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-neon-lime" />
                        <span className="font-black text-lg">{tool.cost}</span>
                      </div>
                      <Button
                        onClick={() => handleBuyTool(tool)}
                        disabled={owned || !tool.unlocked}
                        size="sm"
                        className="gap-2"
                      >
                        {owned ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                        {owned ? 'Besitz' : 'Kaufen'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 lg:gap-5">
            {PAINT_COLORS.map(color => {
              const owned = ownedColors.includes(color.id);
              return (
                <Card key={color.id} className={`p-4 min-h-[220px] ${owned ? 'border-neon-lime' : ''}`}>
                  <div className="space-y-3">
                    {/* Color Preview */}
                    <div
                      className="w-full h-24 rounded-lg border-2 border-border"
                      style={{ backgroundColor: color.color }}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-sm">{color.name}</h3>
                        {owned && <Check className="w-4 h-4 text-neon-lime" />}
                        {!color.unlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <Badge className={`text-xs ${getRarityColor(color.rarity)}`}>
                        {color.rarity.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-neon-lime" />
                        <span className="font-bold text-sm">{color.cost}/100ml</span>
                      </div>
                      <Button
                        onClick={() => handleBuyColor(color, 1)}
                        disabled={!color.unlocked}
                        size="sm"
                        variant="outline"
                      >
                        Kaufen
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Specials Tab */}
        <TabsContent value="specials" className="mt-4">
          <Card className="p-8 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-2">Special Items</h3>
            <p className="text-muted-foreground">
              Spezielle Items und Power-Ups kommen bald!
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
