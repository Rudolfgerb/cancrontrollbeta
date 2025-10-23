import React, { useState } from 'react';
import { SimpleSpotCapture } from './SimpleSpotCapture';
import { PaintCanvasWithBackground } from './PaintCanvasWithBackground';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Camera, Map, Check, X, MapPin, Star, DollarSign, Shield, AlertTriangle, Paintbrush } from 'lucide-react';
import { toast } from 'sonner';
import { useGame, Spot } from '@/contexts/GameContext';

interface CapturedSpotData {
  name: string;
  description?: string;
  imageData: string;
  location: { lat: number; lng: number };
  riskLevel: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  fameReward: number;
  moneyReward: number;
  hasGuard: boolean;
}

export const SpotCaptureSystem: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { gameState, addFame, addMoney } = useGame();
  const [mode, setMode] = useState<'capture' | 'configure' | 'paint'>('capture');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentSpotData, setCurrentSpotData] = useState<CapturedSpotData | null>(null);

  // Configuration form state
  const [spotName, setSpotName] = useState('');
  const [spotDescription, setSpotDescription] = useState('');
  const [riskLevel, setRiskLevel] = useState(5);

  // Calculate spot properties based on risk level
  const getDifficultyFromRisk = (risk: number): 'easy' | 'medium' | 'hard' | 'extreme' => {
    if (risk <= 3) return 'easy';
    if (risk <= 6) return 'medium';
    if (risk <= 8) return 'hard';
    return 'extreme';
  };

  const calculateRewards = (risk: number) => {
    const baseFame = risk * 10;
    const baseMoney = risk * 5;
    return {
      fameReward: baseFame + Math.floor(Math.random() * 20),
      moneyReward: baseMoney + Math.floor(Math.random() * 10),
      hasGuard: risk >= 5,
    };
  };

  const handleScreenshotCapture = (imageData: string, location: { lat: number; lng: number }) => {
    setCapturedImage(imageData);
    setCapturedLocation(location);
    setMode('configure');

    // Auto-generate name based on location
    setSpotName(`Spot ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);

    toast.success('Screenshot erfasst!', {
      description: 'Jetzt den Spot konfigurieren'
    });
  };

  const handleCreateSpot = () => {
    if (!capturedImage || !capturedLocation) {
      toast.error('Kein Screenshot vorhanden');
      return;
    }

    if (!spotName.trim()) {
      toast.error('Bitte gib dem Spot einen Namen');
      return;
    }

    const difficulty = getDifficultyFromRisk(riskLevel);
    const rewards = calculateRewards(riskLevel);

    // Create random position on map (you can modify this logic)
    const randomX = Math.floor(Math.random() * 80) + 10;
    const randomY = Math.floor(Math.random() * 80) + 10;

    const newSpot: CapturedSpotData = {
      name: spotName.trim(),
      description: spotDescription.trim(),
      imageData: capturedImage,
      location: capturedLocation,
      riskLevel,
      difficulty,
      ...rewards,
    };

    // You would typically save this to your game state or backend here
    console.log('New spot created:', newSpot);
    setCurrentSpotData(newSpot);

    // Add bonus fame/money for capturing a spot
    addFame(50);
    addMoney(25);

    toast.success(`Spot "${spotName}" erfasst!`, {
      description: `+50 Fame, +25$ | Jetzt bemalen!`
    });

    // Go to paint mode
    setMode('paint');
  };

  const handlePaintComplete = (quality: number) => {
    if (!currentSpotData) return;

    const qualityPercent = Math.round(quality * 100);
    const bonusFame = Math.round(currentSpotData.fameReward * quality);
    const bonusMoney = Math.round(currentSpotData.moneyReward * quality);

    addFame(bonusFame);
    addMoney(bonusMoney);

    toast.success('Graffiti fertiggestellt!', {
      description: `Qualität: ${qualityPercent}% | +${bonusFame} Fame, +${bonusMoney}$`
    });

    // Reset and close
    resetForm();
    onClose();
  };

  const handlePaintBusted = () => {
    toast.error('Erwischt!', {
      description: 'Die Polizei hat dich geschnappt!'
    });

    // Reset and close
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setCapturedImage(null);
    setCapturedLocation(null);
    setSpotName('');
    setSpotDescription('');
    setRiskLevel(5);
    setCurrentSpotData(null);
    setMode('capture');
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Header - only show when not in paint mode */}
      {mode !== 'paint' && (
        <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b-2 border-primary/30 p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary to-neon-cyan rounded-lg shadow-neon">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary via-neon-cyan to-neon-lime">
                  Spot Erfassen
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {mode === 'capture'
                    ? 'Navigiere in Street View und erstelle einen Screenshot'
                    : 'Konfiguriere den erfassten Spot'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {mode === 'configure' && (
                <Button
                  onClick={() => setMode('capture')}
                  variant="outline"
                  className="gap-2 border-neon-cyan/50 hover:bg-neon-cyan/10"
                >
                  <Map className="w-4 h-4" />
                  Zurück zur Karte
                </Button>
              )}
              <Button
                onClick={handleCancel}
                variant="outline"
                className="gap-2 border-destructive/50 hover:bg-destructive/10"
              >
                <X className="w-4 h-4" />
                Abbrechen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {mode === 'capture' ? (
          // Street View Capture Mode
          <div className="h-full p-6">
            <Card className="h-full p-4 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-2 border-primary/20 backdrop-blur-xl overflow-auto">
              <SimpleSpotCapture
                onCaptureComplete={handleScreenshotCapture}
              />
            </Card>
          </div>
        ) : mode === 'configure' ? (
          // Configuration Mode
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Screenshot Preview */}
              <Card className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-2 border-neon-cyan/30 backdrop-blur-xl">
                <h3 className="text-xl font-black uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-lime">
                  📸 Screenshot Preview
                </h3>
                {capturedImage && (
                  <img
                    src={capturedImage}
                    alt="Captured spot"
                    className="w-full rounded-lg border-2 border-neon-cyan/50 shadow-2xl"
                  />
                )}
                {capturedLocation && (
                  <div className="mt-4 text-sm text-muted-foreground font-mono flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neon-cyan" />
                    Location: {capturedLocation.lat.toFixed(6)}, {capturedLocation.lng.toFixed(6)}
                  </div>
                )}
              </Card>

              {/* Spot Configuration */}
              <Card className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-2 border-primary/30 backdrop-blur-xl">
                <h3 className="text-xl font-black uppercase mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary to-neon-cyan">
                  ⚙️ Spot Konfiguration
                </h3>

                <div className="space-y-6">
                  {/* Spot Name */}
                  <div className="space-y-2">
                    <Label htmlFor="spotName" className="text-sm font-bold uppercase text-neon-cyan">
                      Spot Name *
                    </Label>
                    <Input
                      id="spotName"
                      value={spotName}
                      onChange={(e) => setSpotName(e.target.value)}
                      placeholder="z.B. East Side Gallery, Hauptbahnhof, Kreuzberg Wall..."
                      className="font-mono border-neon-cyan/30 focus:border-neon-cyan bg-gray-950/50"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="spotDescription" className="text-sm font-bold uppercase text-neon-lime">
                      Beschreibung (Optional)
                    </Label>
                    <Textarea
                      id="spotDescription"
                      value={spotDescription}
                      onChange={(e) => setSpotDescription(e.target.value)}
                      placeholder="Besonderheiten, Tipps zur Zugänglichkeit, beste Zeit zum Malen..."
                      rows={4}
                      className="font-mono border-neon-lime/30 focus:border-neon-lime bg-gray-950/50"
                    />
                  </div>

                  {/* Risk Level */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-bold uppercase text-neon-orange">
                        Risiko Level
                      </Label>
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          riskLevel <= 3 ? 'text-neon-lime' :
                          riskLevel <= 6 ? 'text-neon-cyan' :
                          riskLevel <= 8 ? 'text-neon-orange' :
                          'text-destructive'
                        }`} />
                        <div className="text-3xl font-black">
                          <span className={
                            riskLevel <= 3 ? 'text-neon-lime' :
                            riskLevel <= 6 ? 'text-neon-cyan' :
                            riskLevel <= 8 ? 'text-neon-orange' :
                            'text-destructive'
                          }>
                            {riskLevel}
                          </span>
                          <span className="text-muted-foreground text-xl">/10</span>
                        </div>
                      </div>
                    </div>

                    <Slider
                      value={[riskLevel]}
                      onValueChange={([value]) => setRiskLevel(value)}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />

                    <div className="grid grid-cols-4 gap-2 text-xs font-bold uppercase">
                      <div className="text-center">
                        <div className="w-full h-2 bg-neon-lime rounded mb-1" />
                        <span className="text-neon-lime">1-3 Easy</span>
                      </div>
                      <div className="text-center">
                        <div className="w-full h-2 bg-neon-cyan rounded mb-1" />
                        <span className="text-neon-cyan">4-6 Medium</span>
                      </div>
                      <div className="text-center">
                        <div className="w-full h-2 bg-neon-orange rounded mb-1" />
                        <span className="text-neon-orange">7-8 Hard</span>
                      </div>
                      <div className="text-center">
                        <div className="w-full h-2 bg-destructive rounded mb-1" />
                        <span className="text-destructive">9-10 Extreme</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Spot Preview */}
              <Card className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-2 border-neon-lime/30 backdrop-blur-xl">
                <h3 className="text-xl font-black uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-r from-neon-lime to-primary">
                  📊 Spot Eigenschaften
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Difficulty */}
                  <div className="text-center p-4 bg-gray-950/50 rounded-lg border-2 border-primary/20">
                    <div className="text-sm uppercase text-muted-foreground mb-2">Schwierigkeit</div>
                    <div className={`text-2xl font-black uppercase ${
                      getDifficultyFromRisk(riskLevel) === 'easy' ? 'text-neon-lime' :
                      getDifficultyFromRisk(riskLevel) === 'medium' ? 'text-neon-cyan' :
                      getDifficultyFromRisk(riskLevel) === 'hard' ? 'text-neon-orange' :
                      'text-destructive'
                    }`}>
                      {getDifficultyFromRisk(riskLevel)}
                    </div>
                  </div>

                  {/* Fame Reward */}
                  <div className="text-center p-4 bg-gray-950/50 rounded-lg border-2 border-neon-orange/20">
                    <div className="text-sm uppercase text-muted-foreground mb-2">Fame</div>
                    <div className="flex items-center justify-center gap-2">
                      <Star className="w-5 h-5 text-neon-orange" />
                      <div className="text-2xl font-black text-neon-orange">
                        {calculateRewards(riskLevel).fameReward}
                      </div>
                    </div>
                  </div>

                  {/* Money Reward */}
                  <div className="text-center p-4 bg-gray-950/50 rounded-lg border-2 border-neon-lime/20">
                    <div className="text-sm uppercase text-muted-foreground mb-2">Geld</div>
                    <div className="flex items-center justify-center gap-2">
                      <DollarSign className="w-5 h-5 text-neon-lime" />
                      <div className="text-2xl font-black text-neon-lime">
                        {calculateRewards(riskLevel).moneyReward}
                      </div>
                    </div>
                  </div>

                  {/* Guard */}
                  <div className="text-center p-4 bg-gray-950/50 rounded-lg border-2 border-destructive/20">
                    <div className="text-sm uppercase text-muted-foreground mb-2">Wache</div>
                    <div className="flex items-center justify-center gap-2">
                      {calculateRewards(riskLevel).hasGuard ? (
                        <>
                          <Shield className="w-5 h-5 text-destructive" />
                          <div className="text-xl font-black text-destructive">JA</div>
                        </>
                      ) : (
                        <div className="text-xl font-black text-neon-lime">NEIN</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bonus Info */}
                <div className="mt-4 p-4 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg">
                  <div className="text-sm font-bold text-neon-cyan flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Bonus für Spot-Erfassung: +50 Fame, +25$
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handleCreateSpot}
                  disabled={!spotName.trim()}
                  className="flex-1 gap-3 bg-gradient-to-r from-neon-lime via-neon-cyan to-primary text-black hover:shadow-neon transition-all font-black text-lg py-6"
                >
                  <Paintbrush className="w-6 h-6" />
                  Jetzt Bemalen!
                </Button>
                <Button
                  onClick={() => setMode('capture')}
                  variant="outline"
                  className="gap-2 border-primary/50 hover:bg-primary/10 font-bold py-6"
                >
                  <Map className="w-5 h-5" />
                  Neuer Screenshot
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Paint Mode
          <div className="h-full">
            {currentSpotData && (
              <PaintCanvasWithBackground
                onComplete={handlePaintComplete}
                onBusted={handlePaintBusted}
                difficulty={currentSpotData.difficulty}
                backgroundImage={currentSpotData.imageData}
                spotName={currentSpotData.name}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
