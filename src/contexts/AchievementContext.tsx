import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Achievement } from '@/data/achievements';
import { achievementService, UserStats } from '@/services/achievementService';
import { AchievementNotification } from '@/components/game/AchievementNotification';
import { useGame } from './GameContext';

interface AchievementContextType {
  unlockedAchievements: Achievement[];
  checkAndUnlockAchievements: (userStats: Partial<UserStats>) => void;
  trackAction: (actionType: string, value: number | boolean) => void;
  getAchievementProgress: (achievementId: string) => number;
  getAllAchievements: () => Array<Achievement & { unlocked: boolean; progress: number }>;
  achievementStats: {
    total: number;
    unlocked: number;
    locked: number;
    byRarity: Record<string, { total: number; unlocked: number }>;
    byCategory: Record<string, { total: number; unlocked: number }>;
  };
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

const USER_ID = 'default_user'; // In a real app, this would come from auth

export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { gameState } = useGame();
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<Partial<UserStats>>({});

  // Initialize unlocked achievements
  useEffect(() => {
    const unlocked = achievementService.getUnlockedAchievements(USER_ID);
    setUnlockedAchievements(unlocked);
  }, []);

  // Sync game state to user stats
  useEffect(() => {
    const stats: Partial<UserStats> = {
      fame: gameState.fame,
      current_money: gameState.money,
      pieces_completed: gameState.stats.totalPieces,
      total_pieces: gameState.stats.totalPieces,
      spots_painted: gameState.stats.spotsPainted,
      best_quality: gameState.stats.bestFame / 100, // Approximation
      colors_owned: gameState.inventory.colors.length,
      tools_owned: gameState.inventory.designs.length,
      // Add more mappings as needed
    };
    setUserStats(stats);
  }, [gameState]);

  // Show notification from queue
  useEffect(() => {
    if (!currentNotification && notificationQueue.length > 0) {
      const [next, ...rest] = notificationQueue;
      setCurrentNotification(next);
      setNotificationQueue(rest);
    }
  }, [currentNotification, notificationQueue]);

  const handleDismissNotification = useCallback(() => {
    setCurrentNotification(null);
  }, []);

  const checkAndUnlockAchievements = useCallback(
    (stats: Partial<UserStats>) => {
      const mergedStats = { ...userStats, ...stats };
      setUserStats(mergedStats);

      // Check all achievements
      const newlyUnlocked = achievementService.trackAction(USER_ID, '', 0, mergedStats);

      if (newlyUnlocked.length > 0) {
        setUnlockedAchievements(prev => [...prev, ...newlyUnlocked]);
        setNotificationQueue(prev => [...prev, ...newlyUnlocked]);
      }
    },
    [userStats]
  );

  const trackAction = useCallback(
    (actionType: string, value: number | boolean) => {
      const updatedStats = { ...userStats, [actionType]: value };
      setUserStats(updatedStats);

      const newlyUnlocked = achievementService.trackAction(USER_ID, actionType, value, updatedStats);

      if (newlyUnlocked.length > 0) {
        setUnlockedAchievements(prev => [...prev, ...newlyUnlocked]);
        setNotificationQueue(prev => [...prev, ...newlyUnlocked]);
      }
    },
    [userStats]
  );

  const getAchievementProgress = useCallback(
    (achievementId: string): number => {
      return achievementService.getAchievementProgress(USER_ID, achievementId, userStats);
    },
    [userStats]
  );

  const getAllAchievements = useCallback(() => {
    return achievementService.getAllAchievementsWithStatus(USER_ID, userStats);
  }, [userStats]);

  const achievementStats = achievementService.getAchievementStats(USER_ID);

  return (
    <AchievementContext.Provider
      value={{
        unlockedAchievements,
        checkAndUnlockAchievements,
        trackAction,
        getAchievementProgress,
        getAllAchievements,
        achievementStats,
      }}
    >
      {children}
      {currentNotification && (
        <AchievementNotification
          achievement={currentNotification}
          onDismiss={handleDismissNotification}
        />
      )}
    </AchievementContext.Provider>
  );
};

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within AchievementProvider');
  }
  return context;
};
