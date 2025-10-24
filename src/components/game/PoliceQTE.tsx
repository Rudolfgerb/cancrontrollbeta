import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Zap, Trophy, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PoliceQTEProps {
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  onSuccess: () => void;
  onFailure: () => void;
}

const QTE_SETTINGS = {
  easy: { requiredTaps: 6, timeLimit: 12, targetSize: 100 },
  medium: { requiredTaps: 8, timeLimit: 10, targetSize: 80 },
  hard: { requiredTaps: 10, timeLimit: 8, targetSize: 60 },
  extreme: { requiredTaps: 12, timeLimit: 6, targetSize: 50 },
};

interface TapTarget {
  id: string;
  x: number;
  y: number;
  tapped: boolean;
}

export const PoliceQTE: React.FC<PoliceQTEProps> = ({
  difficulty,
  onSuccess,
  onFailure,
}) => {
  const settings = QTE_SETTINGS[difficulty];
  const [timeLeft, setTimeLeft] = useState(settings.timeLimit);
  const [targets, setTargets] = useState<TapTarget[]>([]);
  const [tappedCount, setTappedCount] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Initialize targets
  useEffect(() => {
    const newTargets: TapTarget[] = [];
    for (let i = 0; i < settings.requiredTaps; i++) {
      newTargets.push({
        id: `target-${i}`,
        x: Math.random() * 80 + 10, // 10-90% to keep within bounds
        y: Math.random() * 80 + 10,
        tapped: false,
      });
    }
    setTargets(newTargets);
  }, [settings.requiredTaps]);

  // Timer countdown
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 0.1;
        if (newTime <= 0) {
          setIsActive(false);
          onFailure();
          toast.error('Zeit abgelaufen! Du wurdest erwischt!');
          return 0;
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onFailure]);

  // Check for success
  useEffect(() => {
    if (tappedCount >= settings.requiredTaps && isActive) {
      setIsActive(false);
      onSuccess();
      toast.success('Erfolgreich geflohen!');
    }
  }, [tappedCount, settings.requiredTaps, isActive, onSuccess]);

  const handleTargetTap = useCallback((targetId: string) => {
    if (!isActive) return;

    setTargets((prev) =>
      prev.map((target) =>
        target.id === targetId && !target.tapped
          ? { ...target, tapped: true }
          : target
      )
    );

    setTappedCount((prev) => prev + 1);
  }, [isActive]);

  const getTimeColor = (): string => {
    if (timeLeft > settings.timeLimit * 0.5) return 'text-neon-lime';
    if (timeLeft > settings.timeLimit * 0.25) return 'text-neon-orange';
    return 'text-destructive';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl p-6 bg-urban-dark border-destructive border-2">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="w-8 h-8 text-destructive animate-pulse" />
            <h2 className="text-3xl font-black uppercase text-destructive">POLIZEI ALARM!</h2>
            <AlertTriangle className="w-8 h-8 text-destructive animate-pulse" />
          </div>
          <p className="text-lg text-muted-foreground">Tippe auf alle Ziele, um zu fliehen!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 bg-urban-surface">
            <div className="text-sm text-muted-foreground mb-1">Zeit übrig</div>
            <div className={`text-3xl font-black ${getTimeColor()}`}>
              {timeLeft.toFixed(1)}s
            </div>
            <Progress
              value={(timeLeft / settings.timeLimit) * 100}
              className="mt-2"
            />
          </Card>

          <Card className="p-4 bg-urban-surface">
            <div className="text-sm text-muted-foreground mb-1">Fortschritt</div>
            <div className="text-3xl font-black text-neon-cyan">
              {tappedCount}/{settings.requiredTaps}
            </div>
            <Progress
              value={(tappedCount / settings.requiredTaps) * 100}
              className="mt-2"
            />
          </Card>
        </div>

        {/* QTE Area */}
        <div className="relative w-full h-96 bg-gradient-to-br from-urban-surface to-background rounded-lg border-2 border-border overflow-hidden">
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                               linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}
          />

          {/* Tap Targets */}
          {targets.map((target) => (
            <button
              key={target.id}
              onClick={() => handleTargetTap(target.id)}
              disabled={target.tapped || !isActive}
              className={`
                absolute rounded-full border-4 flex items-center justify-center
                transition-all duration-200 cursor-pointer
                ${target.tapped
                  ? 'bg-neon-lime/30 border-neon-lime scale-0'
                  : 'bg-primary/30 border-primary hover:scale-110 animate-pulse'
                }
                ${!isActive && 'opacity-50 cursor-not-allowed'}
              `}
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                width: `${settings.targetSize}px`,
                height: `${settings.targetSize}px`,
                transform: `translate(-50%, -50%) ${target.tapped ? 'scale(0)' : 'scale(1)'}`,
              }}
            >
              {!target.tapped && (
                <Zap className="w-8 h-8 text-primary" />
              )}
            </button>
          ))}

          {/* Center instruction */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center bg-black/60 p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Tippe schnell auf alle leuchtenden Ziele!</p>
            </div>
          </div>
        </div>

        {/* Warning Message */}
        <div className="mt-4 p-3 bg-destructive/20 border border-destructive rounded-lg">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <XCircle className="w-4 h-4" />
            <span className="font-bold">Wenn die Zeit abläuft, wirst du verhaftet!</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
