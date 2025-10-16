import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
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
  Zap,
  Search,
  Filter
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { AchievementCategory, AchievementRarity } from '@/data/achievements';
import { cn } from '@/lib/utils';

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

const Profile: React.FC = () => {
  const { gameState } = useGame();
  const { getAllAchievements, achievementStats } = useAchievements();
  const [activeTab, setActiveTab] = useState('stats');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<AchievementRarity | 'all'>('all');

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

  // Get all achievements with status
  const allAchievements = getAllAchievements();

  // Filter achievements
  const filteredAchievements = allAchievements.filter(achievement => {
    const matchesSearch = searchQuery === '' ||
      achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesRarity = selectedRarity === 'all' || achievement.rarity === selectedRarity;
    return matchesSearch && matchesCategory && matchesRarity;
  });

  const getRarityColor = (rarity: AchievementRarity) => {
    switch (rarity) {
      case 'MYTHIC': return 'bg-gradient-to-r from-primary/20 via-purple-500/20 to-neon-cyan/20 text-primary border-primary';
      case 'LEGENDARY': return 'bg-primary/20 text-primary border-primary';
      case 'EPIC': return 'bg-purple-500/20 text-purple-400 border-purple-500';
      case 'RARE': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'UNCOMMON': return 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan';
      case 'COMMON': return 'bg-neon-lime/20 text-neon-lime border-neon-lime';
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
            {/* Achievement Stats Overview */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4 bg-primary/10 border-primary">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-xs text-muted-foreground">Gesamt</span>
                </div>
                <div className="text-2xl font-black text-primary">{achievementStats.total}</div>
              </Card>
              <Card className="p-4 bg-neon-lime/10 border-neon-lime">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-neon-lime" />
                  <span className="text-xs text-muted-foreground">Freigeschaltet</span>
                </div>
                <div className="text-2xl font-black text-neon-lime">{achievementStats.unlocked}</div>
              </Card>
              <Card className="p-4 bg-muted/10 border-muted">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Gesperrt</span>
                </div>
                <div className="text-2xl font-black">{achievementStats.locked}</div>
              </Card>
              <Card className="p-4 bg-neon-orange/10 border-neon-orange">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-neon-orange" />
                  <span className="text-xs text-muted-foreground">Fortschritt</span>
                </div>
                <div className="text-2xl font-black text-neon-orange">
                  {Math.round((achievementStats.unlocked / achievementStats.total) * 100)}%
                </div>
              </Card>
            </div>

            {/* Filters */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Achievements durchsuchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as AchievementCategory | 'all')}
                  className="px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Alle Kategorien</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Train">Train</option>
                  <option value="Art">Art</option>
                  <option value="Stealth">Stealth</option>
                  <option value="Location">Location</option>
                  <option value="Prestige">Prestige</option>
                  <option value="Speed">Speed</option>
                  <option value="Special">Special</option>
                </select>

                {/* Rarity Filter */}
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value as AchievementRarity | 'all')}
                  className="px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Alle Seltenheiten</option>
                  <option value="COMMON">Common</option>
                  <option value="UNCOMMON">Uncommon</option>
                  <option value="RARE">Rare</option>
                  <option value="EPIC">Epic</option>
                  <option value="LEGENDARY">Legendary</option>
                  <option value="MYTHIC">Mythic</option>
                </select>
              </div>

              <div className="mt-3 text-sm text-muted-foreground">
                Zeige {filteredAchievements.length} von {allAchievements.length} Achievements
              </div>
            </Card>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 gap-3">
              {filteredAchievements.map((achievement) => {
                const IconComponent = (LucideIcons as any)[achievement.icon] || LucideIcons.Award;

                return (
                  <Card
                    key={achievement.id}
                    className={cn(
                      'p-4 backdrop-blur transition-all hover:scale-[1.02]',
                      achievement.unlocked ? 'bg-card/70 border-2' : 'bg-card/30 opacity-70'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={cn(
                          'w-16 h-16 rounded-lg flex items-center justify-center border-2 flex-shrink-0',
                          achievement.unlocked
                            ? getRarityColor(achievement.rarity)
                            : 'bg-muted/20 border-muted'
                        )}
                      >
                        <IconComponent
                          className={cn(
                            'w-8 h-8',
                            achievement.unlocked ? '' : 'text-muted-foreground'
                          )}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-bold text-lg">{achievement.name}</span>
                              <Badge className={cn('border', getRarityColor(achievement.rarity))}>
                                {achievement.rarity}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {achievement.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                          </div>

                          {achievement.unlocked && (
                            <Zap className="w-6 h-6 text-neon-orange flex-shrink-0" />
                          )}
                        </div>

                        {/* Progress Bar (for locked achievements) */}
                        {!achievement.unlocked && achievement.progress > 0 && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Fortschritt</span>
                              <span className="font-bold">{Math.round(achievement.progress)}%</span>
                            </div>
                            <Progress value={achievement.progress} className="h-2" />
                          </div>
                        )}

                        {/* Rewards */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {achievement.rewards.exp > 0 && (
                            <div className="flex items-center gap-1 bg-purple-500/20 px-2 py-1 rounded border border-purple-500/50">
                              <Zap className="w-3 h-3 text-purple-400" />
                              <span className="font-bold text-purple-400">+{achievement.rewards.exp} XP</span>
                            </div>
                          )}
                          {achievement.rewards.money > 0 && (
                            <div className="flex items-center gap-1 bg-neon-lime/20 px-2 py-1 rounded border border-neon-lime/50">
                              <DollarSign className="w-3 h-3 text-neon-lime" />
                              <span className="font-bold text-neon-lime">${achievement.rewards.money}</span>
                            </div>
                          )}
                          {achievement.rewards.reputation > 0 && (
                            <div className="flex items-center gap-1 bg-neon-orange/20 px-2 py-1 rounded border border-neon-orange/50">
                              <Star className="w-3 h-3 text-neon-orange" />
                              <span className="font-bold text-neon-orange">+{achievement.rewards.reputation} Rep</span>
                            </div>
                          )}
                          {achievement.rewards.unlocks && achievement.rewards.unlocks.length > 0 && (
                            <div className="flex items-center gap-1 bg-primary/20 px-2 py-1 rounded border border-primary/50">
                              <Package className="w-3 h-3 text-primary" />
                              <span className="font-bold text-primary">{achievement.rewards.unlocks.length} Item(s)</span>
                            </div>
                          )}
                        </div>

                        {/* Unlocked date */}
                        {achievement.unlocked && achievement.unlockedAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Freigeschaltet am {new Date(achievement.unlockedAt).toLocaleDateString('de-DE', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {filteredAchievements.length === 0 && (
              <Card className="p-12 text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">Keine Achievements gefunden</h3>
                <p className="text-muted-foreground">
                  Versuche andere Filter oder Suchbegriffe.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
