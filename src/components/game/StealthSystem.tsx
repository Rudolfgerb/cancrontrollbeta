import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/react-progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye, EyeOff, AlertTriangle, Shield, Clock,
  Car, Users, Moon, Sun, Siren, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export interface RiskEvent {
  id: string;
  type: 'pedestrian' | 'car' | 'police' | 'goodcover' | 'nightfall';
  message: string;
  riskMultiplier: number;
  duration: number; // seconds
  timestamp: number;
}

interface StealthSystemProps {
  spotRiskFactor: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  isPainting: boolean;
  onStealthDepleted: () => void;
  onLookAround: () => void;
}

const DIFFICULTY_SETTINGS = {
  easy: { baseDrainRate: 3, maxLookArounds: 5, eventFrequency: 45 },
  medium: { baseDrainRate: 5, maxLookArounds: 4, eventFrequency: 35 },
  hard: { baseDrainRate: 7, maxLookArounds: 3, eventFrequency: 25 },
  extreme: { baseDrainRate: 10, maxLookArounds: 2, eventFrequency: 20 },
};

const RISK_EVENTS_POOL: Omit<RiskEvent, 'id' | 'timestamp'>[] = [
  {
    type: 'pedestrian',
    message: '🚶 Passant hat dich entdeckt!',
    riskMultiplier: 1.5,
    duration: 15,
  },
  {
    type: 'car',
    message: '🚗 Auto fährt vorbei',
    riskMultiplier: 1.2,
    duration: 10,
  },
  {
    type: 'police',
    message: '🚨 Polizeistreife in der Nähe!',
    riskMultiplier: 2.0,
    duration: 20,
  },
  {
    type: 'goodcover',
    message: '✅ Gute Deckung gefunden',
    riskMultiplier: 0.7,
    duration: 25,
  },
  {
    type: 'nightfall',
    message: '🌙 Dunkelheit schützt dich',
    riskMultiplier: 0.5,
    duration: 30,
  },
];

export const StealthSystem: React.FC<StealthSystemProps> = ({
  spotRiskFactor,
  difficulty,
  isPainting,
  onStealthDepleted,
  onLookAround,
}) => {
  const [stealth, setStealth] = useState(100);
  const [lookAroundsLeft, setLookAroundsLeft] = useState(
    DIFFICULTY_SETTINGS[difficulty].maxLookArounds
  );
  const [lookAroundCooldown, setLookAroundCooldown] = useState(0);
  const [activeEvents, setActiveEvents] = useState<RiskEvent[]>([]);
  const [totalRiskMultiplier, setTotalRiskMultiplier] = useState(1.0);

  const settings = DIFFICULTY_SETTINGS[difficulty];

  // Calculate total risk from active events
  useEffect(() => {
    const multiplier = activeEvents.reduce((acc, event) => acc * event.riskMultiplier, 1.0);
    setTotalRiskMultiplier(multiplier);
  }, [activeEvents]);

  // Stealth drain effect
  useEffect(() => {
    if (!isPainting || stealth <= 0) return;

    const interval = setInterval(() => {
      setStealth((prev) => {
        const hourFactor = getTimeFactor();
        const drainRate = settings.baseDrainRate * totalRiskMultiplier * hourFactor * spotRiskFactor;
        const newStealth = Math.max(0, prev - (drainRate / 10)); // Divide by 10 for smooth 100ms updates

        if (newStealth === 0) {
          onStealthDepleted();
        }

        return newStealth;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPainting, settings.baseDrainRate, totalRiskMultiplier, spotRiskFactor, stealth]);

  // Random event spawner
  useEffect(() => {
    if (!isPainting) return;

    const spawnEvent = () => {
      if (Math.random() > 0.6) { // 40% chance to spawn event
        const eventTemplate = RISK_EVENTS_POOL[Math.floor(Math.random() * RISK_EVENTS_POOL.length)];
        const newEvent: RiskEvent = {
          ...eventTemplate,
          id: `event-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
        };

        setActiveEvents((prev) => [...prev, newEvent]);
        toast(newEvent.message, {
          icon: newEvent.riskMultiplier > 1 ? '⚠️' : '✅',
          duration: newEvent.duration * 1000,
        });

        // Auto-remove event after duration
        setTimeout(() => {
          setActiveEvents((prev) => prev.filter((e) => e.id !== newEvent.id));
        }, newEvent.duration * 1000);
      }
    };

    const interval = setInterval(spawnEvent, settings.eventFrequency * 1000);
    return () => clearInterval(interval);
  }, [isPainting, settings.eventFrequency]);

  // Look around cooldown timer
  useEffect(() => {
    if (lookAroundCooldown <= 0) return;

    const interval = setInterval(() => {
      setLookAroundCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [lookAroundCooldown]);

  const handleLookAround = () => {
    if (lookAroundsLeft <= 0 || lookAroundCooldown > 0) return;

    // Restore stealth
    setStealth((prev) => Math.min(100, prev + 50));
    setLookAroundsLeft((prev) => prev - 1);
    setLookAroundCooldown(10); // 10 second cooldown

    // 30% chance to remove negative events
    if (Math.random() < 0.3) {
      const negativeEvents = activeEvents.filter((e) => e.riskMultiplier > 1);
      if (negativeEvents.length > 0) {
        const removedEvent = negativeEvents[Math.floor(Math.random() * negativeEvents.length)];
        setActiveEvents((prev) => prev.filter((e) => e.id !== removedEvent.id));
        toast.success(`Gefahr gebannt: ${removedEvent.message}`);
      }
    }

    onLookAround();
  };

  const getTimeFactor = (): number => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour <= 18) return 1.3; // Day
    if (hour >= 19 && hour <= 21) return 0.9; // Evening
    return 0.6; // Night
  };

  const getStealthColor = (): string => {
    if (stealth > 60) return 'bg-neon-lime';
    if (stealth > 30) return 'bg-neon-orange';
    return 'bg-destructive';
  };

  const getEventIcon = (type: RiskEvent['type']) => {
    switch (type) {
      case 'pedestrian': return Users;
      case 'car': return Car;
      case 'police': return Siren;
      case 'goodcover': return Shield;
      case 'nightfall': return Moon;
    }
  };

  return (
    <div className="space-y-3">
      {/* Stealth Bar */}
      <Card className="p-4 bg-urban-surface">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className={`w-5 h-5 ${stealth > 30 ? 'text-neon-lime' : 'text-destructive'}`} />
              <span className="font-bold text-sm uppercase">Stealth</span>
            </div>
            <span className={`text-lg font-black ${stealth > 30 ? 'text-neon-lime' : 'text-destructive'}`}>
              {stealth.toFixed(0)}%
            </span>
          </div>

          <div className="w-full h-3 bg-background rounded-full overflow-hidden border border-border">
            <div
              className={`h-full transition-all duration-300 ${getStealthColor()}`}
              style={{ width: `${stealth}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Drain Rate: {(settings.baseDrainRate * totalRiskMultiplier).toFixed(1)}%/s</span>
            <span>Risk Multiplier: ×{totalRiskMultiplier.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* Look Around Button */}
      <Card className="p-3 bg-urban-surface">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold">Umschauen</div>
            <div className="text-xs text-muted-foreground">
              +50% Stealth · {lookAroundsLeft} übrig
            </div>
          </div>
          <Button
            onClick={handleLookAround}
            disabled={lookAroundsLeft <= 0 || lookAroundCooldown > 0}
            size="sm"
            className="gap-2"
          >
            <EyeOff className="w-4 h-4" />
            {lookAroundCooldown > 0 ? `${lookAroundCooldown}s` : 'Umschauen'}
          </Button>
        </div>
      </Card>

      {/* Active Events */}
      {activeEvents.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase text-muted-foreground">Aktive Events</div>
          {activeEvents.map((event) => {
            const Icon = getEventIcon(event.type);
            const isNegative = event.riskMultiplier > 1;
            const remainingTime = Math.max(0, event.duration - (Date.now() - event.timestamp) / 1000);

            return (
              <Alert
                key={event.id}
                className={`p-3 ${isNegative ? 'bg-destructive/10 border-destructive' : 'bg-neon-lime/10 border-neon-lime'}`}
              >
                <Icon className={`w-4 h-4 ${isNegative ? 'text-destructive' : 'text-neon-lime'}`} />
                <AlertDescription className="ml-2 flex items-center justify-between">
                  <span className="text-xs font-medium">{event.message}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3 h-3" />
                    {remainingTime.toFixed(0)}s
                  </div>
                </AlertDescription>
              </Alert>
            );
          })}
        </div>
      )}

      {/* Risk Warning */}
      {stealth < 30 && (
        <Alert className="bg-destructive/20 border-destructive">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <AlertDescription className="ml-2">
            <span className="font-bold text-destructive">WARNUNG!</span> Deine Tarnung ist gefährdet!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
