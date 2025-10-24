import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { StealthSystem } from './StealthSystem';
import { PoliceQTE } from './PoliceQTE';
import {
  Palette, Eraser, Undo, Redo, Save, X,
  SprayCan, Paintbrush, Circle, Check, Trash2, Droplet
} from 'lucide-react';
import { toast } from 'sonner';

interface Point {
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
}

interface BrushStroke {
  id: string;
  points: Point[];
  color: string;
  size: number;
  opacity: number;
  brushType: 'spray' | 'brush' | 'marker' | 'drip';
  timestamp: number;
}

interface ImprovedPaintCanvasProps {
  backgroundImage?: string;
  spotId: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  spotRiskFactor: number;
  onComplete: (quality: number, imageData: string) => void;
  onCancel: () => void;
}

const COLORS = [
  { id: 'c1', name: 'Hot Pink', value: '#FF1493', unlocked: true },
  { id: 'c2', name: 'Cyan', value: '#00FFFF', unlocked: true },
  { id: 'c3', name: 'Lime', value: '#00FF00', unlocked: true },
  { id: 'c4', name: 'Orange', value: '#FF6600', unlocked: true },
  { id: 'c5', name: 'Purple', value: '#9933FF', unlocked: true },
  { id: 'c6', name: 'Gold', value: '#FFD700', unlocked: true },
  { id: 'c7', name: 'Red', value: '#FF0000', unlocked: true },
  { id: 'c8', name: 'White', value: '#FFFFFF', unlocked: true },
  { id: 'c9', name: 'Black', value: '#000000', unlocked: true },
  { id: 'c10', name: 'Silver', value: '#C0C0C0', unlocked: true },
];

export const ImprovedPaintCanvas: React.FC<ImprovedPaintCanvasProps> = ({
  backgroundImage,
  spotId,
  difficulty,
  spotRiskFactor,
  onComplete,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<BrushStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<BrushStroke | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [brushSize, setBrushSize] = useState(20);
  const [brushType, setBrushType] = useState<'spray' | 'brush' | 'marker' | 'drip'>('spray');
  const [opacity, setOpacity] = useState(0.8);
  const [undoneStrokes, setUndoneStrokes] = useState<BrushStroke[]>([]);
  const [isPainting, setIsPainting] = useState(true);
  const [showQTE, setShowQTE] = useState(false);
  const [coverage, setCoverage] = useState(0);
  const [strokeQuality, setStrokeQuality] = useState(0);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const bgCanvas = backgroundCanvasRef.current;
    if (!canvas || !bgCanvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: false, alpha: true });
    const bgCtx = bgCanvas.getContext('2d');
    if (!ctx || !bgCtx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
    bgCanvas.width = 800;
    bgCanvas.height = 600;

    // Load background if provided
    if (backgroundImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        bgCtx.drawImage(img, 0, 0, bgCanvas.width, bgCanvas.height);
      };
      img.onerror = () => {
        // Fallback background
        drawDefaultBackground(bgCtx, bgCanvas);
      };
      img.src = backgroundImage;
    } else {
      drawDefaultBackground(bgCtx, bgCanvas);
    }
  }, [backgroundImage]);

  const drawDefaultBackground = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Create realistic wall texture
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#2a2a2a');
    gradient.addColorStop(0.5, '#1a1a1a');
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle noise texture
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.02})`;
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 3,
        Math.random() * 3
      );
    }
  };

  // Redraw all strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw all strokes
    strokes.forEach(stroke => {
      drawStroke(ctx, stroke);
    });
  }, [strokes]);

  useEffect(() => {
    redrawCanvas();
    calculateCoverageAndQuality();
  }, [strokes, redrawCanvas]);

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: BrushStroke) => {
    if (stroke.points.length < 2) return;

    ctx.save();
    ctx.globalAlpha = stroke.opacity;
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (stroke.brushType) {
      case 'spray':
        drawSprayStroke(ctx, stroke);
        break;
      case 'drip':
        drawDripStroke(ctx, stroke);
        break;
      case 'marker':
        drawMarkerStroke(ctx, stroke);
        break;
      case 'brush':
      default:
        drawBrushStroke(ctx, stroke);
        break;
    }

    ctx.restore();
  };

  // IMPROVED: Realistic spray effect with proper particle distribution
  const drawSprayStroke = (ctx: CanvasRenderingContext2D, stroke: BrushStroke) => {
    stroke.points.forEach((point, i) => {
      if (i === 0) return;

      const prevPoint = stroke.points[i - 1];
      const distance = Math.sqrt(
        Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
      );

      // More particles for slower movement (more realistic spray)
      const particleCount = Math.max(3, Math.min(15, Math.floor(stroke.size / 2)));
      const spreadRadius = stroke.size * 0.6 * (1 + point.pressure * 0.5);

      for (let j = 0; j < particleCount; j++) {
        // Gaussian distribution for more realistic spray pattern
        const angle = Math.random() * Math.PI * 2;
        const radius = (Math.random() + Math.random()) / 2 * spreadRadius;

        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;

        const particleSize = (Math.random() * 0.5 + 0.5) * (stroke.size / 10) * point.pressure;
        const particleOpacity = (Math.random() * 0.4 + 0.3) * stroke.opacity;

        ctx.globalAlpha = particleOpacity;
        ctx.beginPath();
        ctx.arc(
          point.x + offsetX,
          point.y + offsetY,
          particleSize,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });
  };

  // IMPROVED: Smooth brush with pressure sensitivity
  const drawBrushStroke = (ctx: CanvasRenderingContext2D, stroke: BrushStroke) => {
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    for (let i = 1; i < stroke.points.length - 1; i++) {
      const point = stroke.points[i];
      const nextPoint = stroke.points[i + 1];

      // Smooth curve with pressure-based width
      const xc = (point.x + nextPoint.x) / 2;
      const yc = (point.y + nextPoint.y) / 2;

      ctx.lineWidth = stroke.size * (0.5 + point.pressure * 0.5);
      ctx.quadraticCurveTo(point.x, point.y, xc, yc);
    }

    ctx.stroke();
  };

  // NEW: Marker with sharp edges
  const drawMarkerStroke = (ctx: CanvasRenderingContext2D, stroke: BrushStroke) => {
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    stroke.points.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });

    ctx.stroke();
  };

  // NEW: Drip effect
  const drawDripStroke = (ctx: CanvasRenderingContext2D, stroke: BrushStroke) => {
    stroke.points.forEach((point, i) => {
      if (i === 0) return;

      // Main stroke
      ctx.beginPath();
      ctx.arc(point.x, point.y, stroke.size / 2, 0, Math.PI * 2);
      ctx.fill();

      // Random drips
      if (Math.random() < 0.1) {
        const dripLength = Math.random() * stroke.size * 3;
        const dripWidth = stroke.size * 0.3;

        ctx.beginPath();
        ctx.moveTo(point.x - dripWidth / 2, point.y);
        ctx.lineTo(point.x + dripWidth / 2, point.y);
        ctx.lineTo(point.x, point.y + dripLength);
        ctx.closePath();
        ctx.fill();
      }
    });
  };

  // Calculate coverage and quality
  const calculateCoverageAndQuality = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let paintedPixels = 0;
      let colorDiversity = new Set<string>();

      for (let i = 0; i < pixels.length; i += 4) {
        const a = pixels[i + 3];
        if (a > 10) {
          paintedPixels++;
          const colorKey = `${pixels[i]}-${pixels[i + 1]}-${pixels[i + 2]}`;
          colorDiversity.add(colorKey);
        }
      }

      const newCoverage = (paintedPixels / (pixels.length / 4)) * 100;
      const diversityBonus = Math.min(colorDiversity.size / 5, 1) * 20;
      const strokeBonus = Math.min(strokes.length / 10, 1) * 10;

      setCoverage(newCoverage);
      setStrokeQuality(newCoverage * 0.7 + diversityBonus + strokeBonus);
    } catch (e) {
      console.error('Error calculating coverage:', e);
    }
  }, [strokes.length]);

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number, pressure = 0.7;

    if ('touches' in e) {
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
      // @ts-ignore - force is not in TS types but exists on some devices
      pressure = touch.force || 0.7;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
      // Simulate pressure based on mouse movement speed
      pressure = 0.7;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      pressure: Math.max(0.3, Math.min(1, pressure)),
      timestamp: Date.now(),
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPainting) return;

    e.preventDefault();
    const point = getCanvasPoint(e);
    if (!point) return;

    setIsDrawing(true);
    const newStroke: BrushStroke = {
      id: `stroke-${Date.now()}-${Math.random()}`,
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

    e.preventDefault();
    const point = getCanvasPoint(e);
    if (!point) return;

    // Throttle points to avoid too many
    const lastPoint = currentStroke.points[currentStroke.points.length - 1];
    const distance = Math.sqrt(
      Math.pow(point.x - lastPoint.x, 2) + Math.pow(point.y - lastPoint.y, 2)
    );

    if (distance < 2) return; // Skip if too close

    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, point],
    };
    setCurrentStroke(updatedStroke);

    // Draw in real-time for immediate feedback
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw only the new segment
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (brushType === 'spray') {
      // Draw spray particles for the new point
      const particleCount = Math.floor(brushSize / 2);
      const spreadRadius = brushSize * 0.6 * (1 + point.pressure * 0.5);

      for (let j = 0; j < particleCount; j++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = (Math.random() + Math.random()) / 2 * spreadRadius;

        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;

        const particleSize = (Math.random() * 0.5 + 0.5) * (brushSize / 10) * point.pressure;
        const particleOpacity = (Math.random() * 0.4 + 0.3) * opacity;

        ctx.globalAlpha = particleOpacity;
        ctx.beginPath();
        ctx.arc(
          point.x + offsetX,
          point.y + offsetY,
          particleSize,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    } else {
      // For other brush types, draw line segment
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }

    ctx.restore();
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

  const handleClear = () => {
    if (strokes.length === 0) return;
    setStrokes([]);
    setUndoneStrokes([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    toast.info('Canvas geleert');
  };

  const handleStealthDepleted = () => {
    setIsPainting(false);
    setShowQTE(true);
    toast.error('Deine Tarnung ist aufgeflogen!', {
      description: 'Bestehe das QTE um zu entkommen!'
    });
  };

  const handleQTESuccess = () => {
    setShowQTE(false);
    setIsPainting(true);
    toast.success('Du bist entkommen!', {
      description: 'Weiter malen!'
    });
  };

  const handleQTEFailure = () => {
    setShowQTE(false);
    const canvas = canvasRef.current;
    const bgCanvas = backgroundCanvasRef.current;
    if (!canvas || !bgCanvas) return;

    // Merge canvases
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    const finalCtx = finalCanvas.getContext('2d');
    if (finalCtx) {
      finalCtx.drawImage(bgCanvas, 0, 0);
      finalCtx.drawImage(canvas, 0, 0);
    }

    const quality = Math.min(strokeQuality / 100, 1);
    const imageData = finalCanvas.toDataURL('image/png');
    onComplete(quality * 0.5, imageData); // 50% penalty for getting caught
    toast.error('Du wurdest erwischt!', {
      description: `Qualität: ${(quality * 50).toFixed(0)}% (50% Strafe)`
    });
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const bgCanvas = backgroundCanvasRef.current;
    if (!canvas || !bgCanvas) return;

    // Merge background and drawing canvases
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx) return;

    finalCtx.drawImage(bgCanvas, 0, 0);
    finalCtx.drawImage(canvas, 0, 0);

    const quality = Math.min(strokeQuality / 100, 1);
    const imageData = finalCanvas.toDataURL('image/png');
    onComplete(quality, imageData);

    toast.success('Graffiti gespeichert!', {
      description: `Qualität: ${(quality * 100).toFixed(0)}% | Coverage: ${coverage.toFixed(1)}%`
    });
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b-2 border-primary/30 shadow-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary via-neon-cyan to-neon-lime rounded-lg shadow-neon animate-pulse">
              <SprayCan className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary via-neon-cyan to-neon-lime">
                Paint Studio Pro
              </h2>
              <div className="flex gap-6 mt-1">
                <p className="text-xs text-muted-foreground">
                  Coverage: <span className="text-neon-lime font-black text-sm">{coverage.toFixed(1)}%</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Quality: <span className="text-neon-cyan font-black text-sm">{strokeQuality.toFixed(0)}%</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Strokes: <span className="text-primary font-black text-sm">{strokes.length}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={strokes.length === 0}
              className="gap-2 bg-gradient-to-r from-neon-lime via-neon-cyan to-primary text-black hover:shadow-neon transition-all font-black"
            >
              <Save className="w-5 h-5" />
              SAVE PIECE
            </Button>
            <Button onClick={onCancel} variant="outline" className="gap-2 border-destructive/50 hover:bg-destructive/20 font-bold">
              <X className="w-5 h-5" />
              CANCEL
            </Button>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Brush Type */}
          <Card className="p-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-primary/30 backdrop-blur-xl">
            <div className="text-[10px] font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-neon-cyan uppercase tracking-wider">
              Tool
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { type: 'spray' as const, icon: SprayCan, label: 'Spray' },
                { type: 'brush' as const, icon: Paintbrush, label: 'Brush' },
                { type: 'marker' as const, icon: Circle, label: 'Marker' },
                { type: 'drip' as const, icon: Droplet, label: 'Drip' },
              ].map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  size="sm"
                  variant={brushType === type ? 'default' : 'outline'}
                  onClick={() => setBrushType(type)}
                  className={`flex flex-col gap-1 h-auto p-2 ${
                    brushType === type ? 'bg-gradient-to-br from-primary to-neon-cyan shadow-neon text-white' : 'hover:border-primary/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[9px] font-bold">{label}</span>
                </Button>
              ))}
            </div>
          </Card>

          {/* Size */}
          <Card className="p-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-neon-cyan/30 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-lime uppercase tracking-wider">
                Size
              </div>
              <div className="text-xs font-mono bg-neon-cyan/20 px-2 py-0.5 rounded text-neon-cyan font-bold">
                {brushSize}
              </div>
            </div>
            <Slider
              value={[brushSize]}
              onValueChange={([value]) => setBrushSize(value)}
              min={5}
              max={60}
              step={1}
              className="w-full"
            />
          </Card>

          {/* Opacity */}
          <Card className="p-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-neon-orange/30 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-orange to-primary uppercase tracking-wider">
                Opacity
              </div>
              <div className="text-xs font-mono bg-neon-orange/20 px-2 py-0.5 rounded text-neon-orange font-bold">
                {(opacity * 100).toFixed(0)}%
              </div>
            </div>
            <Slider
              value={[opacity * 100]}
              onValueChange={([value]) => setOpacity(value / 100)}
              min={20}
              max={100}
              step={5}
              className="w-full"
            />
          </Card>

          {/* History */}
          <Card className="p-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-primary/30 backdrop-blur-xl">
            <div className="text-[10px] font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-neon-lime uppercase tracking-wider">
              History
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={handleUndo}
                disabled={strokes.length === 0}
                className="flex flex-col gap-1 h-auto p-2 hover:bg-neon-cyan/10 hover:border-neon-cyan"
              >
                <Undo className="w-4 h-4" />
                <span className="text-[9px] font-bold">Undo</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRedo}
                disabled={undoneStrokes.length === 0}
                className="flex flex-col gap-1 h-auto p-2 hover:bg-neon-lime/10 hover:border-neon-lime"
              >
                <Redo className="w-4 h-4" />
                <span className="text-[9px] font-bold">Redo</span>
              </Button>
            </div>
          </Card>

          {/* Clear */}
          <Card className="p-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-destructive/30 backdrop-blur-xl">
            <div className="text-[10px] font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-destructive to-neon-orange uppercase tracking-wider">
              Reset
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              disabled={strokes.length === 0}
              className="w-full flex flex-col gap-1 h-auto p-2 hover:bg-destructive/10 hover:border-destructive"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-[9px] font-bold">Clear</span>
            </Button>
          </Card>
        </div>
      </div>

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 overflow-auto bg-gradient-to-br from-gray-900/50 via-black to-gray-900/50 border-2 border-primary/30 shadow-2xl backdrop-blur-xl">
            <div className="p-6 h-full flex items-center justify-center">
              <div className="relative">
                {/* Background Canvas */}
                <canvas
                  ref={backgroundCanvasRef}
                  className="absolute top-0 left-0 rounded-lg"
                  style={{ touchAction: 'none' }}
                />
                {/* Drawing Canvas */}
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="relative border-4 border-primary/50 rounded-lg shadow-2xl hover:border-primary/70 transition-all cursor-crosshair"
                  style={{
                    touchAction: 'none',
                    boxShadow: '0 0 40px rgba(255, 20, 147, 0.4), inset 0 0 30px rgba(0, 0, 0, 0.6)',
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Color Palette */}
          <Card className="mt-4 p-4 bg-gradient-to-r from-gray-900/90 via-black to-gray-900/90 border-2 border-primary/30 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary via-neon-cyan to-neon-lime">
                <Palette className="w-5 h-5 inline mr-2" />
                Color Palette
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg border-4 shadow-lg"
                  style={{
                    backgroundColor: selectedColor,
                    borderColor: selectedColor,
                    boxShadow: `0 0 20px ${selectedColor}80`
                  }}
                />
                <span className="text-xs font-mono text-muted-foreground font-bold">{selectedColor}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(color => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.value)}
                  className={`relative w-16 h-16 rounded-xl border-4 transition-all hover:scale-110 ${
                    selectedColor === color.value
                      ? 'border-white scale-110 shadow-neon rotate-3'
                      : 'border-gray-700/50 hover:border-primary/70'
                  }`}
                  style={{
                    backgroundColor: color.value,
                    boxShadow: selectedColor === color.value
                      ? `0 0 25px ${color.value}80, 0 0 50px ${color.value}40`
                      : 'none'
                  }}
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check
                        className="w-8 h-8 text-white drop-shadow-lg"
                        style={{
                          filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.9)) drop-shadow(0 0 12px rgba(255,255,255,0.5))'
                        }}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Stealth System */}
        <div className="w-80">
          <StealthSystem
            spotRiskFactor={spotRiskFactor}
            difficulty={difficulty}
            isPainting={isPainting}
            onStealthDepleted={handleStealthDepleted}
            onLookAround={() => toast.info('Du schaust dich um...', { description: 'Stealth wiederhergestellt!' })}
          />
        </div>
      </div>

      {/* QTE Overlay */}
      {showQTE && (
        <div className="absolute inset-0 z-50">
          <PoliceQTE
            difficulty={difficulty}
            onSuccess={handleQTESuccess}
            onFailure={handleQTEFailure}
          />
        </div>
      )}
    </div>
  );
};
