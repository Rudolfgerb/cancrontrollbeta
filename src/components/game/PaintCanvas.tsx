import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useGame } from '@/contexts/GameContext';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface PaintCanvasProps {
  onComplete: (quality: number) => void;
  onBusted: () => void;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
}

export const PaintCanvas: React.FC<PaintCanvasProps> = ({ onComplete, onBusted, difficulty }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [guardDistance, setGuardDistance] = useState(100);
  const [strokeCount, setStrokeCount] = useState(0);
  const [coverage, setCoverage] = useState(0);
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
      ctx.moveTo(x, y);
    }
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.strokeStyle = gameState.inventory.selectedColor;
      ctx.lineWidth = 15;
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
    <div className="flex flex-col h-full bg-urban-dark">
      {/* Header Stats */}
      <div className="bg-urban-surface border-b-2 border-urban-border p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground uppercase">Zeit</div>
            <div className={`text-2xl font-black ${timeLeft < 10 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
              {timeLeft}s
            </div>
          </div>
          <div className="space-y-1 text-right">
            <div className="text-sm text-muted-foreground uppercase">Coverage</div>
            <div className="text-2xl font-black text-neon-cyan">{coverage.toFixed(0)}%</div>
          </div>
        </div>
        
        {/* Guard Warning */}
        <div className={`flex items-center gap-2 p-2 rounded-lg bg-background/50 ${warning.color}`}>
          <WarningIcon className="w-5 h-5" />
          <span className="font-bold uppercase text-sm">{warning.text}</span>
          <div className="ml-auto text-xs">~{guardDistance.toFixed(0)}m</div>
        </div>

        {/* Guard Distance Bar */}
        <div className="w-full h-2 bg-background rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              guardDistance < 30 ? 'bg-destructive' : guardDistance < 50 ? 'bg-neon-orange' : 'bg-neon-lime'
            }`}
            style={{ width: `${guardDistance}%` }}
          />
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-4 flex items-center justify-center bg-gradient-to-b from-urban-surface to-urban-dark">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={500}
            className="border-4 border-urban-border rounded-lg cursor-crosshair touch-none bg-muted/20 shadow-strong"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-neon">
            {gameState.inventory.selectedColor}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-urban-surface border-t-2 border-urban-border p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Male mit Finger/Maus • Deckung: mind. 30% • Wache: Abstand halten!
        </p>
      </div>
    </div>
  );
};
