import React, { useState } from 'react';
import { SpotCaptureSystem } from '@/components/game/SpotCaptureSystem';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, ArrowLeft, MapPin, Star, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SpotCapture() {
  const navigate = useNavigate();
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedSpots, setCapturedSpots] = useState<any[]>([]);

  const handleStartCapture = () => {
    setIsCapturing(true);
  };

  const handleCloseCapture = () => {
    setIsCapturing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {!isCapturing ? (
        // Welcome Screen
        <>
          <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b-2 border-primary/30 p-6 shadow-2xl">
            <div className="container mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-primary via-neon-cyan to-neon-lime rounded-lg shadow-neon animate-pulse">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary via-neon-cyan to-neon-lime mb-2">
                      Spot Erfassung
                    </h1>
                    <p className="text-muted-foreground">
                      Finde und erfasse neue Graffiti-Spots in deiner Stadt
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/test')}
                  variant="outline"
                  className="gap-2 border-primary/50 hover:bg-primary/10"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Zurück
                </Button>
              </div>
            </div>
          </div>

          <div className="container mx-auto p-6 space-y-6">
            {/* Instructions */}
            <Card className="p-8 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-2 border-primary/30 backdrop-blur-xl">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-primary/20 rounded-lg">
                  <Camera className="w-12 h-12 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-black uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-neon-cyan">
                    So funktioniert's
                  </h2>
                  <div className="space-y-4 text-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-neon-cyan rounded-full flex items-center justify-center font-black text-black">
                        1
                      </div>
                      <div>
                        <div className="font-bold text-neon-cyan mb-1">Street View öffnen</div>
                        <div className="text-sm text-muted-foreground">
                          Navigiere in Google Street View zu einem interessanten Ort
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-neon-lime rounded-full flex items-center justify-center font-black text-black">
                        2
                      </div>
                      <div>
                        <div className="font-bold text-neon-lime mb-1">Screenshot erstellen</div>
                        <div className="text-sm text-muted-foreground">
                          Wähle zwischen Vollbild-Screenshot oder Crop-Modus (Bereich auswählen)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-neon-orange rounded-full flex items-center justify-center font-black text-black">
                        3
                      </div>
                      <div>
                        <div className="font-bold text-neon-orange mb-1">Spot konfigurieren</div>
                        <div className="text-sm text-muted-foreground">
                          Gib dem Spot einen Namen, Beschreibung und wähle das Risiko-Level
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center font-black text-white">
                        4
                      </div>
                      <div>
                        <div className="font-bold text-primary mb-1">Spot speichern</div>
                        <div className="text-sm text-muted-foreground">
                          Erhalte +50 Fame & +25$ Bonus für jeden erfassten Spot
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-2 border-neon-cyan/30 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-neon-cyan/20 rounded-lg">
                    <Camera className="w-6 h-6 text-neon-cyan" />
                  </div>
                  <h3 className="text-xl font-black uppercase text-neon-cyan">
                    Echtesshots
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Verwende echte Street View Bilder als Hintergrund für deine Graffitis
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-2 border-neon-lime/30 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-neon-lime/20 rounded-lg">
                    <MapPin className="w-6 h-6 text-neon-lime" />
                  </div>
                  <h3 className="text-xl font-black uppercase text-neon-lime">
                    GPS Location
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Jeder Spot wird mit GPS-Koordinaten gespeichert
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-2 border-neon-orange/30 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-neon-orange/20 rounded-lg">
                    <Star className="w-6 h-6 text-neon-orange" />
                  </div>
                  <h3 className="text-xl font-black uppercase text-neon-orange">
                    Belohnungen
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Verdiene Fame und Geld für jeden erfassten und bemalten Spot
                </p>
              </Card>
            </div>

            {/* CTA Button */}
            <div className="text-center py-8">
              <Button
                onClick={handleStartCapture}
                size="lg"
                className="gap-3 bg-gradient-to-r from-primary via-neon-cyan to-neon-lime text-black hover:shadow-neon transition-all font-black text-2xl px-12 py-8"
              >
                <Camera className="w-8 h-8" />
                Spot Erfassung starten
              </Button>
            </div>

            {/* Stats */}
            {capturedSpots.length > 0 && (
              <Card className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-2 border-primary/30 backdrop-blur-xl">
                <h3 className="text-2xl font-black uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-neon-cyan">
                  Erfasste Spots ({capturedSpots.length})
                </h3>
                <div className="grid gap-4">
                  {capturedSpots.map((spot, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gray-950/50 rounded-lg border border-primary/20"
                    >
                      <CheckCircle2 className="w-6 h-6 text-neon-lime" />
                      <div className="flex-1">
                        <div className="font-bold">{spot.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {spot.location?.lat.toFixed(4)}, {spot.location?.lng.toFixed(4)}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded font-bold text-xs ${
                        spot.difficulty === 'easy' ? 'bg-neon-lime/20 text-neon-lime' :
                        spot.difficulty === 'medium' ? 'bg-neon-cyan/20 text-neon-cyan' :
                        spot.difficulty === 'hard' ? 'bg-neon-orange/20 text-neon-orange' :
                        'bg-destructive/20 text-destructive'
                      }`}>
                        {spot.difficulty.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </>
      ) : (
        // Capture Mode
        <SpotCaptureSystem
          onClose={handleCloseCapture}
        />
      )}
    </div>
  );
}
