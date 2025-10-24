// Stats Helper - Calculate user statistics from gallery
import { galleryService } from './gallery';
import { getCurrentUserId } from './userHelper';

export interface UserStats {
  totalPieces: number;
  averageQuality: number;
  totalRatingsGiven: number;
  averageRatingReceived: number;
  totalRatingsReceived: number;
  piecesByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
    extreme: number;
  };
  bestQuality: number;
}

/**
 * Calculate comprehensive user statistics from gallery
 */
export const calculateUserStats = (): UserStats => {
  const userId = getCurrentUserId();
  const allPieces = galleryService.getAllPieces();

  // Filter pieces painted by current user
  const userPieces = allPieces.filter(p => p.userId === userId);

  // Calculate pieces by difficulty
  const piecesByDifficulty = {
    easy: userPieces.filter(p => p.difficulty === 'easy').length,
    medium: userPieces.filter(p => p.difficulty === 'medium').length,
    hard: userPieces.filter(p => p.difficulty === 'hard').length,
    extreme: userPieces.filter(p => p.difficulty === 'extreme').length,
  };

  // Calculate average quality
  const averageQuality = userPieces.length > 0
    ? userPieces.reduce((sum, p) => sum + p.quality, 0) / userPieces.length
    : 0;

  // Calculate best quality
  const bestQuality = userPieces.length > 0
    ? Math.max(...userPieces.map(p => p.quality))
    : 0;

  // Calculate ratings given by user (count all ratings where user is the rater)
  let totalRatingsGiven = 0;
  allPieces.forEach(piece => {
    if (piece.ratings) {
      const userRating = piece.ratings.find(r => r.userId === userId);
      if (userRating) {
        totalRatingsGiven++;
      }
    }
  });

  // Calculate ratings received on user's pieces
  let totalRatingsReceived = 0;
  let sumRatingsReceived = 0;

  userPieces.forEach(piece => {
    if (piece.ratings) {
      totalRatingsReceived += piece.ratings.length;
      sumRatingsReceived += piece.ratings.reduce((sum, r) => sum + r.rating, 0);
    }
  });

  const averageRatingReceived = totalRatingsReceived > 0
    ? sumRatingsReceived / totalRatingsReceived
    : 0;

  return {
    totalPieces: userPieces.length,
    averageQuality: Math.round(averageQuality * 10) / 10,
    totalRatingsGiven,
    averageRatingReceived: Math.round(averageRatingReceived * 10) / 10,
    totalRatingsReceived,
    piecesByDifficulty,
    bestQuality: Math.round(bestQuality),
  };
};

/**
 * Get stats for display in profile
 */
export const getProfileStats = () => {
  const stats = calculateUserStats();

  return [
    {
      label: 'Gemalte Pieces',
      value: stats.totalPieces.toString(),
      icon: 'SprayCan',
    },
    {
      label: 'Durchschnittliche Qualität',
      value: `${stats.averageQuality}%`,
      icon: 'Star',
    },
    {
      label: 'Beste Qualität',
      value: `${stats.bestQuality}%`,
      icon: 'Trophy',
    },
    {
      label: 'Bewertungen erhalten',
      value: `${stats.averageRatingReceived.toFixed(1)} ⭐ (${stats.totalRatingsReceived})`,
      icon: 'Heart',
    },
    {
      label: 'Bewertungen gegeben',
      value: stats.totalRatingsGiven.toString(),
      icon: 'MessageSquare',
    },
  ];
};
