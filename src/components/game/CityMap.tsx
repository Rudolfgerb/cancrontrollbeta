import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame, Spot } from '@/contexts/GameContext';
import { MapPin, Star, DollarSign, Shield, CheckCircle2, Map as MapIcon, Camera } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { StreetViewMap } from './StreetViewMap';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CityMapProps {
  onSelectSpot: (spot: Spot) => void;
}

export const CityMap: React.FC<CityMapProps> = ({ onSelectSpot }) => {
  const { gameState } = useGame();
  const { playClick } = useSoundEffects();
  const [viewMode, setViewMode] = useState<'classic' | 'streetview'>('classic');
  const [showStreetView, setShowStreetView] = useState(false);
  const [selectedSpotForStreetView, setSelectedSpotForStreetView] = useState<Spot | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-neon-lime/20 border-neon-lime text-neon-lime';
      case 'medium': return 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan';
      case 'hard': return 'bg-neon-orange/20 border-neon-orange text-neon-orange';
      case 'extreme': return 'bg-primary/20 border-primary text-primary';
      default: return 'bg-muted';
    }
  };

  const handleSpotClick = (spot: Spot) => {
    playClick();
    onSelectSpot(spot);
  };

  const handleStreetViewCapture = (imageData: string, location: { lat: number; lng: number }) => {
    console.log('Captured street view:', { imageData, location });
    // Here you could save the captured image to the spot or use it for painting
    setShowStreetView(false);
  };

  const openStreetViewForSpot = (spot: Spot) => {
    playClick();
    setSelectedSpotForStreetView(spot);
    setShowStreetView(true);
  };

  return (
    <div className="h-full flex flex-col bg-urban-dark">
      {/* Map Header */}
      <div className="bg-urban-surface border-b-2 border-urban-border p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-1">Stadt-Map</h2>
            <p className="text-sm text-muted-foreground">Wähle einen Spot zum Malen</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'classic' ? 'default' : 'outline'}
              onClick={() => {
                playClick();
                setViewMode('classic');
              }}
              className="gap-2"
            >
              <MapIcon className="w-4 h-4" />
              Klassisch
            </Button>
            <Button
              variant={viewMode === 'streetview' ? 'default' : 'outline'}
              onClick={() => {
                playClick();
                setViewMode('streetview');
              }}
              className="gap-2"
            >
              <Camera className="w-4 h-4" />
              Street View
            </Button>
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 p-4 overflow-y-auto">
        {viewMode === 'streetview' ? (
          <StreetViewMap
            onCaptureComplete={handleStreetViewCapture}
            defaultPosition={{ lat: 52.520008, lng: 13.404954 }}
          />
        ) : (
          <>
            <div className="relative w-full h-[500px] bg-gradient-to-br from-urban-surface to-background rounded-lg border-2 border-urban-border p-4">
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                                 linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }} />

              {/* Spots */}
              {gameState.spots.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => handleSpotClick(spot)}
                  className="absolute group cursor-pointer"
                  style={{
                    left: `${spot.x}%`,
                    top: `${spot.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="relative">
                    {/* Spot Marker */}
                    <div className={`
                      w-12 h-12 rounded-full border-2 flex items-center justify-center
                      transition-all duration-300 group-hover:scale-125
                      ${spot.painted ? 'bg-neon-lime/30 border-neon-lime' : getDifficultyColor(spot.difficulty)}
                      ${!spot.painted && 'animate-pulse-slow'}
                    `}>
                      {spot.painted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <MapPin className="w-6 h-6" />
                      )}
                    </div>

                    {/* Guard Indicator */}
                    {spot.hasGuard && !spot.painted && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center border-2 border-background">
                        <Shield className="w-3 h-3 text-destructive-foreground" />
                      </div>
                    )}

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      <div className="bg-card border-2 border-border rounded-lg p-3 shadow-strong">
                        <div className="font-bold text-sm mb-2">{spot.name}</div>
                        <div className="flex gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-neon-orange" />
                            <span>{spot.fameReward}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-neon-lime" />
                            <span>{spot.moneyReward}</span>
                          </div>
                        </div>
                        {spot.painted && (
                          <div className="text-xs text-neon-lime mt-1">✓ Painted</div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-neon-lime border border-neon-lime" />
                <span className="text-muted-foreground">Easy</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-neon-cyan border border-neon-cyan" />
                <span className="text-muted-foreground">Medium</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-neon-orange border border-neon-orange" />
                <span className="text-muted-foreground">Hard</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-primary border border-primary" />
                <span className="text-muted-foreground">Extreme</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Spots List */}
      <div className="bg-urban-surface border-t-2 border-urban-border p-4">
        <h3 className="text-sm font-bold uppercase mb-3 text-muted-foreground">Alle Spots</h3>
        <div className="grid gap-2 max-h-48 overflow-y-auto">
          {gameState.spots.map((spot) => (
            <Card
              key={spot.id}
              className={`p-3 cursor-pointer hover:border-primary/50 transition-all ${
                spot.painted ? 'opacity-60' : ''
              }`}
              onClick={() => handleSpotClick(spot)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${getDifficultyColor(spot.difficulty).split(' ')[0]}`} />
                  <div>
                    <div className="font-bold text-sm">{spot.name}</div>
                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" /> {spot.fameReward}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> {spot.moneyReward}
                      </span>
                    </div>
                  </div>
                </div>
                {spot.painted && <CheckCircle2 className="w-5 h-5 text-neon-lime" />}
                {spot.hasGuard && !spot.painted && <Shield className="w-5 h-5 text-destructive" />}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Street View Dialog */}
      <Dialog open={showStreetView} onOpenChange={setShowStreetView}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase">
              {selectedSpotForStreetView?.name || 'Street View'}
            </DialogTitle>
          </DialogHeader>
          <StreetViewMap
            onCaptureComplete={handleStreetViewCapture}
            defaultPosition={{ lat: 52.520008, lng: 13.404954 }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
