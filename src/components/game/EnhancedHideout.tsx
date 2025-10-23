import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useGame } from '@/contexts/GameContext';
import { Trophy, DollarSign, Star, Target, UserX, Award, Briefcase, Clock, Image, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { Gallery } from './Gallery';

export const EnhancedHideout: React.FC = () => {
  const { gameState, addMoney } = useGame();
  const [showWorkDialog, setShowWorkDialog] = useState(false);
  const [showCancelWorkDialog, setShowCancelWorkDialog] = useState(false);
  const [workHours, setWorkHours] = useState(4);
  const [isWorking, setIsWorking] = useState(false);
  const [workStartTime, setWorkStartTime] = useState<number | null>(null);
  const [workEndTime, setWorkEndTime] = useState<number | null>(null);
  const [workProgress, setWorkProgress] = useState(0);
  const [prisonTimeRemaining, setPrisonTimeRemaining] = useState(0);

  // Check if player is in prison
  const prisonUntil = localStorage.getItem('prisonUntil');
  const inPrison = prisonUntil && parseInt(prisonUntil) > Date.now();

  // Load work state from localStorage
  useEffect(() => {
    const savedWorkStart = localStorage.getItem('workStartTime');
    const savedWorkEnd = localStorage.getItem('workEndTime');

    if (savedWorkStart && savedWorkEnd) {
      const startTime = parseInt(savedWorkStart);
      const endTime = parseInt(savedWorkEnd);

      if (endTime > Date.now()) {
        setIsWorking(true);
        setWorkStartTime(startTime);
        setWorkEndTime(endTime);
      } else if (endTime <= Date.now() && endTime > startTime) {
        // Work completed while offline
        completeWork(startTime, endTime);
      }
    }
  }, []);

  // Update work progress and prison timer
  useEffect(() => {
    const interval = setInterval(() => {
      // Update work progress
      if (isWorking && workStartTime && workEndTime) {
        const now = Date.now();
        const totalDuration = workEndTime - workStartTime;
        const elapsed = now - workStartTime;
        const progress = Math.min(100, (elapsed / totalDuration) * 100);

        setWorkProgress(progress);

        if (now >= workEndTime) {
          completeWork(workStartTime, workEndTime);
        }
      }

      // Update prison timer
      if (prisonUntil) {
        const remaining = parseInt(prisonUntil) - Date.now();
        setPrisonTimeRemaining(Math.max(0, remaining));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isWorking, workStartTime, workEndTime, prisonUntil]);

  const startWork = () => {
    const startTime = Date.now();
    const endTime = startTime + (workHours * 60 * 60 * 1000); // hours to milliseconds

    setIsWorking(true);
    setWorkStartTime(startTime);
    setWorkEndTime(endTime);
    setShowWorkDialog(false);

    // Save to localStorage
    localStorage.setItem('workStartTime', String(startTime));
    localStorage.setItem('workEndTime', String(endTime));

    toast.success(`Arbeit gestartet!`, {
      description: `Komm in ${workHours}h zurück um dein Geld abzuholen!`,
    });
  };

  const completeWork = (startTime: number, endTime: number) => {
    const hoursWorked = (endTime - startTime) / (1000 * 60 * 60);
    const moneyEarned = Math.floor(hoursWorked * 50); // $50 per hour

    addMoney(moneyEarned);
    setIsWorking(false);
    setWorkStartTime(null);
    setWorkEndTime(null);
    setWorkProgress(0);

    // Clear localStorage
    localStorage.removeItem('workStartTime');
    localStorage.removeItem('workEndTime');

    toast.success(`Arbeit abgeschlossen!`, {
      description: `Du hast ${moneyEarned}$ verdient!`,
      duration: 5000,
    });
  };

  const cancelWork = () => {
    setIsWorking(false);
    setWorkStartTime(null);
    setWorkEndTime(null);
    setWorkProgress(0);
    setShowCancelWorkDialog(false);

    // Clear localStorage
    localStorage.removeItem('workStartTime');
    localStorage.removeItem('workEndTime');

    toast.error('Arbeit abgebrochen!', {
      description: 'Du hast nichts verdient.',
      duration: 3000,
    });
  };

  const getRemainingTime = () => {
    if (!workEndTime) return '';
    const remaining = workEndTime - Date.now();
    if (remaining <= 0) return 'Fertig!';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPrisonRemainingTime = () => {
    if (prisonTimeRemaining <= 0) return '';

    const hours = Math.floor(prisonTimeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((prisonTimeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((prisonTimeRemaining % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const getPotentialEarnings = () => {
    if (!workStartTime || !workEndTime) return 0;
    const totalHours = (workEndTime - workStartTime) / (1000 * 60 * 60);
    return Math.floor(totalHours * 50);
  };

  const stats = [
    {
      icon: Star,
      label: 'Total Fame',
      value: gameState.fame,
      color: 'text-neon-orange',
    },
    {
      icon: DollarSign,
      label: 'Money',
      value: `$${gameState.money}`,
      color: 'text-neon-lime',
    },
    {
      icon: Target,
      label: 'Total Pieces',
      value: gameState.stats.totalPieces,
      color: 'text-neon-cyan',
    },
    {
      icon: Award,
      label: 'Spots Painted',
      value: gameState.stats.spotsPainted,
      color: 'text-primary',
    },
    {
      icon: Trophy,
      label: 'Best Fame',
      value: gameState.stats.bestFame,
      color: 'text-neon-orange',
    },
    {
      icon: UserX,
      label: 'Times Busted',
      value: gameState.stats.timesArrested,
      color: 'text-destructive',
    },
  ];

  const getWantedStars = () => {
    return Array.from({ length: 5 }, (_, i) => i < gameState.wantedLevel);
  };

  return (
    <div className="p-6">
      <Tabs defaultValue="home" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="home" className="gap-2">
            <Award className="w-4 h-4" />
            Home
          </TabsTrigger>
          <TabsTrigger value="gallery" className="gap-2">
            <Image className="w-4 h-4" />
            Gallerie
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="space-y-6">
      {/* Prison Warning with Timer */}
      {inPrison && prisonTimeRemaining > 0 && (
        <Card className="p-4 bg-red-950/50 border-2 border-red-500 shadow-lg shadow-red-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600 rounded-lg animate-pulse">
                <UserX className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-red-500 uppercase">🚔 Im Gefängnis</h3>
                <p className="text-red-200 text-sm">
                  Du kannst nicht malen!
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-red-500 tabular-nums">
                {getPrisonRemainingTime()}
              </div>
              <div className="text-red-300 text-xs font-bold uppercase">Verbleibend</div>
            </div>
          </div>
        </Card>
      )}

      {/* Work System */}
      {!isWorking ? (
        <Card className="p-4 bg-gradient-to-br from-green-900 to-green-700 border-2 border-green-400 shadow-lg hover:shadow-green-400/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase">Zur Arbeit Schicken</h2>
                <p className="text-green-100 text-sm">💰 $50 pro Stunde</p>
              </div>
            </div>
            <Button
              onClick={() => setShowWorkDialog(true)}
              disabled={inPrison}
              className="bg-white text-green-700 hover:bg-green-100 font-bold"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Starten
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6 bg-gradient-to-br from-blue-900 to-blue-700 border-2 border-blue-400">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-full animate-pulse">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase">Bei der Arbeit...</h3>
                  <p className="text-blue-100">Dein Character arbeitet gerade</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white">{getRemainingTime()}</div>
                <div className="text-blue-200 text-sm">verbleibend</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white font-bold">Fortschritt</span>
                <span className="text-white font-bold">{Math.round(workProgress)}%</span>
              </div>
              <Progress value={workProgress} className="h-4" indicatorClassName="bg-green-500" />
            </div>

            <div className="bg-blue-950/50 p-4 rounded-lg border border-blue-400/30 space-y-3">
              <p className="text-blue-100 text-center">
                ⚠️ Du kannst nicht malen, während dein Character arbeitet!
              </p>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Potentieller Verdienst:</span>
                <span className="text-green-400 font-black text-lg">${getPotentialEarnings()}</span>
              </div>
            </div>

            <Button
              onClick={() => setShowCancelWorkDialog(true)}
              variant="destructive"
              className="w-full gap-2"
            >
              <X className="w-4 h-4" />
              Arbeit Abbrechen (Geld verloren!)
            </Button>
          </div>
        </Card>
      )}

      {/* Wanted Level */}
      <Card className="p-6 bg-gradient-to-r from-gray-900 via-black to-gray-900 border-2 border-primary/30">
        <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-neon-cyan">
          <Trophy className="w-6 h-6 text-primary" />
          Wanted Level
        </h3>
        <div className="flex gap-2">
          {getWantedStars().map((active, i) => (
            <Star
              key={i}
              className={`w-8 h-8 ${
                active ? 'fill-neon-orange text-neon-orange' : 'text-gray-700'
              }`}
            />
          ))}
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-primary/20 hover:border-primary/40 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 bg-gray-950 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground uppercase font-bold">
                  {stat.label}
                </div>
                <div className={`text-2xl font-black ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Work Dialog */}
      <Dialog open={showWorkDialog} onOpenChange={setShowWorkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-green-600" />
              Zur Arbeit Schicken
            </DialogTitle>
            <DialogDescription>
              Wähle wie viele Stunden dein Character arbeiten soll
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Arbeitsdauer</span>
                <span className="text-3xl font-black text-green-600">{workHours}h</span>
              </div>

              <Slider
                value={[workHours]}
                onValueChange={([value]) => setWorkHours(value)}
                min={1}
                max={24}
                step={1}
                className="w-full"
              />

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1h</span>
                <span>24h</span>
              </div>
            </div>

            <Card className="p-4 bg-green-950/20 border-green-500/30">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white">Verdienst:</span>
                  <span className="text-green-400 font-black text-xl">${workHours * 50}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Zeitraum:</span>
                  <span className="text-green-400 font-bold">{workHours} Stunden</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Rückkehr:</span>
                  <span className="text-green-400 font-bold">
                    {new Date(Date.now() + workHours * 60 * 60 * 1000).toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} Uhr
                  </span>
                </div>
              </div>
            </Card>

            <div className="bg-yellow-950/20 border border-yellow-500/30 p-3 rounded-lg">
              <p className="text-yellow-200 text-sm text-center">
                ⚠️ Du kannst nicht malen, während dein Character arbeitet!
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWorkDialog(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={startWork}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Arbeit Starten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Work Dialog */}
      <Dialog open={showCancelWorkDialog} onOpenChange={setShowCancelWorkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Arbeit abbrechen?
            </DialogTitle>
            <DialogDescription>
              Bist du sicher? Du verlierst alle Einnahmen dieser Arbeitssitzung!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Card className="p-4 bg-red-950/20 border-red-500/30">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white">Verlorenes Geld:</span>
                  <span className="text-red-400 font-black text-xl">-${getPotentialEarnings()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Verbleibende Zeit:</span>
                  <span className="text-red-400 font-bold">{getRemainingTime()}</span>
                </div>
              </div>
            </Card>

            <div className="bg-yellow-950/20 border border-yellow-500/30 p-3 rounded-lg">
              <p className="text-yellow-200 text-sm text-center">
                ⚠️ Diese Aktion kann nicht rückgängig gemacht werden!
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelWorkDialog(false)}>
              Weiter arbeiten
            </Button>
            <Button
              onClick={cancelWork}
              variant="destructive"
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Ja, abbrechen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </TabsContent>

        <TabsContent value="gallery">
          <Gallery />
        </TabsContent>
      </Tabs>
    </div>
  );
};
