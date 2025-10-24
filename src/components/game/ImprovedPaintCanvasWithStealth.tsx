import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  SprayCan, Paintbrush, Circle, Check, X, ZoomIn, ZoomOut,
  Undo, Redo, Eye, EyeOff, AlertTriangle, UserX, Menu
} from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface BrushStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  size: number;
  opacity: number;
  brushType: 'spray' | 'brush' | 'marker';
  timestamp: number;
}

interface ImprovedPaintCanvasWithStealthProps {
  backgroundImage?: string;
  spotId: string;
  spotName: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  onComplete: (quality: number, imageData: string, saveToGallery: boolean) => void;
  onCancel: () => void;
  onBusted: () => void;
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

export const ImprovedPaintCanvasWithStealth: React.FC<ImprovedPaintCanvasWithStealthProps> = ({
  backgroundImage,
  spotId,
  spotName,
  difficulty,
  onComplete,
  onCancel,
  onBusted,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<BrushStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<BrushStroke | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [brushSize, setBrushSize] = useState(15);
  const [brushType, setBrushType] = useState<'spray' | 'brush' | 'marker'>('spray');
  const [opacity, setOpacity] = useState(1.0);
  const [undoneStrokes, setUndoneStrokes] = useState<BrushStroke[]>([]);
  const [zoom, setZoom] = useState(1);
  const [flow, setFlow] = useState(0.8);
  const [density, setDensity] = useState(0.7);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 900 });
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const isMobile = useIsMobile();

  // Stealth System
  const [stealth, setStealth] = useState(100);
  const [isLookingAround, setIsLookingAround] = useState(false);
  const [lastLookTime, setLastLookTime] = useState(Date.now());
  const [showPedestrianWarning, setShowPedestrianWarning] = useState(false);
  const [pedestrianWarningText, setPedestrianWarningText] = useState('');
  const [isPedestrianNearby, setIsPedestrianNearby] = useState(false); // Pedestrian spotted = faster drain
  const [showPoliceQTE, setShowPoliceQTE] = useState(false);
  const [qteTargets, setQteTargets] = useState<{ x: number; y: number; active: boolean }[]>([]);
  const [qteSuccess, setQteSuccess] = useState(0);
  const [qteRequired, setQteRequired] = useState(10);
  const [showBlueLight, setShowBlueLight] = useState(false);
  const [timesArrested, setTimesArrested] = useState(0);
  const [isPainting, setIsPainting] = useState(false); // Start with false - need to click start button
  const [showExitConfirmDialog, setShowExitConfirmDialog] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(true); // Show start screen first
  const [countdown, setCountdown] = useState<number | null>(null); // 3, 2, 1, or null
  const [showSaveDialog, setShowSaveDialog] = useState(false); // Ask to save to gallery
  const [finalImageData, setFinalImageData] = useState<string>(''); // Store final image

  const difficultyMultiplier = {
    'easy': 0.3,
    'medium': 0.5,
    'hard': 0.7,
    'extreme': 1.0
  }[difficulty];

  // Step 1: Load the image from the prop into an Image object
  useEffect(() => {
    if (!backgroundImage) {
      setBgImage(null);
      return;
    }
    console.log('🎨 Loading background image...');
    const img = new Image();
    img.onload = () => {
      console.log('✅ Background image data loaded into object');
      setBgImage(img);
    };
    img.onerror = (err) => {
      console.error('❌ Failed to load background image:', err);
      setBgImage(null);
    };
    img.crossOrigin = 'anonymous';
    img.src = backgroundImage;
  }, [backgroundImage]);

  // Step 2: Responsive canvas sizing based on viewport
  useEffect(() => {
    const updateDimensions = () => {
      // Use window dimensions directly for more reliable sizing
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate available space - FULLSCREEN!
      const maxWidth = isMobile
        ? viewportWidth  // Mobile: FULL WIDTH
        : viewportWidth; // Desktop: FULL WIDTH

      const maxHeight = isMobile
        ? viewportHeight - 100 // Mobile: just tiny space for stealth bar
        : viewportHeight - 100; // Desktop: just tiny space for stealth bar

      let width = bgImage?.width ?? 1200;
      let height = bgImage?.height ?? 900;

      // Scale to fit maintaining aspect ratio
      const aspectRatio = width / height;
      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      const finalWidth = Math.floor(width);
      const finalHeight = Math.floor(height);

      console.log('Canvas dimensions:', {
        viewport: { width: viewportWidth, height: viewportHeight },
        max: { width: maxWidth, height: maxHeight },
        final: { width: finalWidth, height: finalHeight },
        isMobile
      });

      setDimensions({ width: finalWidth, height: finalHeight });

      // Set drawing canvas resolution
      if (canvasRef.current) {
        canvasRef.current.width = finalWidth;
        canvasRef.current.height = finalHeight;
      }

      // Set background canvas resolution and draw the image
      const bgCanvas = backgroundCanvasRef.current;
      if (bgCanvas) {
        bgCanvas.width = finalWidth;
        bgCanvas.height = finalHeight;
        const ctx = bgCanvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, finalWidth, finalHeight);
          if (bgImage) {
            console.log('✍️ Drawing background image to canvas');
            ctx.drawImage(bgImage, 0, 0, finalWidth, finalHeight);
          } else {
            // Fallback to dark background if image failed
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, finalWidth, finalHeight);
          }
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [bgImage, isMobile]);

  // Stealth Drain System - FASTER drain for more excitement
  // Easy (0.3): ~3-5 minutes
  // Medium (0.5): ~2-3 minutes
  // Hard (0.7): ~1-2 minutes
  // Extreme (1.0): ~30-60 seconds
  useEffect(() => {
    if (!isPainting) return;

    const drainInterval = setInterval(() => {
      // FASTER drain rates - more challenging!
      // Normal base drain when drawing: 0.03 per 100ms = 0.3 per second = 18 per minute
      // Normal base drain when idle: 0.015 per 100ms = 0.15 per second = 9 per minute
      // IF PEDESTRIAN NEARBY: 0.06 per 100ms = 0.6 per second = 36 per minute (very fast!)
      let baseDrainRate = isDrawing ? 0.03 : 0.015;

      // If pedestrian spotted you, drain MUCH faster!
      if (isPedestrianNearby) {
        baseDrainRate = 0.06; // 2x faster when spotted!
      }

      const drainRate = baseDrainRate * difficultyMultiplier;

      setStealth(prev => {
        const newStealth = Math.max(0, prev - drainRate);

        // Police only arrives at 0%, not at 20%
        if (newStealth === 0) {
          handlePoliceArrival();
        }

        return newStealth;
      });

      // Note: Look Around button now sets stealth to 100 directly
      // No need to check isLookingAround here

      // Check if player hasn't looked around in a while
      const timeSinceLastLook = Date.now() - lastLookTime;
      if (timeSinceLastLook > 20000 && Math.random() < 0.08) { // Every 20 seconds, 8% chance
        showRandomPedestrianWarning();
      }
    }, 100);

    return () => clearInterval(drainInterval);
  }, [isPainting, isDrawing, isLookingAround, lastLookTime, difficultyMultiplier, isPedestrianNearby]);

  const showRandomPedestrianWarning = () => {
    const warnings = [
      '⚠️ Passant nähert sich!',
      '👤 Fußgänger in der Nähe!',
      '🚶 Jemand kommt!',
      '👀 Du wirst beobachtet!',
      '🔊 Schritte zu hören!',
    ];
    setPedestrianWarningText(warnings[Math.floor(Math.random() * warnings.length)]);
    setShowPedestrianWarning(true);
    setIsPedestrianNearby(true); // Pedestrian spotted - stealth drains faster!

    // Pedestrian stays for 5-8 seconds, then leaves
    const pedestrianDuration = 5000 + Math.random() * 3000;
    setTimeout(() => {
      setShowPedestrianWarning(false);
      setIsPedestrianNearby(false); // Pedestrian gone - back to slow drain
    }, pedestrianDuration);
  };

  const handlePoliceArrival = () => {
    setIsPainting(false);
    setShowPoliceQTE(true);
    playPoliceEffects();

    // Generate QTE targets - mobile optimized positioning
    const targets = [];
    const isMobileDevice = window.innerWidth < 768;
    const margin = isMobileDevice ? 15 : 10; // More margin on mobile
    const maxPosition = 100 - margin * 2;

    for (let i = 0; i < 2; i++) {
      targets.push({
        x: Math.random() * maxPosition + margin, // Avoid edges
        y: Math.random() * maxPosition + margin,
        active: i === 0, // First one active
      });
    }
    setQteTargets(targets);
    setQteSuccess(0);
    setQteRequired(10);
  };

  const playPoliceEffects = () => {
    // Siren sound (placeholder - you can add actual audio)
    toast.error('🚨 POLIZEI! 🚨', {
      description: 'Tippe schnell die Punkte ab!',
      duration: 3000,
    });

    // Blue light flashing
    let flashes = 0;
    const flashInterval = setInterval(() => {
      setShowBlueLight(prev => !prev);
      flashes++;
      if (flashes > 10) {
        clearInterval(flashInterval);
        setShowBlueLight(false);
      }
    }, 200);
  };

  const handleQTETarget = (index: number) => {
    if (!qteTargets[index].active) return;

    const newSuccess = qteSuccess + 1;
    setQteSuccess(newSuccess);

    // Activate next target
    const newTargets = [...qteTargets];
    newTargets[index].active = false;
    if (index < newTargets.length - 1) {
      newTargets[index + 1].active = true;
    }
    setQteTargets(newTargets);

    if (newSuccess >= qteRequired) {
      // Escaped!
      handleQTESuccess();
    }
  };

  const handleQTESuccess = () => {
    setShowPoliceQTE(false);
    setIsPainting(true);
    setStealth(50);
    toast.success('✅ Entkommen!', {
      description: 'Du bist der Polizei entkommen!',
    });
  };

  const handleQTEFailure = () => {
    const newTimesArrested = timesArrested + 1;
    setTimesArrested(newTimesArrested);
    setShowPoliceQTE(false);

    if (newTimesArrested >= 3) {
      // Prison!
      toast.error('🚔 GEFÄNGNIS!', {
        description: '3x erwischt! Du kommst für 24h ins Gefängnis!',
        duration: 5000,
      });
      // Here you would save to localStorage/backend
      localStorage.setItem('prisonUntil', String(Date.now() + 24 * 60 * 60 * 1000));
      onBusted();
    } else {
      // Pay fine
      const fine = 500 * newTimesArrested;
      toast.error(`💸 Erwischt! Strafe: ${fine}$`, {
        description: `${3 - newTimesArrested} Chancen übrig bis Gefängnis!`,
      });
      setIsPainting(true);
      setStealth(50);
    }
  };

  // QTE Timer
  useEffect(() => {
    if (!showPoliceQTE) return;

    const timer = setTimeout(() => {
      if (qteSuccess < qteRequired) {
        handleQTEFailure();
      }
    }, 5000); // 5 seconds to complete QTE

    return () => clearTimeout(timer);
  }, [showPoliceQTE, qteSuccess]);

  // Gaussian random for spray
  const gaussianRandom = () => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    console.log('redrawCanvas');

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach(stroke => {
      drawStroke(ctx, stroke);
    });

    if (currentStroke && isDrawing) {
      drawStroke(ctx, currentStroke);
    }
  }, [strokes, currentStroke, isDrawing]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: BrushStroke) => {
    if (stroke.points.length < 1) return;

    ctx.save();

    if (stroke.brushType === 'spray') {
      const sprayRadius = stroke.size;
      const particlesPerPoint = Math.floor(stroke.size * density * 3);
      const centerWeight = 0.7;

      stroke.points.forEach((point, i) => {
        const spacing = i > 0 ?
          Math.sqrt(
            Math.pow(point.x - stroke.points[i-1].x, 2) +
            Math.pow(point.y - stroke.points[i-1].y, 2)
          ) : 0;

        const interpolationSteps = Math.max(1, Math.floor(spacing / 2));

        for (let step = 0; step < interpolationSteps; step++) {
          const t = step / interpolationSteps;
          const interpX = i > 0 ?
            stroke.points[i-1].x + (point.x - stroke.points[i-1].x) * t : point.x;
          const interpY = i > 0 ?
            stroke.points[i-1].y + (point.y - stroke.points[i-1].y) * t : point.y;

          for (let j = 0; j < particlesPerPoint; j++) {
            const angle = Math.random() * Math.PI * 2;
            const gaussianDist = Math.abs(gaussianRandom()) * 0.5;
            const distance = gaussianDist * sprayRadius;

            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;

            const distanceRatio = distance / sprayRadius;
            const particleOpacity = stroke.opacity * flow *
              (1 - distanceRatio * (1 - centerWeight)) * 0.15;

            ctx.globalAlpha = particleOpacity;
            ctx.fillStyle = stroke.color;

            const particleSize = (0.8 + Math.random() * 0.4) * (stroke.size / 15);

            ctx.beginPath();
            ctx.arc(interpX + offsetX, interpY + offsetY, particleSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
    } else if (stroke.brushType === 'marker') {
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
      ctx.globalAlpha = stroke.opacity * 0.6;
      ctx.strokeStyle = stroke.color;
      ctx.fillStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length - 1; i++) {
        const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
        const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
      }
      ctx.stroke();
    }

    ctx.restore();
  };

  const getTouchPoint = (touch: Touch) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width / zoom;
    const scaleY = canvas.height / rect.height / zoom;
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  };

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width / zoom;
    const scaleY = canvas.height / rect.height / zoom;

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

    console.log('startDrawing');

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
    if (!isDrawing || !currentStroke || !isPainting) return;

    console.log('draw');

    const point = getCanvasPoint(e);
    if (!point) return;

    setCurrentStroke(prev => prev ? {
      ...prev,
      points: [...prev.points, point],
    } : null);
  };

  const stopDrawing = () => {
    if (!currentStroke) return;

    console.log('stopDrawing');

    if (isDrawing && currentStroke.points.length > 0) {
      setStrokes(prev => [...prev, currentStroke]);
    }

    setIsDrawing(false);
    setCurrentStroke(null);
  };

  // Touch-specific handlers with preventDefault
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isPainting || e.touches.length === 0) return;

    const touch = e.touches[0];
    const point = getTouchPoint(touch);

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

    // Haptic feedback on touch devices
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !currentStroke || !isPainting || e.touches.length === 0) return;

    const touch = e.touches[0];
    const point = getTouchPoint(touch);

    setCurrentStroke(prev => prev ? {
      ...prev,
      points: [...prev.points, point],
    } : null);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    stopDrawing();
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const lastStroke = strokes[strokes.length - 1];
    setStrokes(prev => prev.slice(0, -1));
    setUndoneStrokes(prev => [...prev, lastStroke]);
  };

  const handleRedo = () => {
    if (undoneStrokes.length === 0) return;
    const strokeToRedo = undoneStrokes[undoneStrokes.length - 1];
    setStrokes(prev => [...prev, strokeToRedo]);
    setUndoneStrokes(prev => prev.slice(0, -1));
  };

  const handleComplete = () => {
    const canvas = canvasRef.current;
    const bgCanvas = backgroundCanvasRef.current;
    if (!canvas || !bgCanvas) return;

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx) return;

    finalCtx.drawImage(bgCanvas, 0, 0);
    finalCtx.drawImage(canvas, 0, 0);

    const imageData = finalCanvas.toDataURL('image/png');
    const quality = Math.min(100, strokes.length * 5);

    // Store image data and show save dialog
    setFinalImageData(imageData);
    setShowSaveDialog(true);
  };

  const handleSaveToGallery = (saveToGallery: boolean) => {
    const quality = Math.min(100, strokes.length * 5);
    setShowSaveDialog(false);
    onComplete(quality, finalImageData, saveToGallery); // Pass saveToGallery flag
  };

  const handleCancelAttempt = () => {
    if (strokes.length > 0) {
      // Show confirmation dialog if user has painted something
      setShowExitConfirmDialog(true);
    } else {
      // Directly cancel if no work done
      onCancel();
    }
  };

  const confirmCancel = () => {
    setShowExitConfirmDialog(false);
    onCancel();
    toast.info('Malvorgang abgebrochen');
  };

  const handleStartPainting = () => {
    setShowStartScreen(false);
    setCountdown(3);

    // Countdown: 3, 2, 1, GO!
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          setCountdown(null);
          setIsPainting(true); // Start painting after countdown
          toast.success('Los geht\'s!', { duration: 1500 });
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Toolbar Content Component (reusable for desktop sidebar and mobile sheet)
  const ToolbarContent = () => (
    <>
      {/* Top Actions */}
      <div className={`flex gap-2 ${isMobile ? 'flex-row' : ''}`}>
        <Button onClick={handleUndo} disabled={strokes.length === 0} size={isMobile ? 'default' : 'sm'} variant="outline" className="flex-1 bg-black/60 min-h-[44px]">
          <Undo className="w-4 h-4" />
        </Button>
        <Button onClick={handleRedo} disabled={undoneStrokes.length === 0} size={isMobile ? 'default' : 'sm'} variant="outline" className="flex-1 bg-black/60 min-h-[44px]">
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      <div className={`flex gap-2 ${isMobile ? 'flex-row' : ''}`}>
        <Button onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))} size={isMobile ? 'default' : 'sm'} variant="outline" className="flex-1 bg-black/60 min-h-[44px]">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-sm text-white self-center px-2">{Math.round(zoom * 100)}%</span>
        <Button onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))} size={isMobile ? 'default' : 'sm'} variant="outline" className="flex-1 bg-black/60 min-h-[44px]">
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      {/* Brush Types */}
      <div className="space-y-2">
        <span className="text-xs text-white/70 uppercase">Brush</span>
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => setBrushType('spray')}
            variant={brushType === 'spray' ? 'default' : 'outline'}
            size={isMobile ? 'default' : 'sm'}
            className="bg-black/60 min-h-[44px]"
          >
            <SprayCan className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setBrushType('brush')}
            variant={brushType === 'brush' ? 'default' : 'outline'}
            size={isMobile ? 'default' : 'sm'}
            className="bg-black/60 min-h-[44px]"
          >
            <Paintbrush className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setBrushType('marker')}
            variant={brushType === 'marker' ? 'default' : 'outline'}
            size={isMobile ? 'default' : 'sm'}
            className="bg-black/60 min-h-[44px]"
          >
            <Circle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-2">
        <span className="text-xs text-white/70 uppercase">Colors</span>
        <div className={`${isMobile ? 'flex gap-2 overflow-x-auto pb-2' : 'grid grid-cols-5 gap-2'}`}>
          {COLORS.map(color => (
            <button
              key={color.id}
              type="button"
              onClick={() => setSelectedColor(color.value)}
              className={`${isMobile ? 'min-w-[44px] w-11 h-11' : 'w-10 h-10'} rounded-full border-4 transition-all cursor-pointer hover:scale-110 ${
                selectedColor === color.value ? 'border-white ring-2 ring-primary' : 'border-gray-600'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-white/70">Size</span>
            <span className="text-xs text-white">{brushSize}px</span>
          </div>
          <Slider value={[brushSize]} onValueChange={([v]) => setBrushSize(v)} min={5} max={50} step={1} />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-white/70">Opacity</span>
            <span className="text-xs text-white">{Math.round(opacity * 100)}%</span>
          </div>
          <Slider value={[opacity * 100]} onValueChange={([v]) => setOpacity(v / 100)} min={10} max={100} step={10} />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-white/70">Flow</span>
            <span className="text-xs text-white">{Math.round(flow * 100)}%</span>
          </div>
          <Slider value={[flow * 100]} onValueChange={([v]) => setFlow(v / 100)} min={10} max={100} step={10} />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-white/70">Density</span>
            <span className="text-xs text-white">{Math.round(density * 100)}%</span>
          </div>
          <Slider value={[density * 100]} onValueChange={([v]) => setDensity(v / 100)} min={30} max={100} step={10} />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-2 pt-4 border-t border-white/10">
        <Button onClick={handleComplete} className="w-full bg-green-600 hover:bg-green-700 gap-2 min-h-[44px]">
          <Check className="w-4 h-4" />
          Fertig
        </Button>
        <Button onClick={handleCancelAttempt} variant="destructive" className="w-full gap-2 min-h-[44px]">
          <X className="w-4 h-4" />
          Abbrechen
        </Button>
      </div>
    </>
  );

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-[98vw] max-h-[98vh] p-0 overflow-hidden bg-transparent border-none">
        <div className="relative w-full h-[98vh] flex">
          {/* Start Screen - Small Centered Window */}
          {showStartScreen && (
            <div className="absolute inset-0 bg-black/30 z-[200] flex items-center justify-center">
              <div className="text-center space-y-4 p-6 bg-gray-900/95 rounded-2xl border-2 border-primary shadow-2xl shadow-primary/50 max-w-md">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black uppercase text-white">
                    Bereit?
                  </h2>
                  <p className="text-lg text-white/80">
                    Difficulty: <span className={`font-black ${
                      difficulty === 'easy' ? 'text-green-500' :
                      difficulty === 'medium' ? 'text-cyan-500' :
                      difficulty === 'hard' ? 'text-orange-500' :
                      'text-red-500'
                    }`}>{difficulty.toUpperCase()}</span>
                  </p>
                  {backgroundImage && (
                    <p className="text-green-400 text-xs">✅ Screenshot geladen</p>
                  )}
                </div>
                <Button
                  onClick={handleStartPainting}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-neon-cyan text-white text-xl font-black px-8 py-6 h-auto rounded-xl shadow-2xl shadow-primary/50 hover:shadow-primary/80 hover:scale-105 transition-all w-full"
                >
                  <SprayCan className="w-6 h-6 mr-3" />
                  SPOT STARTEN!
                </Button>
                <p className="text-white/50 text-xs">
                  Zeit: ~{
                    difficulty === 'easy' ? '15-20' :
                    difficulty === 'medium' ? '10-15' :
                    difficulty === 'hard' ? '5-10' :
                    '3-5'
                  } Min
                </p>
              </div>
            </div>
          )}

          {/* Countdown Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center">
              <div className="text-center">
                <div className="text-[20rem] font-black text-primary animate-pulse">
                  {countdown}
                </div>
              </div>
            </div>
          )}

          {/* Blue Light Flash */}
          {showBlueLight && (
            <div className="absolute inset-0 bg-blue-600 opacity-30 z-50 pointer-events-none animate-pulse" />
          )}

          {/* Main Canvas Area */}
          <div ref={containerRef} className="flex-1 relative bg-gray-950">
            {/* Compact Stealth Bar - Top */}
            <div className="absolute top-0 left-0 right-0 z-30">
              <div className={`bg-black/80 backdrop-blur-md px-3 py-1.5 border-b ${
                stealth <= 20 ? 'border-red-500 animate-pulse' : 'border-white/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase">Stealth</span>
                  <span className={`text-xs font-bold ${
                    stealth <= 20 ? 'text-red-500 animate-pulse' : 'text-white'
                  }`}>{Math.round(stealth)}%</span>
                </div>
                <Progress
                  value={stealth}
                  className="h-2"
                  indicatorClassName={
                    stealth > 50 ? 'bg-green-500' :
                    stealth > 20 ? 'bg-yellow-500' :
                    'bg-red-500 animate-pulse'
                  }
                />
                {stealth <= 50 && stealth > 20 && (
                  <div className="mt-2 text-xs text-yellow-500 font-bold text-center">
                    ⚠️ Du solltest dich öfter umschauen!
                  </div>
                )}
                {stealth <= 20 && stealth > 0 && (
                  <div className="mt-2 text-xs text-red-500 font-bold text-center animate-pulse">
                    🚨 KRITISCH! Polizei ist unterwegs!
                  </div>
                )}
              </div>
            </div>

            {/* Look Around Button - Compact in top bar */}
            <div className="absolute top-2 right-2 z-40">
              <Button
                onMouseDown={() => { setIsLookingAround(true); setStealth(100); }}
                onMouseUp={() => setIsLookingAround(false)}
                onMouseLeave={() => setIsLookingAround(false)}
                onTouchStart={(e) => { e.preventDefault(); setIsLookingAround(true); setStealth(100); }}
                onTouchEnd={(e) => { e.preventDefault(); setIsLookingAround(false); }}
                className={`${isLookingAround ? 'bg-green-600' : 'bg-black/80 backdrop-blur-md'} border border-white/20 min-h-[40px] min-w-[40px] p-2`}
                size="sm"
              >
                {isLookingAround ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>

            {/* Pedestrian Warning */}
            {showPedestrianWarning && (
              <div className={`absolute ${isMobile ? 'top-20 left-2 right-2' : 'top-24 left-1/2 transform -translate-x-1/2'} z-40`}>
                <div className="bg-orange-600/90 backdrop-blur-md p-4 rounded-lg border-2 border-orange-400 animate-pulse">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-white" />
                    <span className="text-white font-bold">{pedestrianWarningText}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Canvas */}
            <div
              className={`w-full h-full flex items-center justify-center ${isMobile ? 'pb-4' : ''}`}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center',
              }}
            >
              <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center">
              <div className="relative" style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px`, maxWidth: '100%', maxHeight: '100%' }}>
                <canvas
                  ref={backgroundCanvasRef}
                  className="absolute top-0 left-0"
                  style={{ pointerEvents: 'none', zIndex: 1 }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 cursor-crosshair w-full h-full touch-none"
                  style={{ zIndex: 2, touchAction: 'none' }}
                  onMouseDown={(e) => { e.preventDefault(); startDrawing(e); }}
                  onMouseMove={(e) => { e.preventDefault(); draw(e); }}
                  onMouseUp={(e) => { e.preventDefault(); stopDrawing(); }}
                  onMouseLeave={(e) => { e.preventDefault(); if (isDrawing) stopDrawing(); }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
              </div>
              </div>
            </div>

            {/* Mobile: Toolbar Toggle Button with Pulsing Animation */}
            {isMobile && (
              <div className="absolute bottom-4 right-4 z-30">
                <Button
                  onClick={() => {
                    setShowToolbar(true);
                    localStorage.setItem('toolbarOpened', 'true');
                  }}
                  className={`bg-primary hover:bg-primary/90 gap-2 min-h-[56px] min-w-[56px] rounded-full shadow-lg ${
                    !localStorage.getItem('toolbarOpened') ? 'animate-pulse shadow-[0_0_20px_rgba(236,72,153,0.6)]' : ''
                  }`}
                  size="lg"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </div>
            )}
          </div>

          {/* Desktop Side Toolbar */}
          {!isMobile && (
            <div className="w-80 bg-black/40 backdrop-blur-xl border-l border-white/10 p-4 space-y-4 overflow-y-auto">
              <ToolbarContent />
            </div>
          )}

          {/* Mobile Toolbar Sheet */}
          {isMobile && (
            <Sheet open={showToolbar} onOpenChange={setShowToolbar}>
              <SheetContent
                side="bottom"
                className="bg-black/95 backdrop-blur-xl border-t border-white/10 p-4 space-y-4 max-h-[80vh] overflow-y-auto"
              >
                <ToolbarContent />
              </SheetContent>
            </Sheet>
          )}

          {/* Exit Confirmation Dialog */}
          {showExitConfirmDialog && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center">
              <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg p-8 max-w-md mx-4 space-y-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <AlertTriangle className="w-16 h-16 text-yellow-500" />
                  </div>
                  <h2 className="text-2xl font-black uppercase text-white">
                    Ohne Speichern verlassen?
                  </h2>
                  <p className="text-white/80">
                    Sind Sie sich sicher, dass Sie verlassen wollen ohne zu speichern?
                  </p>
                  <p className="text-destructive font-bold">
                    Ihr gesamter Fortschritt geht verloren!
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowExitConfirmDialog(false)}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <X className="w-4 h-4" />
                    Zurück
                  </Button>
                  <Button
                    onClick={confirmCancel}
                    variant="destructive"
                    className="flex-1 gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Ja, verlassen
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Save to Gallery Dialog */}
          {showSaveDialog && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-4 border-primary rounded-2xl p-8 max-w-lg mx-4 space-y-6 shadow-2xl shadow-primary/50">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <SprayCan className="w-20 h-20 text-primary animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-black uppercase text-white">
                    Piece Fertig!
                  </h2>
                  <p className="text-xl text-white/90 font-bold">
                    {spotName}
                  </p>
                  <p className="text-lg text-white/80">
                    Willst du dieses Piece in der Gallerie speichern?
                  </p>
                  <div className="bg-gray-950/50 p-4 rounded-lg border border-primary/30">
                    <p className="text-sm text-white/70">
                      💡 In der Gallerie kannst du all deine Kunstwerke jederzeit ansehen!
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleSaveToGallery(false)}
                    variant="outline"
                    className="flex-1 gap-2 text-base py-6"
                  >
                    <X className="w-5 h-5" />
                    Nein, danke
                  </Button>
                  <Button
                    onClick={() => handleSaveToGallery(true)}
                    className="flex-1 gap-2 bg-gradient-to-r from-primary to-neon-cyan text-white text-base py-6 shadow-lg shadow-primary/50 hover:shadow-primary/80"
                  >
                    <Check className="w-5 h-5" />
                    Ja, speichern!
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Police QTE Overlay */}
          {showPoliceQTE && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="text-center space-y-6 w-full max-w-2xl">
                <div className={`${isMobile ? 'text-4xl' : 'text-6xl'} font-black text-red-600 animate-pulse`}>
                  🚨 POLIZEI! 🚨
                </div>
                <div className={`${isMobile ? 'text-xl' : 'text-2xl'} text-white font-bold`}>
                  Tippe schnell die Punkte ab!
                </div>
                <div className="text-lg text-white">
                  {qteSuccess} / {qteRequired}
                </div>

                {/* QTE Targets */}
                <div className={`relative ${isMobile ? 'w-full h-[300px]' : 'w-[600px] h-[400px]'} bg-gray-900/50 rounded-lg mx-auto`}>
                  {qteTargets.map((target, index) => (
                    <button
                      key={index}
                      onClick={() => handleQTETarget(index)}
                      onTouchStart={(e) => { e.preventDefault(); handleQTETarget(index); }}
                      disabled={!target.active}
                      className={`absolute ${isMobile ? 'w-16 h-16 min-w-[60px] min-h-[60px]' : 'w-20 h-20'} rounded-full ${
                        target.active
                          ? 'bg-red-600 animate-ping cursor-pointer'
                          : 'bg-gray-600 opacity-50'
                      }`}
                      style={{
                        left: `${target.x}%`,
                        top: `${target.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      {target.active && (
                        <UserX className="w-full h-full text-white p-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
