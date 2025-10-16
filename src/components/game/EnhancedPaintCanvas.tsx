import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { StealthSystem } from './StealthSystem';
import { PoliceQTE } from './PoliceQTE';
import {
  Palette, Eraser, Undo, Redo, Save, X,
  SprayCan, Paintbrush, Circle, Square, Check
} from 'lucide-react';
import { toast } from 'sonner';

interface BrushStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  size: number;
  opacity: number;
  brushType: 'spray' | 'brush' | 'marker';
  timestamp: number;
}

interface EnhancedPaintCanvasProps {
  backgroundImage?: string;
  spotId: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  spotRiskFactor: number;
  onComplete: (quality: number, imageData: string) => void;
  onCancel: () => void;
}

const COLORS = [
  { id: 'c1', name: 'Hot Pink', value: '#FF1493', cost: 0 },
  { id: 'c2', name: 'Cyan', value: '#00FFFF', cost: 0 },
  { id: 'c3', name: 'Lime', value: '#00FF00', cost: 10 },
  { id: 'c4', name: 'Orange', value: '#FF6600', cost: 10 },
  { id: 'c5', name: 'Purple', value: '#9933FF', cost: 15 },
  { id: 'c6', name: 'Gold', value: '#FFD700', cost: 20 },
  { id: 'c7', name: 'Red', value: '#FF0000', cost: 10 },
  { id: 'c8', name: 'White', value: '#FFFFFF', cost: 5 },
  { id: 'c9', name: 'Black', value: '#000000', cost: 5 },
];

export const EnhancedPaintCanvas: React.FC<EnhancedPaintCanvasProps> = ({
  backgroundImage,
  spotId,
  difficulty,
  spotRiskFactor,
  onComplete,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<BrushStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<BrushStroke | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [brushSize, setBrushSize] = useState(15);
  const [brushType, setBrushType] = useState<'spray' | 'brush' | 'marker'>('spray');
  const [opacity, setOpacity] = useState(1.0);
  const [undoneStrokes, setUndoneStrokes] = useState<BrushStroke[]>([]);
  const [isPainting, setIsPainting] = useState(true);
  const [showQTE, setShowQTE] = useState(false);
  const [coverage, setCoverage] = useState(0);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Load background if provided
    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = backgroundImage;
    } else {
      // Default background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [backgroundImage]);

  // Redraw all strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawStrokes(ctx);
      };
      img.src = backgroundImage;
    } else {
      drawStrokes(ctx);
    }
  }, [strokes, backgroundImage]);

  const drawStrokes = (ctx: CanvasRenderingContext2D) => {
    strokes.forEach(stroke => {
      drawStroke(ctx, stroke);
    });
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: BrushStroke) => {
    if (stroke.points.length < 2) return;

    ctx.globalAlpha = stroke.opacity;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Different brush effects
    if (stroke.brushType === 'spray') {
      // Spray effect with particles
      stroke.points.forEach((point, i) => {
        if (i === 0) return;
        const prevPoint = stroke.points[i - 1];

        for (let j = 0; j < 3; j++) {
          const offsetX = (Math.random() - 0.5) * stroke.size;
          const offsetY = (Math.random() - 0.5) * stroke.size;

          ctx.beginPath();
          ctx.arc(point.x + offsetX, point.y + offsetY, stroke.size / 8, 0, Math.PI * 2);
          ctx.fillStyle = stroke.color;
          ctx.fill();
        }
      });
    } else if (stroke.brushType === 'marker') {
      // Sharp marker effect
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    } else {
      // Smooth brush with bezier curves
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length - 1; i++) {
        const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
        const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
      }

      ctx.stroke();
    }

    ctx.globalAlpha = 1.0;
  };

  // Calculate coverage percentage
  const calculateCoverage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let paintedPixels = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      // Check if pixel is not background
      if (!(r === 26 && g === 26 && b === 26) && a > 0) {
        paintedPixels++;
      }
    }

    return (paintedPixels / (pixels.length / 4)) * 100;
  }, []);

  useEffect(() => {
    redrawCanvas();
    const newCoverage = calculateCoverage();
    setCoverage(newCoverage);
  }, [strokes, redrawCanvas, calculateCoverage]);

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPainting) return;

    const point = getCanvasPoint(e);
    if (!point) return;

    setIsDrawing(true);
    const newStroke: BrushStroke = {
      id: `stroke-${Date.now()}`,
      points: [point],
      color: selectedColor,
      size: brushSize,
      opacity,
      brushType,
      timestamp: Date.now(),
    };
    setCurrentStroke(newStroke);
    setUndoneStrokes([]); // Clear redo stack
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentStroke || !isPainting) return;

    const point = getCanvasPoint(e);
    if (!point) return;

    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, point],
    };
    setCurrentStroke(updatedStroke);

    // Draw in real-time
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawStroke(ctx, updatedStroke);
  };

  const stopDrawing = () => {
    if (!isDrawing || !currentStroke) return;

    setIsDrawing(false);
    setStrokes(prev => [...prev, currentStroke]);
    setCurrentStroke(null);
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const lastStroke = strokes[strokes.length - 1];
    setStrokes(prev => prev.slice(0, -1));
    setUndoneStrokes(prev => [...prev, lastStroke]);
    toast.info('Rückgängig');
  };

  const handleRedo = () => {
    if (undoneStrokes.length === 0) return;
    const strokeToRedo = undoneStrokes[undoneStrokes.length - 1];
    setStrokes(prev => [...prev, strokeToRedo]);
    setUndoneStrokes(prev => prev.slice(0, -1));
    toast.info('Wiederherstellen');
  };

  const handleStealthDepleted = () => {
    setIsPainting(false);
    setShowQTE(true);
    toast.error('Deine Tarnung ist aufgeflogen!');
  };

  const handleQTESuccess = () => {
    setShowQTE(false);
    setIsPainting(true);
    toast.success('Du bist entkommen! Weiter malen!');
  };

  const handleQTEFailure = () => {
    setShowQTE(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const quality = Math.min(coverage / 30, 1);
    const imageData = canvas.toDataURL('image/png');
    onComplete(quality * 0.5, imageData); // 50% penalty for getting caught
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const quality = Math.min(coverage / 30, 1);
    const imageData = canvas.toDataURL('image/png');
    onComplete(quality, imageData);
    toast.success(`Graffiti gespeichert! Qualität: ${(quality * 100).toFixed(0)}%`);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Professional Studio Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black border-b border-primary/30 shadow-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-primary/50 rounded-lg shadow-neon">
              <SprayCan className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary via-neon-cyan to-neon-lime">
                Graffiti Studio Pro
              </h2>
              <div className="flex gap-4 mt-1">
                <p className="text-xs text-muted-foreground">Coverage: <span className="text-neon-lime font-bold">{coverage.toFixed(1)}%</span></p>
                <p className="text-xs text-muted-foreground">Strokes: <span className="text-neon-cyan font-bold">{strokes.length}</span></p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="gap-2 bg-gradient-to-r from-neon-lime to-neon-cyan text-black hover:shadow-neon transition-all">
              <Save className="w-4 h-4" />
              Save Piece
            </Button>
            <Button onClick={onCancel} variant="outline" className="gap-2 border-destructive/50 hover:bg-destructive/10">
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </div>

        {/* Professional Studio Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Brush Type - Stylized */}
          <Card className="p-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-primary/20 backdrop-blur">
            <div className="text-xs font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-neon-cyan">TOOL SELECT</div>
            <div className="grid grid-cols-3 gap-1">
              <Button
                size="sm"
                variant={brushType === 'spray' ? 'default' : 'outline'}
                onClick={() => setBrushType('spray')}
                className={`flex flex-col gap-1 h-auto p-2 ${brushType === 'spray' ? 'bg-gradient-to-br from-primary to-primary/70 shadow-neon' : ''}`}
                title="Spray Can"
              >
                <SprayCan className="w-5 h-5" />
                <span className="text-[10px]">Spray</span>
              </Button>
              <Button
                size="sm"
                variant={brushType === 'brush' ? 'default' : 'outline'}
                onClick={() => setBrushType('brush')}
                className={`flex flex-col gap-1 h-auto p-2 ${brushType === 'brush' ? 'bg-gradient-to-br from-primary to-primary/70 shadow-neon' : ''}`}
                title="Paint Brush"
              >
                <Paintbrush className="w-5 h-5" />
                <span className="text-[10px]">Brush</span>
              </Button>
              <Button
                size="sm"
                variant={brushType === 'marker' ? 'default' : 'outline'}
                onClick={() => setBrushType('marker')}
                className={`flex flex-col gap-1 h-auto p-2 ${brushType === 'marker' ? 'bg-gradient-to-br from-primary to-primary/70 shadow-neon' : ''}`}
                title="Marker"
              >
                <Circle className="w-5 h-5" />
                <span className="text-[10px]">Marker</span>
              </Button>
            </div>
          </Card>

          {/* Brush Size - Stylized */}
          <Card className="p-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-neon-cyan/20 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-lime">
                BRUSH SIZE
              </div>
              <div className="text-xs font-mono bg-neon-cyan/20 px-2 py-0.5 rounded text-neon-cyan">
                {brushSize}px
              </div>
            </div>
            <Slider
              value={[brushSize]}
              onValueChange={([value]) => setBrushSize(value)}
              min={5}
              max={50}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
              <span>Fine</span>
              <span>Thicc</span>
            </div>
          </Card>

          {/* Opacity - Stylized */}
          <Card className="p-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-neon-orange/20 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-orange to-primary">
                OPACITY
              </div>
              <div className="text-xs font-mono bg-neon-orange/20 px-2 py-0.5 rounded text-neon-orange">
                {(opacity * 100).toFixed(0)}%
              </div>
            </div>
            <Slider
              value={[opacity * 100]}
              onValueChange={([value]) => setOpacity(value / 100)}
              min={10}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
              <span>Ghost</span>
              <span>Solid</span>
            </div>
          </Card>

          {/* Actions - Stylized */}
          <Card className="p-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-destructive/20 backdrop-blur">
            <div className="text-xs font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-destructive to-neon-orange">
              HISTORY
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleUndo}
                disabled={strokes.length === 0}
                className="flex flex-col gap-1 h-auto p-2 hover:bg-neon-cyan/10 hover:border-neon-cyan disabled:opacity-30"
                title="Undo"
              >
                <Undo className="w-5 h-5" />
                <span className="text-[10px]">Undo</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRedo}
                disabled={undoneStrokes.length === 0}
                className="flex flex-col gap-1 h-auto p-2 hover:bg-neon-lime/10 hover:border-neon-lime disabled:opacity-30"
                title="Redo"
              >
                <Redo className="w-5 h-5" />
                <span className="text-[10px]">Redo</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Professional Canvas Area */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 p-6 overflow-auto bg-gradient-to-br from-gray-900/50 to-black border-primary/20 shadow-2xl backdrop-blur">
            {/* Canvas Wrapper with Frame Effect */}
            <div className="relative p-4 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-primary/30 shadow-inner">
              {/* Corner Ornaments */}
              <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-neon-cyan/50 rounded-tl" />
              <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-neon-lime/50 rounded-tr" />
              <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-neon-orange/50 rounded-bl" />
              <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-primary/50 rounded-br" />

              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="border-4 border-primary/40 rounded-lg cursor-crosshair mx-auto shadow-2xl hover:border-primary/60 transition-all"
                style={{
                  touchAction: 'none',
                  maxWidth: '100%',
                  height: 'auto',
                  boxShadow: '0 0 30px rgba(255, 20, 147, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
                }}
              />
            </div>
          </Card>

          {/* Professional Color Palette */}
          <Card className="mt-4 p-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 border-primary/20 backdrop-blur">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary to-neon-cyan">
                Color Palette
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2" style={{ backgroundColor: selectedColor, borderColor: selectedColor }} />
                <span className="text-xs font-mono text-muted-foreground">{selectedColor}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(color => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.value)}
                  className={`relative w-14 h-14 rounded-lg border-2 transition-all hover:scale-110 hover:rotate-3 ${
                    selectedColor === color.value
                      ? 'border-primary scale-110 shadow-neon'
                      : 'border-gray-600/50 hover:border-primary/50'
                  }`}
                  style={{
                    backgroundColor: color.value,
                    boxShadow: selectedColor === color.value
                      ? `0 0 20px ${color.value}80`
                      : 'none'
                  }}
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-6 h-6 text-white drop-shadow-lg" style={{
                        filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8))'
                      }} />
                    </div>
                  )}
                  {color.cost > 0 && (
                    <div className="absolute -top-1 -right-1 bg-neon-orange text-black text-[8px] font-bold px-1 rounded-full">
                      ${color.cost}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Sidebar - Stealth System */}
        <div className="w-80">
          <StealthSystem
            spotRiskFactor={spotRiskFactor}
            difficulty={difficulty}
            isPainting={isPainting}
            onStealthDepleted={handleStealthDepleted}
            onLookAround={() => toast.info('Du schaust dich um...')}
          />
        </div>
      </div>

      {/* Police QTE Overlay */}
      {showQTE && (
        <PoliceQTE
          difficulty={difficulty}
          onSuccess={handleQTESuccess}
          onFailure={handleQTEFailure}
        />
      )}
    </div>
  );
};
