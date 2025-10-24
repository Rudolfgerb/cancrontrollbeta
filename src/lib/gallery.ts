// Gallery Management with localStorage

export interface UserRating {
  userId: string;
  rating: number;
  timestamp: number;
}

export interface PaintedPiece {
  id: string;
  spotId: string;
  spotName: string;
  imageData: string; // base64
  timestamp: number;
  quality: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  userId?: string;
  username?: string;
  crew?: string; // Painter's crew name
  rating?: number; // Deprecated - kept for backwards compatibility
  ratings?: UserRating[]; // Multi-user ratings
  averageRating?: number; // Calculated average
}

const GALLERY_KEY = 'cancontroll_gallery';
const MAX_PIECES = 100; // Maximum pieces to store

export const galleryService = {
  // Get all pieces
  getAllPieces(): PaintedPiece[] {
    try {
      const data = localStorage.getItem(GALLERY_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading gallery:', error);
      return [];
    }
  },

  // Save a new piece
  savePiece(piece: Omit<PaintedPiece, 'id' | 'timestamp'>): PaintedPiece {
    const newPiece: PaintedPiece = {
      ...piece,
      id: `piece_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    const pieces = this.getAllPieces();
    pieces.unshift(newPiece); // Add to beginning (newest first)

    // Limit to MAX_PIECES
    if (pieces.length > MAX_PIECES) {
      pieces.splice(MAX_PIECES);
    }

    localStorage.setItem(GALLERY_KEY, JSON.stringify(pieces));
    return newPiece;
  },

  // Delete a piece
  deletePiece(id: string): void {
    const pieces = this.getAllPieces();
    const filtered = pieces.filter(p => p.id !== id);
    localStorage.setItem(GALLERY_KEY, JSON.stringify(filtered));
  },

  // Get latest N pieces
  getLatestPieces(count: number = 12): PaintedPiece[] {
    return this.getAllPieces().slice(0, count);
  },

  // Get user's pieces
  getUserPieces(userId: string): PaintedPiece[] {
    return this.getAllPieces().filter(p => p.userId === userId);
  },

  // Clear all pieces
  clearAll(): void {
    localStorage.setItem(GALLERY_KEY, JSON.stringify([]));
  },

  // Get piece by ID
  getPieceById(id: string): PaintedPiece | null {
    const pieces = this.getAllPieces();
    return pieces.find(p => p.id === id) || null;
  },

  // Update rating (deprecated - use addUserRating instead)
  updateRating(id: string, rating: number): void {
    const pieces = this.getAllPieces();
    const piece = pieces.find(p => p.id === id);
    if (piece) {
      piece.rating = rating;
      localStorage.setItem(GALLERY_KEY, JSON.stringify(pieces));
    }
  },

  // Add or update user rating for a piece
  addUserRating(pieceId: string, userId: string, rating: number): boolean {
    const pieces = this.getAllPieces();
    const piece = pieces.find(p => p.id === pieceId);

    if (!piece) return false;

    // Initialize ratings array if it doesn't exist
    if (!piece.ratings) {
      piece.ratings = [];
    }

    // Check if user already rated
    const existingRatingIndex = piece.ratings.findIndex(r => r.userId === userId);

    if (existingRatingIndex >= 0) {
      // User already rated - don't allow re-rating
      return false;
    }

    // Add new rating
    piece.ratings.push({
      userId,
      rating,
      timestamp: Date.now(),
    });

    // Calculate average rating
    piece.averageRating = piece.ratings.reduce((sum, r) => sum + r.rating, 0) / piece.ratings.length;

    localStorage.setItem(GALLERY_KEY, JSON.stringify(pieces));
    return true;
  },

  // Check if user has already rated a piece
  hasUserRated(pieceId: string, userId: string): boolean {
    const piece = this.getPieceById(pieceId);
    if (!piece || !piece.ratings) return false;
    return piece.ratings.some(r => r.userId === userId);
  },

  // Get user's rating for a piece (or null if not rated)
  getUserRating(pieceId: string, userId: string): number | null {
    const piece = this.getPieceById(pieceId);
    if (!piece || !piece.ratings) return null;
    const userRating = piece.ratings.find(r => r.userId === userId);
    return userRating ? userRating.rating : null;
  },

  // Get rating statistics for a piece
  getRatingStats(pieceId: string): { average: number; count: number } | null {
    const piece = this.getPieceById(pieceId);
    if (!piece || !piece.ratings || piece.ratings.length === 0) {
      return null;
    }
    return {
      average: piece.averageRating || 0,
      count: piece.ratings.length,
    };
  },
};
