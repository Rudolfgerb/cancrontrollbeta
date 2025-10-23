import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useGame } from '@/contexts/GameContext';
import type { GalleryPiece } from '@/contexts/GameContext';
import { Image, X, Star, DollarSign, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const Gallery: React.FC = () => {
  const { gameState, removeFromGallery } = useGame();
  const [selectedPiece, setSelectedPiece] = useState<GalleryPiece | null>(null);
  const [gallery, setGallery] = useState<GalleryPiece[]>([]);

  // Load gallery from localStorage on mount
  useEffect(() => {
    const savedGallery = localStorage.getItem('gallery');
    if (savedGallery) {
      try {
        const parsed: GalleryPiece[] = JSON.parse(savedGallery);
        setGallery(parsed);
      } catch (error) {
        console.error('Failed to load gallery:', error);
      }
    }
  }, [gameState.gallery]); // Re-load when gameState.gallery changes

  const handleDelete = (pieceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Willst du dieses Piece wirklich löschen?')) {
      removeFromGallery(pieceId);
      setGallery(prev => prev.filter(p => p.id !== pieceId));
      if (selectedPiece?.id === pieceId) {
        setSelectedPiece(null);
      }
      toast.success('Piece aus der Gallerie gelöscht');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-cyan-500';
      case 'hard': return 'text-orange-500';
      case 'extreme': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (gallery.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <Image className="w-24 h-24 text-muted-foreground/30 mb-6" />
        <h3 className="text-2xl font-black uppercase text-muted-foreground mb-2">
          Keine Pieces in der Gallerie
        </h3>
        <p className="text-muted-foreground text-center max-w-md">
          Male dein erstes Piece und speichere es in der Gallerie, um es hier zu sehen!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black uppercase">
          Meine Gallerie
        </h2>
        <div className="text-sm text-muted-foreground">
          {gallery.length} {gallery.length === 1 ? 'Piece' : 'Pieces'}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gallery.map((piece) => (
          <Card
            key={piece.id}
            className="group relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20"
            onClick={() => setSelectedPiece(piece)}
          >
            <div className="aspect-square relative">
              <img
                src={piece.imageData}
                alt={piece.spotName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Delete Button */}
              <Button
                onClick={(e) => handleDelete(piece.id, e)}
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              {/* Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-white space-y-1">
                  <div className="font-black text-sm truncate">{piece.spotName}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold ${getDifficultyColor(piece.difficulty)}`}>
                      {piece.difficulty.toUpperCase()}
                    </span>
                    <span className="text-white/80">
                      {Math.round(piece.quality)}% Quality
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail Dialog */}
      {selectedPiece && (
        <Dialog open={!!selectedPiece} onOpenChange={() => setSelectedPiece(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden">
            <div className="relative">
              <Button
                onClick={() => setSelectedPiece(null)}
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="w-6 h-6" />
              </Button>

              <div className="grid md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="bg-black flex items-center justify-center">
                  <img
                    src={selectedPiece.imageData}
                    alt={selectedPiece.spotName}
                    className="max-w-full max-h-[80vh] object-contain"
                  />
                </div>

                {/* Details */}
                <div className="p-8 space-y-6 bg-gradient-to-br from-gray-900 to-gray-800">
                  <div>
                    <h2 className="text-3xl font-black uppercase mb-2">
                      {selectedPiece.spotName}
                    </h2>
                    <div className={`text-lg font-bold ${getDifficultyColor(selectedPiece.difficulty)}`}>
                      {selectedPiece.difficulty.toUpperCase()}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-950/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Star className="w-6 h-6 text-yellow-500" />
                        <span className="text-white/80">Qualität</span>
                      </div>
                      <span className="text-2xl font-black text-white">
                        {Math.round(selectedPiece.quality)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-950/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Star className="w-6 h-6 text-neon-orange" />
                        <span className="text-white/80">Fame</span>
                      </div>
                      <span className="text-2xl font-black text-neon-orange">
                        +{selectedPiece.fameEarned}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-950/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-6 h-6 text-neon-lime" />
                        <span className="text-white/80">Money</span>
                      </div>
                      <span className="text-2xl font-black text-neon-lime">
                        ${selectedPiece.moneyEarned}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-950/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-neon-cyan" />
                        <span className="text-white/80">Gemalt am</span>
                      </div>
                      <span className="text-sm font-bold text-neon-cyan">
                        {formatDate(selectedPiece.timestamp)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={(e) => {
                      handleDelete(selectedPiece.id, e);
                      setSelectedPiece(null);
                    }}
                    variant="destructive"
                    className="w-full gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Aus Gallerie löschen
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
