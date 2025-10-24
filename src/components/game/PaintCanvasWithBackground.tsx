import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useGame } from '@/contexts/GameContext';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface PaintCanvasWithBackgroundProps {
  onComplete: (quality: number) => void;
  onBusted: () => void;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  backgroundImage?: string; // Screenshot URL from Spot Capture
  spotName?: string;
}

export const PaintCanvasWithBackground: React.FC<PaintCanvasWithBackgroundProps> = ({
  onComplete,
  onBusted,
  difficulty,
  backgroundImage,
  spotName
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  const { playSpray, playSiren, playSuccess, playBusted } = useSoundEffects();
  const { gameState, increaseWanted } = useGame();
  const guardIntervalRef = useRef<NodeJS.Timeout>();
  const timerRef = useRef<NodeJS.Timeout>();

  const difficultySettings = {
    easy: { time: 45, guardSpeed: 2, detectionRange: 30 },
    medium: { time: 30, guardSpeed: 3, detectionRange: 40 },
    hard: { time: 20, guardSpeed: 4, detectionRange: 50 },
    extreme: { time: 15, guardSpeed: 5, detectionRange: 60 },
  };

  const settings = difficultySettings[difficulty];

  // Step 1: Load the image from the prop into an Image object
  useEffect(() => {
    if (!backgroundImage) {
      setBgImage(null);
      setBackgroundLoaded(false);
      return;
    }
    console.log('🎨 Loading background image...');
    const img = new Image();
    img.onload = () => {
      console.log('✅ Background image data loaded into object');
      setBgImage(img);
    };
    img.onerror = (err) => {
      console.error('❌ Failed to load background image:', err);
      setBgImage(null);
      setBackgroundLoaded(false);
    };
    img.crossOrigin = 'anonymous';
    img.src = backgroundImage;
  }, [backgroundImage]);

  // Step 2: When the image object is ready, update canvases
  useEffect(() => {
    const newWidth = bgImage?.width ?? 800;
    const newHeight = bgImage?.height ?? 600;
    setDimensions({ width: newWidth, height: newHeight });

    // Set drawing canvas resolution
    if (canvasRef.current) {
      canvasRef.current.width = newWidth;
      canvasRef.current.height = newHeight;
    }

    // Set background canvas resolution and draw the image
    const bgCanvas = backgroundCanvasRef.current;
    if (bgCanvas) {
      bgCanvas.width = newWidth;
      bgCanvas.height = newHeight;
      const ctx = bgCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, newWidth, newHeight);
        if (bgImage) {
          console.log('✍️ Drawing background image to canvas');
          ctx.drawImage(bgImage, 0, 0);
          setBackgroundLoaded(true);
        }
      }
    }
  }, [bgImage]);

  useEffect(() => {
    setTimeLeft(settings.time);

    // Guard patrol logic
    guardIntervalRef.current = setInterval(() => {
      setGuardDistance(prev => {
        const change = (Math.random() - 0.5) * settings.guardSpeed * 2;
        let newDistance = prev + change;

        if (newDistance < 0) newDistance = 0;
        if (newDistance > 100) newDistance = 100;

        if (newDistance < settings.detectionRange && Math.random() > 0.5) {
          clearInterval(guardIntervalRef.current);
          clearInterval(timerRef.current);
          increaseWanted();
          playSiren();
          playBusted();
          setTimeout(() => onBusted(), 500);
        }

        return newDistance;
      });
    }, 500);

    // Timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(guardIntervalRef.current);
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(guardIntervalRef.current);
      clearInterval(timerRef.current);
    };
  }, [difficulty, settings, increaseWanted, onBusted, playBusted, playSiren]);

  useEffect(() => {
    if (timeLeft === 0) {
      const quality = Math.min(coverage / 30, 1); // 30% coverage = 100% quality
      if (quality > 0.3) {
        playSuccess();
      }
      setTimeout(() => onComplete(quality), 500);
    }
  }, [timeLeft, coverage, onComplete, playSuccess]);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x * (canvas.width / rect.width), y * (canvas.height / rect.height));
    }
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    // Scale coordinates to canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x * scaleX, y * scaleY);
      ctx.strokeStyle = gameState.inventory.selectedColor;
      ctx.lineWidth = 25;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      setStrokeCount(prev => prev + 1);
      if (strokeCount % 3 === 0) {
        playSpray();
        setCoverage(prev => Math.min(prev + 0.5, 100));
      }
    }
  }, [isDrawing, gameState.inventory.selectedColor, strokeCount, playSpray]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const getGuardWarning = () => {
    if (guardDistance < 30) return { text: 'ACHTUNG! Zu nah!', color: 'text-destructive', icon: XCircle };
    if (guardDistance < 50) return { text: 'Vorsichtig!', color: 'text-neon-orange', icon: AlertCircle };
    return { text: 'Alles klar', color: 'text-neon-lime', icon: CheckCircle2 };
  };

  const warning = getGuardWarning();
  const WarningIcon = warning.icon;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b-2 border-primary/30 p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Zeit verbleibend</div>
            <div className={`text-4xl font-black ${timeLeft < 10 ? 'text-destructive animate-pulse' : 'text-transparent bg-clip-text bg-gradient-to-r from-primary to-neon-cyan'}`}>
              {timeLeft}s
            </div>
          </div>
          <div className="space-y-1 text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Fortschritt</div>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-lime to-neon-cyan">
              {coverage.toFixed(0)}%
            </div>
          </div>
        </div>

        {spotName && (
          <div className="text-center mb-4">
            <div className="text-sm text-muted-foreground uppercase">Spot</div>
            <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-orange to-primary">
              {spotName}
            </div>
          </div>
        )}

        {/* Guard Warning */}
        <div className={`flex items-center gap-3 p-3 rounded-lg bg-background/50 border-2 ${
          guardDistance < 30 ? 'border-destructive/50' : guardDistance < 50 ? 'border-neon-orange/50' : 'border-neon-lime/50'
        } ${warning.color}`}>
          <WarningIcon className="w-6 h-6" />
          <span className="font-black uppercase text-sm flex-1">{warning.text}</span>
          <div className="text-sm font-mono bg-background/50 px-3 py-1 rounded">~{guardDistance.toFixed(0)}m</div>
        </div>

        {/* Guard Distance Bar */}
        <div className="mt-3 w-full h-3 bg-background rounded-full overflow-hidden border-2 border-primary/20">
          <div
            className={`h-full transition-all duration-300 ${
              guardDistance < 30 ? 'bg-gradient-to-r from-destructive to-red-700' :
              guardDistance < 50 ? 'bg-gradient-to-r from-neon-orange to-yellow-500' :
              'bg-gradient-to-r from-neon-lime to-green-400'
            }`}
            style={{ width: `${guardDistance}%` }}
          />
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 p-6 flex items-center justify-center overflow-auto">
        <div
          className="relative"
          style={{
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 300px)',
          }}
        >
          {/* Background canvas (screenshot) */}
          <canvas
            ref={backgroundCanvasRef}
            className="absolute top-0 left-0 border-4 border-primary/30 rounded-lg shadow-2xl"
            style={{
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />

          {/* Drawing canvas (transparent overlay) */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 border-4 border-neon-cyan/50 rounded-lg cursor-crosshair touch-none shadow-neon"
            style={{
              width: '100%',
              height: '100%',
              zIndex: 2,
              backgroundColor: 'transparent'
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {/* Color indicator */}
          <div className="absolute -top-3 -right-3 bg-gradient-to-r from-primary to-neon-cyan text-black px-4 py-2 rounded-full text-sm font-black shadow-neon uppercase">
            {gameState.inventory.selectedColor}
          </div>

          {/* Background loading indicator */}
          {backgroundImage && !backgroundLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-white font-bold animate-pulse">Lade Hintergrund...</div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t-2 border-primary/30 p-4">
        <div className="text-center space-y-2">
          <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-lime">
            🎨 Male mit Finger/Maus • ✅ Deckung: mind. 30% • 👮 Wache: Abstand halten!
          </p>
          {backgroundImage && (
            <p className="text-xs text-muted-foreground">
              📸 Dein Graffiti wird auf dem Street View Screenshot gemalt
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
