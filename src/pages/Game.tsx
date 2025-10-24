import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CityMap } from '@/components/game/CityMap';
import { PaintCanvas } from '@/components/game/PaintCanvas';
import { ImprovedPaintCanvasWithStealth } from '@/components/game/ImprovedPaintCanvasWithStealth';
import { EnhancedGoogleMap } from '@/components/game/EnhancedGoogleMap';
import { Shop } from '@/components/game/Shop';
import { EnhancedShop } from '@/components/game/EnhancedShop';
import { EnhancedHideout } from '@/components/game/EnhancedHideout';
import { Gallery } from '@/components/game/Gallery';
import Crew from './Crew';
import Profile from './Profile';
import Settings from './Settings';
import { useGame, Spot } from '@/contexts/GameContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useIsMobile } from '@/hooks/use-mobile';
import { BottomNavBar } from '@/components/game/BottomNavBar';
import { Map, ShoppingBag, Home, Star, DollarSign, AlertTriangle, Trophy, SprayCan, Users, User, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { galleryService } from '@/lib/gallery';
import { getCurrentUser } from '@/lib/userHelper';
import { calculateUserStats } from '@/lib/statsHelper';

interface CapturedSpot {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  heading: number;
  pitch: number;
  imageData: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  timestamp: number;
  userId?: string;
}

type GameView = 'hideout' | 'map' | 'shop' | 'painting' | 'crew' | 'profile' | 'settings' | 'gallery';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<GameView>('hideout');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [selectedCapturedSpot, setSelectedCapturedSpot] = useState<CapturedSpot | null>(null);
  const [capturedSpots, setCapturedSpots] = useState<CapturedSpot[]>([]);
  const [showSpotDialog, setShowSpotDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [paintResult, setPaintResult] = useState<{ quality: number; fame: number; money: number } | null>(null);
  const isMobile = useIsMobile();

  const { gameState, selectSpot, paintSpot, resetWanted, getArrested } = useGame();
  const { trackAction } = useAchievements();
  const { playClick, playSuccess, playBusted } = useSoundEffects();

  // Calculate real user stats from gallery
  const userStats = calculateUserStats();

  const handleSpotCapture = (spot: CapturedSpot) => {
    playSuccess();
    setCapturedSpots(prev => [...prev, spot]);
    setSelectedCapturedSpot(spot);
    setCurrentView('painting');
    toast.success(`Spot erfasst! Los geht's mit dem Malen!`);

    // Track achievements
    trackAction('spots_captured', capturedSpots.length + 1);
    trackAction('screenshots', 1);
  };

  const handleCapturedSpotSelect = (spot: CapturedSpot) => {
    playClick();
    setSelectedCapturedSpot(spot);
    setCurrentView('painting');
  };

  const handleSpotSelect = (spot: Spot) => {
    if (spot.painted) {
      toast.error('Dieser Spot wurde bereits bemalt!');
      return;
    }
    setSelectedSpot(spot);
    setShowSpotDialog(true);
    selectSpot(spot);
  };

  const handleStartPainting = () => {
    playClick();
    setShowSpotDialog(false);
    setCurrentView('painting');
  };

  const handlePaintComplete = (quality: number) => {
    let fameEarned = 0;
    let moneyEarned = 0;
    const currentDifficulty = selectedSpot?.difficulty || selectedCapturedSpot?.difficulty;

    if (selectedSpot) {
      fameEarned = Math.floor(selectedSpot.fameReward * quality);
      moneyEarned = Math.floor(selectedSpot.moneyReward * quality);
      paintSpot(selectedSpot.id, quality);
    } else if (selectedCapturedSpot) {
      // Calculate rewards based on difficulty for captured spots
      const baseRewards = {
        easy: { fame: 50, money: 100 },
        medium: { fame: 100, money: 200 },
        hard: { fame: 200, money: 400 },
        extreme: { fame: 500, money: 1000 },
      };
      const rewards = baseRewards[selectedCapturedSpot.difficulty];
      fameEarned = Math.floor(rewards.fame * quality);
      moneyEarned = Math.floor(rewards.money * quality);
    }

    setPaintResult({ quality, fame: fameEarned, money: moneyEarned });

    // Track achievements
    trackAction('pieces_completed', gameState.stats.totalPieces + 1);
    trackAction('spots_painted', gameState.stats.spotsPainted + 1);
    trackAction('fame', gameState.fame + fameEarned);
    trackAction('money_earned', moneyEarned);

    // Track quality-based achievements
    if (quality >= 0.9) {
      trackAction('high_quality_pieces', 1);
    }
    if (quality >= 0.95) {
      trackAction('masterpieces', 1);
    }

    // Track difficulty-based achievements
    if (currentDifficulty === 'hard') {
      trackAction('hard_pieces', 1);
    }
    if (currentDifficulty === 'extreme') {
      trackAction('extreme_pieces', 1);
    }

    // Track time-based achievements
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) {
      trackAction('night_pieces', 1);
    }
    if (hour >= 5 && hour < 8) {
      trackAction('morning_pieces', 1);
    }

    playSuccess();
    setShowResultDialog(true);
    setCurrentView('map');
    setSelectedSpot(null);
    setSelectedCapturedSpot(null);

    // Reset wanted level after successful paint
    if (gameState.wantedLevel > 0) {
      setTimeout(() => resetWanted(), 3000);
    }
  };

  const handleBusted = () => {
    playBusted();
    getArrested();
    toast.error(`Erwischt! Du verlierst 30% deines Geldes.`);
    setCurrentView('map');
    setSelectedSpot(null);
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'bg-neon-lime/20 text-neon-lime border-neon-lime',
      medium: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan',
      hard: 'bg-neon-orange/20 text-neon-orange border-neon-orange',
      extreme: 'bg-primary/20 text-primary border-primary',
    };
    return colors[difficulty as keyof typeof colors] || colors.easy;
  };

  const getQualityText = (quality: number) => {
    if (quality >= 0.9) return { text: 'Masterpiece!', color: 'text-primary' };
    if (quality >= 0.7) return { text: 'Excellent!', color: 'text-neon-lime' };
    if (quality >= 0.5) return { text: 'Good!', color: 'text-neon-cyan' };
    if (quality >= 0.3) return { text: 'Okay', color: 'text-neon-orange' };
    return { text: 'Weak...', color: 'text-muted-foreground' };
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="bg-urban-surface border-b-2 border-urban-border px-4 py-3 sticky top-0 z-20 safe-top">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SprayCan className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-black uppercase tracking-tight">CanControl</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-neon-orange" />
              <span className="font-black">{gameState.fame}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-neon-lime" />
              <span className="font-black">{gameState.money}</span>
            </div>
            {gameState.wantedLevel > 0 && (
              <div className="flex items-center gap-2 bg-destructive/20 px-3 py-1 rounded-full">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="font-black text-destructive text-sm">
                  {Array(gameState.wantedLevel).fill('★').join('')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full">
        {/* Sidebar Navigation */}
        {!isMobile && (
          <div className="md:w-64 lg:w-72 xl:w-80 bg-urban-surface border-r-2 border-urban-border p-4 lg:p-5 space-y-2">
            <Button
              variant={currentView === 'hideout' ? 'default' : 'outline'}
              className="w-full justify-start gap-3"
              onClick={() => {
                playClick();
                setCurrentView('hideout');
              }}
            >
              <Home className="w-5 h-5" />
              Hideout
            </Button>
            <Button
              variant={currentView === 'map' ? 'default' : 'outline'}
              className="w-full justify-start gap-3"
              onClick={() => {
                playClick();
                setCurrentView('map');
              }}
            >
              <Map className="w-5 h-5" />
              Stadt-Map
            </Button>
            <Button
              variant={currentView === 'shop' ? 'default' : 'outline'}
              className="w-full justify-start gap-3"
              onClick={() => {
                playClick();
                setCurrentView('shop');
              }}
            >
              <ShoppingBag className="w-5 h-5" />
              Shop
            </Button>
            <Button
              variant={currentView === 'crew' ? 'default' : 'outline'}
              className="w-full justify-start gap-3"
              onClick={() => {
                playClick();
                setCurrentView('crew');
              }}
            >
              <Users className="w-5 h-5" />
              Crew
            </Button>
            <Button
              variant={currentView === 'profile' ? 'default' : 'outline'}
              className="w-full justify-start gap-3"
              onClick={() => {
                playClick();
                setCurrentView('profile');
              }}
            >
              <User className="w-5 h-5" />
              Profil
            </Button>
            <Button
              variant={currentView === 'settings' ? 'default' : 'outline'}
              className="w-full justify-start gap-3"
              onClick={() => {
                playClick();
                setCurrentView('settings');
              }}
            >
              <SettingsIcon className="w-5 h-5" />
              Einstellungen
            </Button>

            {/* Quick Stats */}
            <Card className="p-4 lg:p-5 mt-6">
              <div className="text-xs lg:text-sm text-muted-foreground uppercase mb-2">Quick Stats</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pieces:</span>
                  <span className="font-bold">{userStats.totalPieces}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durchschn. Qualität:</span>
                  <span className="font-bold text-neon-cyan">{userStats.averageQuality}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Beste Qualität:</span>
                  <span className="font-bold text-neon-lime">{userStats.bestQuality}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">⭐ Rating:</span>
                  <span className="font-bold text-yellow-400">{userStats.averageRatingReceived.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fame:</span>
                  <span className="font-bold text-neon-orange">{gameState.fame}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Main View */}
        <div className={`flex-1 min-h-[600px] overflow-y-auto ${isMobile ? 'pb-16' : ''}`}>
          {currentView === 'hideout' && <EnhancedHideout />}
          {currentView === 'map' && (
            <EnhancedGoogleMap
              onSpotCapture={handleSpotCapture}
              onSpotSelect={handleCapturedSpotSelect}
              capturedSpots={capturedSpots}
            />
          )}
          {currentView === 'shop' && <EnhancedShop />}
          {currentView === 'gallery' && <Gallery />}
          {currentView === 'crew' && <Crew />}
          {currentView === 'profile' && <Profile />}
          {currentView === 'settings' && <Settings />}
          {currentView === 'painting' && (selectedSpot || selectedCapturedSpot) && (
            <ImprovedPaintCanvasWithStealth
              backgroundImage={selectedSpot?.imageData || selectedCapturedSpot?.imageData}
              spotId={selectedSpot?.id || selectedCapturedSpot?.id || ''}
              difficulty={selectedSpot?.difficulty || selectedCapturedSpot?.difficulty || 'medium'}
              onComplete={(quality, imageData, saveToGallery) => {
                // Save to gallery if requested
                if (saveToGallery) {
                  const currentUser = getCurrentUser();
                  galleryService.savePiece({
                    spotId: selectedSpot?.id || selectedCapturedSpot?.id || '',
                    spotName: selectedSpot?.name || selectedCapturedSpot?.name || 'Unknown Spot',
                    imageData,
                    quality,
                    difficulty: selectedSpot?.difficulty || selectedCapturedSpot?.difficulty || 'medium',
                    userId: currentUser.id,
                    username: currentUser.username,
                    crew: currentUser.crew,
                  });
                  toast.success('🎨 Piece in Galerie gespeichert!');
                }
                handlePaintComplete(quality);
              }}
              onCancel={() => {
                setCurrentView('map');
                setSelectedSpot(null);
                setSelectedCapturedSpot(null);
              }}
              onBusted={() => {
                playBusted();
                setCurrentView('hideout');
                setSelectedSpot(null);
                setSelectedCapturedSpot(null);
                toast.error('Du wurdest verhaftet!');
              }}
            />
          )}
        </div>
      </div>

      {isMobile && <BottomNavBar currentView={currentView} setCurrentView={setCurrentView} />}

      {/* Spot Selection Dialog */}
      <Dialog open={showSpotDialog} onOpenChange={setShowSpotDialog}>
        <DialogContent className="max-w-full sm:max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase">{selectedSpot?.name}</DialogTitle>
            <DialogDescription>
              Bist du bereit für diesen Spot?
            </DialogDescription>
          </DialogHeader>
          {selectedSpot && (
            <div className="space-y-4 p-4 sm:p-6">
              <div className={`px-3 py-2 rounded-lg border-2 inline-block ${getDifficultyBadge(selectedSpot.difficulty)}`}>
                <span className="font-bold uppercase text-sm">{selectedSpot.difficulty}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-neon-orange" />
                    <span className="text-sm text-muted-foreground">Fame</span>
                  </div>
                  <div className="text-2xl font-black text-neon-orange">+{selectedSpot.fameReward}</div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-neon-lime" />
                    <span className="text-sm text-muted-foreground">Money</span>
                  </div>
                  <div className="text-2xl font-black text-neon-lime">${selectedSpot.moneyReward}</div>
                </Card>
              </div>

              {selectedSpot.hasGuard && (
                <div className="bg-destructive/20 border border-destructive p-3 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <span className="text-sm font-bold text-destructive">Dieser Spot wird bewacht!</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="w-full sm:w-auto sm:flex-1 min-h-[48px]" onClick={() => setShowSpotDialog(false)}>
                  Abbrechen
                </Button>
                <Button className="w-full sm:w-auto sm:flex-1 min-h-[48px] bg-primary hover:bg-primary/90" onClick={handleStartPainting}>
                  Los geht's!
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-full sm:max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase flex items-center gap-2">
              <Trophy className="w-6 h-6 text-neon-orange" />
              Piece Complete!
            </DialogTitle>
          </DialogHeader>
          {paintResult && (
            <div className="space-y-4 p-4 sm:p-6">
              <div className="text-center">
                <div className={`text-3xl sm:text-4xl font-black mb-2 ${getQualityText(paintResult.quality).color}`}>
                  {getQualityText(paintResult.quality).text}
                </div>
                <div className="text-base sm:text-lg text-muted-foreground">
                  Quality: {(paintResult.quality * 100).toFixed(0)}%
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-4 bg-neon-orange/10 border-neon-orange">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-neon-orange" />
                    <span className="text-sm text-muted-foreground">Fame Earned</span>
                  </div>
                  <div className="text-2xl font-black text-neon-orange">+{paintResult.fame}</div>
                </Card>
                <Card className="p-4 bg-neon-lime/10 border-neon-lime">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-neon-lime" />
                    <span className="text-sm text-muted-foreground">Money Earned</span>
                  </div>
                  <div className="text-2xl font-black text-neon-lime">+${paintResult.money}</div>
                </Card>
              </div>

              <Button className="w-full min-h-[48px]" onClick={() => setShowResultDialog(false)}>
                Weiter malen!
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Game;
