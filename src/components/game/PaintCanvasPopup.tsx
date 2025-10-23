import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Palette, Undo, Redo, X, SprayCan, Paintbrush, Circle,
  Check, ZoomIn, ZoomOut, Maximize2
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

interface PaintCanvasPopupProps {
  backgroundImage?: string;
  spotId: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  onComplete: (quality: number, imageData: string) => void;
  onCancel: () => void;
}

const COLORS = [
  { id: 'c1', name: 'Hot Pink', value: '#FF1493' },
  { id: 'c2', name: 'Cyan', value: '#00FFFF' },
  { id: 'c3', name: 'Lime', value: '#00FF00' },
  { id: 'c4', name: 'Orange', value: '#FF6600' },
  { id: 'c5', name: 'Purple', value: '#9933FF' },
  { id: 'c6', name: 'Gold', value: '#FFD700' },
  { id: 'c7', name: 'Red', value: '#FF0000' },
  { id: 'c8', name: 'White', value: '#FFFFFF' },
  { id: 'c9', name: 'Black', value: '#000000' },
];

export const PaintCanvasPopup: React.FC<PaintCanvasPopupProps> = ({
  backgroundImage,
  spotId,
  difficulty,
  onComplete,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<BrushStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<BrushStroke | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [brushSize, setBrushSize] = useState(15);
  const [brushType, setBrushType] = useState<'spray' | 'brush' | 'marker'>('spray');
  const [opacity, setOpacity] = useState(1.0);
  const [undoneStrokes, setUndoneStrokes] = useState<BrushStroke[]>([]);
  const [coverage, setCoverage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [flow, setFlow] = useState(0.8); // Procreate-style flow
  const [density, setDensity] = useState(0.7); // Particle density

  // Initialize background canvas (separate from drawing canvas)
  useEffect(() => {
    const bgCanvas = backgroundCanvasRef.current;
    if (!bgCanvas) return;

    const ctx = bgCanvas.getContext('2d');
    if (!ctx) return;

    bgCanvas.width = 1200;
    bgCanvas.height = 900;

    if (backgroundImage) {
      console.log('Loading background image:', backgroundImage.substring(0, 50) + '...');
      const img = new Image();
      img.onload = () => {
        console.log('Background image loaded, drawing to canvas');
        ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        ctx.drawImage(img, 0, 0, bgCanvas.width, bgCanvas.height);
      };
      img.onerror = (e) => {
        console.error('Failed to load background image:', e);
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        toast.error('Hintergrundbild konnte nicht geladen werden');
      };
      img.src = backgroundImage;
    } else {
      console.log('No background image, using default');
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    }
  }, [backgroundImage]);

  // Initialize drawing canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 1200;
    canvas.height = 900;
  }, []);

  // Redraw all strokes on drawing canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear drawing canvas (transparent)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    strokes.forEach(stroke => {
      drawStroke(ctx, stroke);
    });

    // Draw current stroke if drawing
    if (currentStroke && isDrawing) {
      drawStroke(ctx, currentStroke);
    }
  }, [strokes, currentStroke, isDrawing]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Gaussian random number generator for natural spray distribution
  const gaussianRandom = () => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: BrushStroke) => {
    if (stroke.points.length < 1) return;

    ctx.save();

    if (stroke.brushType === 'spray') {
      // PROCREATE-STYLE SPRAY - Professional airbrush simulation
      const sprayRadius = stroke.size;
      const particlesPerPoint = Math.floor(stroke.size * density * 3); // More particles = more coverage
      const centerWeight = 0.7; // How much concentration in center (0-1)

      stroke.points.forEach((point, i) => {
        // Calculate spacing between points for smooth coverage
        const spacing = i > 0 ?
          Math.sqrt(
            Math.pow(point.x - stroke.points[i-1].x, 2) +
            Math.pow(point.y - stroke.points[i-1].y, 2)
          ) : 0;

        // Interpolate between points for smooth coverage
        const interpolationSteps = Math.max(1, Math.floor(spacing / 2));

        for (let step = 0; step < interpolationSteps; step++) {
          const t = step / interpolationSteps;
          const interpX = i > 0 ?
            stroke.points[i-1].x + (point.x - stroke.points[i-1].x) * t : point.x;
          const interpY = i > 0 ?
            stroke.points[i-1].y + (point.y - stroke.points[i-1].y) * t : point.y;

          // Draw particles with gaussian distribution (like real spray)
          for (let j = 0; j < particlesPerPoint; j++) {
            // Use gaussian distribution for realistic spray pattern
            const angle = Math.random() * Math.PI * 2;
            const gaussianDist = Math.abs(gaussianRandom()) * 0.5; // 0.5 = spread factor
            const distance = gaussianDist * sprayRadius;

            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;

            // Calculate opacity based on distance from center (denser in center)
            const distanceRatio = distance / sprayRadius;
            const particleOpacity = stroke.opacity * flow *
              (1 - distanceRatio * (1 - centerWeight)) * 0.15; // 0.15 for buildable opacity

            // Draw particle
            ctx.globalAlpha = particleOpacity;
            ctx.fillStyle = stroke.color;

            // Particle size varies slightly for texture
            const particleSize = (0.8 + Math.random() * 0.4) * (stroke.size / 15);

            ctx.beginPath();
            ctx.arc(
              interpX + offsetX,
              interpY + offsetY,
              particleSize,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }
      });
    } else if (stroke.brushType === 'marker') {
      // Sharp marker with pressure
      ctx.globalAlpha = stroke.opacity;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.forEach(point => ctx.lineTo(point.x, point.y));
      ctx.stroke();
    } else {
      // Smooth brush with texture
      ctx.globalAlpha = stroke.opacity * 0.6;
      ctx.strokeStyle = stroke.color;
      ctx.fillStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Main stroke
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length - 1; i++) {
        const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
        const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
      }
      ctx.stroke();

      // Add texture overlay
      ctx.globalAlpha = stroke.opacity * 0.3;
      stroke.points.forEach((point, i) => {
        if (i % 2 === 0) { // Every other point for performance
          for (let j = 0; j < 3; j++) {
            const offsetX = (Math.random() - 0.5) * stroke.size * 0.3;
            const offsetY = (Math.random() - 0.5) * stroke.size * 0.3;
            ctx.beginPath();
            ctx.arc(point.x + offsetX, point.y + offsetY, stroke.size / 8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
    }

    ctx.restore();
  };

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width / zoom;
    const scaleY = canvas.height / rect.height / zoom;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX - pan.x,
        y: (e.touches[0].clientY - rect.top) * scaleY - pan.y,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX - pan.x,
        y: (e.clientY - rect.top) * scaleY - pan.y,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
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
    setUndoneStrokes([]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentStroke) return;

    const point = getCanvasPoint(e);
    if (!point) return;

    setCurrentStroke(prev => prev ? {
      ...prev,
      points: [...prev.points, point],
    } : null);
  };

  const stopDrawing = () => {
    if (!currentStroke) return;

    if (isDrawing && currentStroke.points.length > 0) {
      // Add current stroke to strokes array
      setStrokes(prev => [...prev, currentStroke]);
      console.log('Stroke completed:', currentStroke.points.length, 'points');
    }

    setIsDrawing(false);
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

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleComplete = () => {
    const canvas = canvasRef.current;
    const bgCanvas = backgroundCanvasRef.current;
    if (!canvas || !bgCanvas) return;

    // Create final composite canvas
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx) return;

    // Draw background first
    finalCtx.drawImage(bgCanvas, 0, 0);
    // Then draw strokes on top
    finalCtx.drawImage(canvas, 0, 0);

    const imageData = finalCanvas.toDataURL('image/png');
    const quality = Math.min(100, Math.max(0, strokes.length * 5));

    onComplete(quality, imageData);
    toast.success('Piece abgeschlossen!');
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
        <div className="relative w-full h-[95vh] flex flex-col bg-gray-950">
          {/* Top Toolbar */}
          <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-primary/30">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black uppercase text-primary">🎨 Paint Mode</h2>
              <div className="text-sm text-muted-foreground">
                Strokes: {strokes.length} | Quality: {Math.min(100, strokes.length * 5)}%
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <Button onClick={handleZoomOut} size="sm" variant="outline" className="gap-2">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-bold min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
              <Button onClick={handleZoomIn} size="sm" variant="outline" className="gap-2">
                <ZoomIn className="w-4 h-4" />
              </Button>

              {/* Undo/Redo */}
              <Button onClick={handleUndo} disabled={strokes.length === 0} size="sm" variant="outline">
                <Undo className="w-4 h-4" />
              </Button>
              <Button onClick={handleRedo} disabled={undoneStrokes.length === 0} size="sm" variant="outline">
                <Redo className="w-4 h-4" />
              </Button>

              {/* Complete/Cancel */}
              <Button onClick={handleComplete} size="sm" className="bg-neon-lime text-black hover:bg-neon-lime/90 gap-2">
                <Check className="w-4 h-4" />
                Fertig
              </Button>
              <Button onClick={onCancel} size="sm" variant="destructive" className="gap-2">
                <X className="w-4 h-4" />
                Abbrechen
              </Button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 overflow-auto relative bg-gray-950">
            <div
              className="relative"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                width: '1200px',
                height: '900px',
              }}
            >
              {/* Background Canvas */}
              <canvas
                ref={backgroundCanvasRef}
                className="absolute top-0 left-0"
                style={{
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
              {/* Drawing Canvas */}
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 cursor-crosshair"
                style={{
                  zIndex: 2,
                  touchAction: 'none'
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  startDrawing(e);
                }}
                onMouseMove={(e) => {
                  e.preventDefault();
                  draw(e);
                }}
                onMouseUp={(e) => {
                  e.preventDefault();
                  stopDrawing();
                }}
                onMouseLeave={(e) => {
                  e.preventDefault();
                  if (isDrawing) stopDrawing();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  startDrawing(e);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  draw(e);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  stopDrawing();
                }}
              />
            </div>
          </div>

          {/* Bottom Toolbar */}
          <div className="p-4 bg-gray-900 border-t border-primary/30 space-y-4">
            {/* Brush Types */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground min-w-[60px]">Brush:</span>
              <Button
                onClick={() => setBrushType('spray')}
                variant={brushType === 'spray' ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
              >
                <SprayCan className="w-4 h-4" />
                Spray
              </Button>
              <Button
                onClick={() => setBrushType('brush')}
                variant={brushType === 'brush' ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
              >
                <Paintbrush className="w-4 h-4" />
                Brush
              </Button>
              <Button
                onClick={() => setBrushType('marker')}
                variant={brushType === 'marker' ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
              >
                <Circle className="w-4 h-4" />
                Marker
              </Button>
            </div>

            {/* Colors */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground min-w-[60px]">Color:</span>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(color => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => {
                      setSelectedColor(color.value);
                      console.log('Color selected:', color.name, color.value);
                    }}
                    className={`w-10 h-10 rounded-full border-4 transition-all cursor-pointer hover:scale-110 ${
                      selectedColor === color.value ? 'border-white ring-2 ring-primary' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Brush Size */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-muted-foreground min-w-[60px]">Size: {brushSize}px</span>
              <Slider
                value={[brushSize]}
                onValueChange={([value]) => setBrushSize(value)}
                min={5}
                max={50}
                step={1}
                className="flex-1 max-w-xs"
              />
            </div>

            {/* Opacity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-muted-foreground min-w-[60px]">Opacity: {Math.round(opacity * 100)}%</span>
              <Slider
                value={[opacity * 100]}
                onValueChange={([value]) => setOpacity(value / 100)}
                min={10}
                max={100}
                step={10}
                className="flex-1 max-w-xs"
              />
            </div>

            {/* Flow - Procreate style */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-muted-foreground min-w-[60px]">Flow: {Math.round(flow * 100)}%</span>
              <Slider
                value={[flow * 100]}
                onValueChange={([value]) => setFlow(value / 100)}
                min={10}
                max={100}
                step={10}
                className="flex-1 max-w-xs"
              />
            </div>

            {/* Density - Spray coverage */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-muted-foreground min-w-[60px]">Density: {Math.round(density * 100)}%</span>
              <Slider
                value={[density * 100]}
                onValueChange={([value]) => setDensity(value / 100)}
                min={30}
                max={100}
                step={10}
                className="flex-1 max-w-xs"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
