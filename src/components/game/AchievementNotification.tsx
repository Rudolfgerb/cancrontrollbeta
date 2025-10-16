import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Achievement, AchievementRarity } from '@/data/achievements';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementNotificationProps {
  achievement: Achievement;
  onDismiss: () => void;
}

const rarityColors: Record<AchievementRarity, {
  bg: string;
  border: string;
  text: string;
  glow: string;
}> = {
  COMMON: {
    bg: 'bg-neon-lime/10',
    border: 'border-neon-lime',
    text: 'text-neon-lime',
    glow: 'shadow-[0_0_20px_rgba(6,255,165,0.5)]',
  },
  UNCOMMON: {
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan',
    text: 'text-neon-cyan',
    glow: 'shadow-[0_0_20px_rgba(0,255,255,0.5)]',
  },
  RARE: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500',
    text: 'text-blue-400',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
  },
  EPIC: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500',
    text: 'text-purple-400',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
  },
  LEGENDARY: {
    bg: 'bg-primary/10',
    border: 'border-primary',
    text: 'text-primary',
    glow: 'shadow-[0_0_25px_rgba(255,20,147,0.6)]',
  },
  MYTHIC: {
    bg: 'bg-gradient-to-r from-primary/10 via-purple-500/10 to-neon-cyan/10',
    border: 'border-primary',
    text: 'text-primary',
    glow: 'shadow-[0_0_30px_rgba(255,20,147,0.8),0_0_40px_rgba(168,85,247,0.4)]',
  },
};

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);

    // Auto-dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => clearTimeout(dismissTimer);
  }, []);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const rarityStyle = rarityColors[achievement.rarity];

  // Get the icon component
  const IconComponent = (LucideIcons as any)[achievement.icon] || LucideIcons.Award;

  return (
    <div
      className={cn(
        'fixed top-20 right-6 z-50 transition-all duration-300 transform',
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <Card
        className={cn(
          'p-4 border-2 backdrop-blur-md',
          rarityStyle.bg,
          rarityStyle.border,
          rarityStyle.glow,
          'min-w-[320px] max-w-[400px]',
          'cursor-pointer hover:scale-105 transition-transform'
        )}
        onClick={handleDismiss}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              'w-16 h-16 rounded-lg flex items-center justify-center border-2',
              rarityStyle.bg,
              rarityStyle.border
            )}
          >
            <IconComponent className={cn('w-8 h-8', rarityStyle.text)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Achievement Freigeschaltet!
              </span>
            </div>

            <h3 className="font-black text-lg mb-1 truncate">{achievement.name}</h3>

            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {achievement.description}
            </p>

            {/* Rarity Badge */}
            <Badge
              className={cn(
                'mb-2 border',
                rarityStyle.bg,
                rarityStyle.border,
                rarityStyle.text,
                'font-bold'
              )}
            >
              {achievement.rarity}
            </Badge>

            {/* Rewards */}
            <div className="flex flex-wrap gap-2 text-xs">
              {achievement.rewards.exp > 0 && (
                <div className="flex items-center gap-1 bg-purple-500/20 px-2 py-1 rounded border border-purple-500/50">
                  <LucideIcons.Zap className="w-3 h-3 text-purple-400" />
                  <span className="font-bold text-purple-400">+{achievement.rewards.exp} XP</span>
                </div>
              )}
              {achievement.rewards.money > 0 && (
                <div className="flex items-center gap-1 bg-neon-lime/20 px-2 py-1 rounded border border-neon-lime/50">
                  <LucideIcons.DollarSign className="w-3 h-3 text-neon-lime" />
                  <span className="font-bold text-neon-lime">${achievement.rewards.money}</span>
                </div>
              )}
              {achievement.rewards.reputation > 0 && (
                <div className="flex items-center gap-1 bg-neon-orange/20 px-2 py-1 rounded border border-neon-orange/50">
                  <LucideIcons.Star className="w-3 h-3 text-neon-orange" />
                  <span className="font-bold text-neon-orange">+{achievement.rewards.reputation} Rep</span>
                </div>
              )}
              {achievement.rewards.unlocks && achievement.rewards.unlocks.length > 0 && (
                <div className="flex items-center gap-1 bg-primary/20 px-2 py-1 rounded border border-primary/50">
                  <LucideIcons.Gift className="w-3 h-3 text-primary" />
                  <span className="font-bold text-primary">{achievement.rewards.unlocks.length} Unlock(s)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AchievementNotification;
