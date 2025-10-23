import React, { createContext, useContext, useState, useCallback } from 'react';

export interface GraffitiDesign {
  id: string;
  name: string;
  type: 'tag' | 'throwup' | 'piece';
  complexity: number;
  unlocked: boolean;
  cost: number;
  fameRequired: number;
}

export interface SprayColor {
  id: string;
  name: string;
  color: string;
  unlocked: boolean;
  cost: number;
}

export interface Spot {
  id: string;
  name: string;
  x: number;
  y: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  fameReward: number;
  moneyReward: number;
  hasGuard: boolean;
  painted: boolean;
  playerPiece?: string;
  imageData?: string;
}

export interface GalleryPiece {
  id: string;
  imageData: string; // base64 image
  spotName: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  quality: number;
  fameEarned: number;
  moneyEarned: number;
  timestamp: number;
}

interface GameState {
  fame: number;
  money: number;
  wantedLevel: number;
  currentSpot: Spot | null;
  inventory: {
    colors: string[];
    designs: string[];
    selectedColor: string;
    selectedDesign: string;
  };
  spots: Spot[];
  gallery: GalleryPiece[];
  stats: {
    totalPieces: number;
    spotsPainted: number;
    timesArrested: number;
    bestFame: number;
  };
}

interface GameContextType {
  gameState: GameState;
  addFame: (amount: number) => void;
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  increaseWanted: () => void;
  decreaseWanted: () => void;
  selectSpot: (spot: Spot | null) => void;
  paintSpot: (spotId: string, quality: number) => void;
  unlockColor: (colorId: string) => void;
  unlockDesign: (designId: string) => void;
  selectColor: (colorId: string) => void;
  selectDesign: (designId: string) => void;
  resetWanted: () => void;
  getArrested: () => void;
  saveToGallery: (piece: GalleryPiece) => void;
  removeFromGallery: (pieceId: string) => void;
  addSpot: (spot: Spot) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialSpots: Spot[] = [
  { id: 's1', name: 'Hinterhof Alley', x: 20, y: 30, difficulty: 'easy', fameReward: 10, moneyReward: 5, hasGuard: false, painted: false },
  { id: 's2', name: 'Park Mauer', x: 45, y: 25, difficulty: 'easy', fameReward: 15, moneyReward: 8, hasGuard: false, painted: false },
  { id: 's3', name: 'U-Bahn Station', x: 60, y: 50, difficulty: 'medium', fameReward: 30, moneyReward: 15, hasGuard: true, painted: false },
  { id: 's4', name: 'Hauptstraße', x: 35, y: 60, difficulty: 'medium', fameReward: 40, moneyReward: 20, hasGuard: true, painted: false },
  { id: 's5', name: 'Shopping Mall', x: 70, y: 70, difficulty: 'hard', fameReward: 60, moneyReward: 35, hasGuard: true, painted: false },
  { id: 's6', name: 'Bahnhof Gleis', x: 80, y: 35, difficulty: 'extreme', fameReward: 100, moneyReward: 60, hasGuard: true, painted: false },
  { id: 's7', name: 'Polizeiwache', x: 50, y: 80, difficulty: 'extreme', fameReward: 150, moneyReward: 100, hasGuard: true, painted: false },
];

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    fame: 0,
    money: 50,
    wantedLevel: 0,
    currentSpot: null,
    inventory: {
      colors: ['#FF1493', '#00FFFF'],
      designs: ['simple-tag'],
      selectedColor: '#FF1493',
      selectedDesign: 'simple-tag',
    },
    spots: initialSpots,
    gallery: [],
    stats: {
      totalPieces: 0,
      spotsPainted: 0,
      timesArrested: 0,
      bestFame: 0,
    },
  });

  const addFame = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      fame: prev.fame + amount,
      stats: {
        ...prev.stats,
        bestFame: Math.max(prev.stats.bestFame, prev.fame + amount),
      },
    }));
  }, []);

  const addMoney = useCallback((amount: number) => {
    setGameState(prev => ({ ...prev, money: prev.money + amount }));
  }, []);

  const spendMoney = useCallback((amount: number): boolean => {
    if (gameState.money >= amount) {
      setGameState(prev => ({ ...prev, money: prev.money - amount }));
      return true;
    }
    return false;
  }, [gameState.money]);

  const increaseWanted = useCallback(() => {
    setGameState(prev => ({ ...prev, wantedLevel: Math.min(prev.wantedLevel + 1, 5) }));
  }, []);

  const decreaseWanted = useCallback(() => {
    setGameState(prev => ({ ...prev, wantedLevel: Math.max(prev.wantedLevel - 1, 0) }));
  }, []);

  const resetWanted = useCallback(() => {
    setGameState(prev => ({ ...prev, wantedLevel: 0 }));
  }, []);

  const selectSpot = useCallback((spot: Spot | null) => {
    setGameState(prev => ({ ...prev, currentSpot: spot }));
  }, []);

  const paintSpot = useCallback((spotId: string, quality: number) => {
    setGameState(prev => {
      const spot = prev.spots.find(s => s.id === spotId);
      if (!spot) return prev;

      const fameEarned = Math.floor(spot.fameReward * quality);
      const moneyEarned = Math.floor(spot.moneyReward * quality);

      return {
        ...prev,
        fame: prev.fame + fameEarned,
        money: prev.money + moneyEarned,
        spots: prev.spots.map(s =>
          s.id === spotId ? { ...s, painted: true, playerPiece: prev.inventory.selectedDesign } : s
        ),
        stats: {
          ...prev.stats,
          totalPieces: prev.stats.totalPieces + 1,
          spotsPainted: prev.stats.spotsPainted + 1,
          bestFame: Math.max(prev.stats.bestFame, prev.fame + fameEarned),
        },
      };
    });
  }, []);

  const unlockColor = useCallback((colorId: string) => {
    setGameState(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        colors: [...prev.inventory.colors, colorId],
      },
    }));
  }, []);

  const unlockDesign = useCallback((designId: string) => {
    setGameState(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        designs: [...prev.inventory.designs, designId],
      },
    }));
  }, []);

  const selectColor = useCallback((colorId: string) => {
    setGameState(prev => ({
      ...prev,
      inventory: { ...prev.inventory, selectedColor: colorId },
    }));
  }, []);

  const selectDesign = useCallback((designId: string) => {
    setGameState(prev => ({
      ...prev,
      inventory: { ...prev.inventory, selectedDesign: designId },
    }));
  }, []);

  const getArrested = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      money: Math.floor(prev.money * 0.7),
      wantedLevel: 0,
      stats: {
        ...prev.stats,
        timesArrested: prev.stats.timesArrested + 1,
      },
    }));
  }, []);

  const saveToGallery = useCallback((piece: GalleryPiece) => {
    setGameState(prev => ({
      ...prev,
      gallery: [piece, ...prev.gallery], // Add to beginning for newest first
    }));

    // Save to localStorage
    const savedGallery = localStorage.getItem('gallery');
    const gallery: GalleryPiece[] = savedGallery ? JSON.parse(savedGallery) : [];
    gallery.unshift(piece);
    localStorage.setItem('gallery', JSON.stringify(gallery));
  }, []);

  const addSpot = useCallback((spot: Spot) => {
    setGameState(prev => ({
      ...prev,
      spots: [...prev.spots, spot],
    }));
  }, []);

  const removeFromGallery = useCallback((pieceId: string) => {
    setGameState(prev => ({
      ...prev,
      gallery: prev.gallery.filter(p => p.id !== pieceId),
    }));

    // Update localStorage
    const savedGallery = localStorage.getItem('gallery');
    if (savedGallery) {
      const gallery: GalleryPiece[] = JSON.parse(savedGallery);
      const filtered = gallery.filter(p => p.id !== pieceId);
      localStorage.setItem('gallery', JSON.stringify(filtered));
    }
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        addFame,
        addMoney,
        spendMoney,
        increaseWanted,
        decreaseWanted,
        selectSpot,
        paintSpot,
        unlockColor,
        unlockDesign,
        selectColor,
        selectDesign,
        resetWanted,
        getArrested,
        saveToGallery,
        removeFromGallery,
        addSpot,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
