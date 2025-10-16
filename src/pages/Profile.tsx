import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  Star,
  Trophy,
  MapPin,
  SprayCan,
  DollarSign,
  TrendingUp,
  Calendar,
  Award,
  Package,
  Palette,
  Shield,
  Zap
} from 'lucide-react';
import { useGame } from '@/contexts/GameContext';

interface PaintingTool {
  id: string;
  name: string;
  type: string;
  durability: number;
  owned: boolean;
  price: number;
  stats: {
    coverageSpeed: number;
    precision: number;
    flowRate: number;
  };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedDate?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const Profile: React.FC = () => {
  const { gameState } = useGame();
  const [activeTab, setActiveTab] = useState('stats');

  // Mock player data - würde später vom Backend kommen
  const playerData = {
    username: 'SprayMaster',
    level: 15,
    xp: 7500,
    xpToNextLevel: 10000,
    reputation: gameState.fame,
    money: gameState.money,
    joinDate: '2025-01-15',
    crewName: 'Urban Legends',
    crewTag: 'UL',
    rank: 'Elite',
  };

  const tools: PaintingTool[] = [
    {
      id: '1',
      name: 'Standard Spray Can',
      type: 'SprayCan',
      durability: 85,
      owned: true,
      price: 0,
      stats: { coverageSpeed: 60, precision: 50, flowRate: 70 }
    },
    {
      id: '2',
      name: 'Fat Cap Pro',
      type: 'FatCap',
      durability: 92,
      owned: true,
      price: 250,
      stats: { coverageSpeed: 90, precision: 40, flowRate: 85 }
    },
    {
      id: '3',
      name: 'Skinny Cap Elite',
      type: 'SkinnyCap',
      durability: 78,
      owned: true,
      price: 300,
      stats: { coverageSpeed: 50, precision: 95, flowRate: 60 }
    },
    {
      id: '4',
      name: 'Paint Roller XL',
      type: 'PaintRoller',
      durability: 100,
      owned: false,
      price: 500,
      stats: { coverageSpeed: 100, precision: 30, flowRate: 90 }
    },
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'First Tag',
      description: 'Bemale deinen ersten Spot',
      unlocked: true,
      unlockedDate: '2025-01-15',
      rarity: 'common'
    },
    {
      id: '2',
      name: 'Stealth Master',
      description: 'Bemale 10 Spots ohne erwischt zu werden',
      unlocked: true,
      unlockedDate: '2025-02-01',
      rarity: 'rare'
    },
    {
      id: '3',
      name: 'Night Owl',
      description: 'Bemale 5 Spots zwischen 2-4 Uhr nachts',
      unlocked: true,
      unlockedDate: '2025-02-10',
      rarity: 'epic'
    },
    {
      id: '4',
      name: 'Legend Status',
      description: 'Erreiche 10.000 Fame',
      unlocked: false,
      rarity: 'legendary'
    },
    {
      id: '5',
      name: 'Crew Leader',
      description: 'Gründe eine Crew mit 10+ Members',
      unlocked: false,
      rarity: 'epic'
    },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-primary/20 text-primary border-primary';
      case 'epic': return 'bg-purple-500/20 text-purple-400 border-purple-500';
      case 'rare': return 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan';
      case 'common': return 'bg-neon-lime/20 text-neon-lime border-neon-lime';
      default: return 'bg-muted/20 text-muted-foreground border-muted-foreground';
    }
  };

  const getDurabilityColor = (durability: number) => {
    if (durability >= 70) return 'bg-neon-lime';
    if (durability >= 40) return 'bg-neon-orange';
    return 'bg-destructive';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-2 border-primary/20">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-primary">
                <AvatarFallback className="bg-primary/20 text-primary text-3xl font-black">
                  {playerData.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black">{playerData.username}</h1>
                  {playerData.crewTag && (
                    <Badge className="bg-primary/20 text-primary border-primary text-lg px-3 py-1">
                      [{playerData.crewTag}]
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <Badge className={getRarityColor('epic')}>
                    <Shield className="w-3 h-3 mr-1" />
                    {playerData.rank}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Member seit {new Date(playerData.joinDate).toLocaleDateString('de-DE')}
                  </span>
                </div>
                {playerData.crewName && (
                  <div className="text-sm text-muted-foreground mt-2">
                    Crew: <span className="text-primary font-bold">{playerData.crewName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold">Level {playerData.level}</span>
              <span className="text-sm text-muted-foreground">
                {playerData.xp.toLocaleString()} / {playerData.xpToNextLevel.toLocaleString()} XP
              </span>
            </div>
            <Progress value={(playerData.xp / playerData.xpToNextLevel) * 100} className="h-3" />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card className="p-4 bg-neon-orange/10 border-neon-orange">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-neon-orange" />
                <span className="text-xs text-muted-foreground">Fame</span>
              </div>
              <div className="text-2xl font-black text-neon-orange">{gameState.fame.toLocaleString()}</div>
            </Card>
            <Card className="p-4 bg-neon-lime/10 border-neon-lime">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-neon-lime" />
                <span className="text-xs text-muted-foreground">Money</span>
              </div>
              <div className="text-2xl font-black text-neon-lime">${gameState.money.toLocaleString()}</div>
            </Card>
            <Card className="p-4 bg-neon-cyan/10 border-neon-cyan">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-neon-cyan" />
                <span className="text-xs text-muted-foreground">Spots</span>
              </div>
              <div className="text-2xl font-black text-neon-cyan">{gameState.stats.spotsPainted}</div>
            </Card>
            <Card className="p-4 bg-primary/10 border-primary">
              <div className="flex items-center gap-2 mb-2">
                <SprayCan className="w-5 h-5 text-primary" />
                <span className="text-xs text-muted-foreground">Pieces</span>
              </div>
              <div className="text-2xl font-black text-primary">{gameState.stats.totalPieces}</div>
            </Card>
          </div>
        </Card>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">Statistiken</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Deine Statistiken
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-muted-foreground">Total Pieces</span>
                    <span className="text-xl font-black">{gameState.stats.totalPieces}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-muted-foreground">Spots Bemalt</span>
                    <span className="text-xl font-black">{gameState.stats.spotsPainted}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-muted-foreground">Best Fame</span>
                    <span className="text-xl font-black text-neon-orange">{gameState.stats.bestFame}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-muted-foreground">Total Geld verdient</span>
                    <span className="text-xl font-black text-neon-lime">${(gameState.stats.totalPieces * 150).toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-muted-foreground">Mal-Sessions</span>
                    <span className="text-xl font-black">{gameState.stats.totalPieces}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-muted-foreground">Erwischt</span>
                    <span className="text-xl font-black text-destructive">12</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-muted-foreground">Erfolgsrate</span>
                    <span className="text-xl font-black text-neon-cyan">78%</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-muted-foreground">Spielzeit</span>
                    <span className="text-xl font-black">24h 32min</span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
                <Package className="w-6 h-6 text-primary" />
                Dein Inventory
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {tools.map((tool) => (
                  <Card
                    key={tool.id}
                    className={`p-4 ${tool.owned ? 'bg-card/50' : 'bg-card/30 opacity-60'} backdrop-blur hover:bg-card/70 transition-colors`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          tool.owned ? 'bg-primary/20' : 'bg-muted/20'
                        }`}>
                          <SprayCan className={`w-6 h-6 ${tool.owned ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <div className="font-bold">{tool.name}</div>
                          <div className="text-xs text-muted-foreground">{tool.type}</div>
                        </div>
                      </div>
                      {!tool.owned && (
                        <Button size="sm" variant="outline">
                          ${tool.price}
                        </Button>
                      )}
                    </div>

                    {tool.owned && (
                      <>
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Haltbarkeit</span>
                            <span className="font-bold">{tool.durability}%</span>
                          </div>
                          <div className="w-full bg-muted/30 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getDurabilityColor(tool.durability)}`}
                              style={{ width: `${tool.durability}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Coverage Speed:</span>
                            <span className="font-bold">{tool.stats.coverageSpeed}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Precision:</span>
                            <span className="font-bold">{tool.stats.precision}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Flow Rate:</span>
                            <span className="font-bold">{tool.stats.flowRate}%</span>
                          </div>
                        </div>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            </Card>

            {/* Colors Section */}
            <Card className="p-6">
              <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Farben
              </h3>
              <div className="grid grid-cols-8 gap-3">
                {['#FF006E', '#8338EC', '#3A86FF', '#06FFA5', '#FFBE0B', '#FB5607', '#FF006E', '#06FFA5'].map((color, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg border-2 border-border cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-neon-orange" />
                Achievements
              </h3>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={`p-4 ${achievement.unlocked ? 'bg-card/70' : 'bg-card/30 opacity-60'} backdrop-blur`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                          achievement.unlocked
                            ? 'bg-neon-orange/20 border-2 border-neon-orange'
                            : 'bg-muted/20 border-2 border-muted'
                        }`}>
                          {achievement.unlocked ? (
                            <Award className="w-8 h-8 text-neon-orange" />
                          ) : (
                            <Award className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-lg">{achievement.name}</span>
                            <Badge className={getRarityColor(achievement.rarity)}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          {achievement.unlocked && achievement.unlockedDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Freigeschaltet am {new Date(achievement.unlockedDate).toLocaleDateString('de-DE')}
                            </p>
                          )}
                        </div>
                      </div>
                      {achievement.unlocked && (
                        <Zap className="w-6 h-6 text-neon-orange" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
