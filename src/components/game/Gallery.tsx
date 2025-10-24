import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { galleryService, PaintedPiece } from '@/lib/gallery';
import { Trash2, Paintbrush, Calendar, Star, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentUserId } from '@/lib/userHelper';

export const Gallery: React.FC = () => {
  const [pieces, setPieces] = useState<PaintedPiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<PaintedPiece | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [hoverRating, setHoverRating] = useState<number>(0);

  useEffect(() => {
    loadPieces();
  }, []);

  const loadPieces = () => {
    setPieces(galleryService.getAllPieces());
  };

  const handleDelete = (id: string) => {
    if (confirm('Dieses Piece wirklich löschen?')) {
      galleryService.deletePiece(id);
      toast.success('Piece gelöscht');
      loadPieces();
      setSelectedPiece(null);
    }
  };

  const handleRating = (rating: number) => {
    if (selectedPiece) {
      const currentUserId = getCurrentUserId();
      const success = galleryService.addUserRating(selectedPiece.id, currentUserId, rating);

      if (success) {
        const stats = galleryService.getRatingStats(selectedPiece.id);
        const updatedPiece = galleryService.getPieceById(selectedPiece.id);
        if (updatedPiece) {
          setSelectedPiece(updatedPiece);
        }
        loadPieces();
        toast.success(`${rating} Sterne vergeben!`);
      } else {
        toast.error('Du hast dieses Piece bereits bewertet!');
      }
    }
  };

  const filteredPieces = filterDifficulty === 'all'
    ? pieces
    : pieces.filter(p => p.difficulty === filterDifficulty);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black uppercase tracking-wider">Meine Galerie</h1>
        <p className="text-muted-foreground">Alle deine gemalten Pieces</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => setFilterDifficulty('all')}
          variant={filterDifficulty === 'all' ? 'default' : 'outline'}
          size="sm"
        >
          Alle ({pieces.length})
        </Button>
        {['easy', 'medium', 'hard', 'extreme'].map(diff => (
          <Button
            key={diff}
            onClick={() => setFilterDifficulty(diff)}
            variant={filterDifficulty === diff ? 'default' : 'outline'}
            size="sm"
          >
            {diff} ({pieces.filter(p => p.difficulty === diff).length})
          </Button>
        ))}
      </div>

      {/* Gallery Grid */}
      {filteredPieces.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-xl text-muted-foreground">Keine Pieces gefunden</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredPieces.map((piece) => (
            <Card
              key={piece.id}
              className="overflow-hidden hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => setSelectedPiece(piece)}
            >
              <div className="aspect-square relative">
                <img
                  src={piece.imageData}
                  alt={piece.spotName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-white space-y-1">
                    <div className="font-bold text-xs truncate">{piece.spotName}</div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-900">
                <div className="font-bold text-sm truncate">{piece.spotName}</div>
                <div className="flex items-center justify-between mt-2">
                  <Badge className={`text-xs
                    ${piece.difficulty === 'easy' ? 'bg-green-500/20 text-green-500' : ''}
                    ${piece.difficulty === 'medium' ? 'bg-cyan-500/20 text-cyan-500' : ''}
                    ${piece.difficulty === 'hard' ? 'bg-orange-500/20 text-orange-500' : ''}
                    ${piece.difficulty === 'extreme' ? 'bg-pink-500/20 text-pink-500' : ''}
                  `}>
                    {piece.difficulty}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{piece.quality}%</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Fullscreen Detail Dialog */}
      {selectedPiece && (
        <Dialog open={!!selectedPiece} onOpenChange={() => setSelectedPiece(null)}>
          <DialogContent className="max-w-7xl w-full h-[95vh] p-0 overflow-hidden">
            <div className="grid md:grid-cols-[1fr,400px] h-full">
              {/* Left: Fullscreen Image */}
              <div className="relative bg-black flex items-center justify-center">
                <img
                  src={selectedPiece.imageData}
                  alt={selectedPiece.spotName}
                  className="max-w-full max-h-full object-contain"
                />
                <Button
                  onClick={() => setSelectedPiece(null)}
                  variant="ghost"
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
                  size="icon"
                >
                  ✕
                </Button>
              </div>

              {/* Right: Info Panel */}
              <div className="bg-gray-950 p-6 overflow-y-auto space-y-6">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-wider">{selectedPiece.spotName}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedPiece.timestamp).toLocaleString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Star Rating */}
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase text-muted-foreground">Bewertung</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const currentUserId = getCurrentUserId();
                      const userRating = galleryService.getUserRating(selectedPiece.id, currentUserId);
                      const hasRated = userRating !== null;

                      return (
                        <button
                          key={star}
                          onClick={() => handleRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-all hover:scale-110"
                          disabled={hasRated}
                        >
                          <Star
                            className={`w-10 h-10 ${
                              star <= (hoverRating || userRating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-600'
                            } ${hasRated ? 'opacity-70 cursor-not-allowed' : ''}`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  {(() => {
                    const currentUserId = getCurrentUserId();
                    const userRating = galleryService.getUserRating(selectedPiece.id, currentUserId);
                    const stats = galleryService.getRatingStats(selectedPiece.id);

                    return (
                      <div className="space-y-1">
                        {userRating && (
                          <p className="text-sm text-yellow-400 font-bold">
                            Du hast {userRating} von 5 Sternen vergeben
                          </p>
                        )}
                        {stats && (
                          <p className="text-sm text-muted-foreground">
                            ⭐ {stats.average.toFixed(1)} Durchschnitt ({stats.count} {stats.count === 1 ? 'Bewertung' : 'Bewertungen'})
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-gray-900">
                    <div className="text-xs text-muted-foreground uppercase mb-1">Qualität</div>
                    <div className="text-2xl font-black text-neon-cyan">{selectedPiece.quality}%</div>
                  </Card>
                  <Card className="p-4 bg-gray-900">
                    <div className="text-xs text-muted-foreground uppercase mb-1">Schwierigkeit</div>
                    <Badge className={`text-xs
                      ${selectedPiece.difficulty === 'easy' ? 'bg-green-500/20 text-green-500' : ''}
                      ${selectedPiece.difficulty === 'medium' ? 'bg-cyan-500/20 text-cyan-500' : ''}
                      ${selectedPiece.difficulty === 'hard' ? 'bg-orange-500/20 text-orange-500' : ''}
                      ${selectedPiece.difficulty === 'extreme' ? 'bg-pink-500/20 text-pink-500' : ''}
                    `}>
                      {selectedPiece.difficulty.toUpperCase()}
                    </Badge>
                  </Card>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                      <Paintbrush className="w-3 h-3" />
                      Künstler (Maler)
                    </span>
                    <div className="font-bold text-lg mt-1 text-neon-cyan">
                      {selectedPiece.username || 'Unbekannt'}
                    </div>
                  </div>
                  {selectedPiece.crew && (
                    <div>
                      <span className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Crew
                      </span>
                      <div className="font-bold text-lg mt-1 text-neon-pink">
                        {selectedPiece.crew}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-muted-foreground uppercase">Spot ID</span>
                    <div className="font-mono text-sm mt-1 text-gray-400">{selectedPiece.spotId}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t border-gray-800">
                  <Button
                    onClick={() => handleDelete(selectedPiece.id)}
                    variant="destructive"
                    className="w-full gap-2"
                    size="lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Löschen
                  </Button>
                  <Button variant="outline" className="w-full gap-2" size="lg" disabled>
                    <Paintbrush className="w-4 h-4" />
                    Neu malen
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
