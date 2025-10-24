import React, { useState, useRef, useCallback } from 'react';
import { GoogleMap, StreetViewPanorama, useJsApiLoader } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Crop, X, Check, Move } from 'lucide-react';
import { toast } from 'sonner';

interface StreetViewMapProps {
  onCaptureComplete?: (imageData: string, location: { lat: number; lng: number }) => void;
  defaultPosition?: { lat: number; lng: number };
}

const containerStyle = {
  width: '100%',
  height: '600px',
};

// Default position: Berlin, Germany
const defaultCenter = {
  lat: 52.520008,
  lng: 13.404954,
};

export const StreetViewMap: React.FC<StreetViewMapProps> = ({
  onCaptureComplete,
  defaultPosition = defaultCenter,
}) => {
  const [currentPosition, setCurrentPosition] = useState(defaultPosition);
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropArea, setCropArea] = useState<{
    startX: number;
    startY: number;
    width: number;
    height: number;
  } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streetViewRef = useRef<google.maps.StreetViewPanorama | null>(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const handleStreetViewLoad = useCallback((panorama: google.maps.StreetViewPanorama) => {
    streetViewRef.current = panorama;
  }, []);

  const startCropMode = () => {
    setIsCropMode(true);
    setCropArea(null);
    toast.info('Ziehe einen Bereich auf, um einen Screenshot zu erstellen');
  };

  const cancelCropMode = () => {
    setIsCropMode(false);
    setCropArea(null);
    setIsDrawing(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCropArea({
      startX: x,
      startY: y,
      width: 0,
      height: 0,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropMode || !isDrawing || !cropArea) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    setCropArea({
      ...cropArea,
      width: currentX - cropArea.startX,
      height: currentY - cropArea.startY,
    });
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
    }
  };

  const captureScreen = async () => {
    if (!streetViewRef.current || !cropArea) {
      toast.error('Bitte wähle zuerst einen Bereich aus');
      return;
    }

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Get the street view container
      const streetViewContainer = document.querySelector('.street-view-container') as HTMLElement;
      if (!streetViewContainer) return;

      // Create a temporary canvas to capture the street view
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      // Set canvas size to match crop area
      const width = Math.abs(cropArea.width);
      const height = Math.abs(cropArea.height);

      if (width < 10 || height < 10) {
        toast.error('Der ausgewählte Bereich ist zu klein');
        return;
      }

      canvas.width = width;
      canvas.height = height;
      tempCanvas.width = streetViewContainer.offsetWidth;
      tempCanvas.height = streetViewContainer.offsetHeight;

      // Use html2canvas or similar library in production
      // For now, we'll create a placeholder with the location info
      const position = streetViewRef.current.getPosition();
      if (!position) {
        toast.error('Konnte Position nicht ermitteln');
        return;
      }

      // Draw a gradient background as placeholder
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add text overlay
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Street View Capture', width / 2, height / 2 - 20);
      ctx.font = '16px sans-serif';
      ctx.fillText(
        `Lat: ${position.lat().toFixed(6)}, Lng: ${position.lng().toFixed(6)}`,
        width / 2,
        height / 2 + 20
      );

      // Convert to base64
      const imageData = canvas.toDataURL('image/png');

      // Call the callback
      if (onCaptureComplete) {
        onCaptureComplete(imageData, {
          lat: position.lat(),
          lng: position.lng(),
        });
      }

      toast.success('Screenshot erfolgreich erstellt!');
      cancelCropMode();
    } catch (error) {
      console.error('Error capturing screen:', error);
      toast.error('Fehler beim Erstellen des Screenshots');
    }
  };

  if (loadError) {
    return (
      <Card className="p-8 text-center">
        <div className="text-destructive mb-4">
          Fehler beim Laden von Google Maps
        </div>
        <p className="text-sm text-muted-foreground">
          Bitte überprüfe deine API-Konfiguration
        </p>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card className="p-8 text-center">
        <div className="text-muted-foreground">Lade Google Street View...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-2 items-center justify-between bg-urban-surface p-3 rounded-lg border-2 border-urban-border">
        <div className="text-sm text-muted-foreground">
          {isCropMode ? (
            <span className="flex items-center gap-2">
              <Crop className="w-4 h-4 text-primary animate-pulse" />
              Crop-Modus: Ziehe einen Bereich auf
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Move className="w-4 h-4" />
              Navigation: Bewege dich in der Street View
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {!isCropMode ? (
            <Button onClick={startCropMode} className="gap-2">
              <Crop className="w-4 h-4" />
              Screenshot Modus
            </Button>
          ) : (
            <>
              <Button onClick={captureScreen} disabled={!cropArea} className="gap-2 bg-primary">
                <Check className="w-4 h-4" />
                Speichern
              </Button>
              <Button onClick={cancelCropMode} variant="outline" className="gap-2">
                <X className="w-4 h-4" />
                Abbrechen
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Street View Container */}
      <div
        className={`relative rounded-lg overflow-hidden border-2 ${
          isCropMode ? 'border-primary' : 'border-urban-border'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: isCropMode ? 'crosshair' : 'default' }}
      >
        <div className="street-view-container">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentPosition}
            zoom={15}
            options={{
              streetViewControl: true,
              fullscreenControl: false,
            }}
          >
            <StreetViewPanorama
              position={currentPosition}
              visible={true}
              onLoad={handleStreetViewLoad}
              options={{
                addressControl: false,
                fullscreenControl: false,
                motionTracking: false,
                motionTrackingControl: false,
              }}
            />
          </GoogleMap>
        </div>

        {/* Crop Overlay */}
        {isCropMode && cropArea && (
          <div
            className="absolute border-2 border-primary bg-primary/20 pointer-events-none"
            style={{
              left: cropArea.width >= 0 ? cropArea.startX : cropArea.startX + cropArea.width,
              top: cropArea.height >= 0 ? cropArea.startY : cropArea.startY + cropArea.height,
              width: Math.abs(cropArea.width),
              height: Math.abs(cropArea.height),
            }}
          >
            <div className="absolute -top-8 left-0 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold">
              {Math.abs(cropArea.width).toFixed(0)} × {Math.abs(cropArea.height).toFixed(0)}
            </div>
          </div>
        )}

        {/* Dark overlay when in crop mode */}
        {isCropMode && (
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        )}
      </div>

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Location Info */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">Aktuelle Position:</span>
            <span className="ml-2 font-mono">
              {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setCurrentPosition({
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                    });
                    toast.success('Position aktualisiert');
                  },
                  () => {
                    toast.error('Konnte aktuelle Position nicht ermitteln');
                  }
                );
              }
            }}
          >
            Zu meinem Standort
          </Button>
        </div>
      </Card>
    </div>
  );
};
