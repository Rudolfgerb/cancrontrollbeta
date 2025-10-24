import React, { useState, useRef, useCallback } from 'react';
import { GoogleMap, StreetViewPanorama, useJsApiLoader } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Crop, X, Check, Move, Download } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface ImprovedStreetViewMapProps {
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

export const ImprovedStreetViewMap: React.FC<ImprovedStreetViewMapProps> = ({
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
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const streetViewContainerRef = useRef<HTMLDivElement>(null);
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
    toast.info('Ziehe einen Bereich auf, um einen Screenshot zu erstellen', {
      description: 'Wähle den Bereich durch Ziehen mit der Maus aus',
    });
  };

  const cancelCropMode = () => {
    setIsCropMode(false);
    setCropArea(null);
    setIsDrawing(false);
    setCapturedImage(null);
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

  const captureFullScreen = async () => {
    if (!streetViewContainerRef.current || !streetViewRef.current) {
      toast.error('Street View ist nicht geladen');
      return;
    }

    try {
      toast.loading('Screenshot wird erstellt...', { id: 'capture' });

      // Wait a bit for Street View to fully render
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(streetViewContainerRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        scale: 2, // Higher quality
        logging: false,
        foreignObjectRendering: true,
        imageTimeout: 0,
      });

      const imageData = canvas.toDataURL('image/png');

      if (!imageData || imageData === 'data:,') {
        throw new Error('Screenshot ist leer');
      }

      const position = streetViewRef.current.getPosition();
      if (!position) {
        throw new Error('Konnte Position nicht ermitteln');
      }

      setCapturedImage(imageData);

      if (onCaptureComplete) {
        onCaptureComplete(imageData, {
          lat: position.lat(),
          lng: position.lng(),
        });
      }

      toast.success('Screenshot erfolgreich erstellt!', { id: 'capture' });
    } catch (error) {
      console.error('Error capturing screen:', error);
      toast.error('Fehler beim Erstellen des Screenshots', { id: 'capture' });
    }
  };

  const captureCroppedScreen = async () => {
    if (!streetViewContainerRef.current || !cropArea || !streetViewRef.current) {
      toast.error('Bitte wähle zuerst einen Bereich aus');
      return;
    }

    try {
      const width = Math.abs(cropArea.width);
      const height = Math.abs(cropArea.height);

      if (width < 50 || height < 50) {
        toast.error('Der ausgewählte Bereich ist zu klein (min. 50x50px)');
        return;
      }

      toast.loading('Screenshot wird erstellt...', { id: 'capture' });

      // Wait for Street View to render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture full container first
      const fullCanvas = await html2canvas(streetViewContainerRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        scale: 2,
        logging: false,
        foreignObjectRendering: true,
        imageTimeout: 0,
      });

      // Create cropped canvas
      const croppedCanvas = document.createElement('canvas');
      const ctx = croppedCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set cropped canvas size
      croppedCanvas.width = width * 2; // Account for scale
      croppedCanvas.height = height * 2;

      // Calculate crop area (account for scale and negative dimensions)
      const startX = cropArea.width >= 0 ? cropArea.startX : cropArea.startX + cropArea.width;
      const startY = cropArea.height >= 0 ? cropArea.startY : cropArea.startY + cropArea.height;

      // Draw cropped portion
      ctx.drawImage(
        fullCanvas,
        startX * 2, // Source X (scaled)
        startY * 2, // Source Y (scaled)
        width * 2, // Source Width (scaled)
        height * 2, // Source Height (scaled)
        0, // Dest X
        0, // Dest Y
        width * 2, // Dest Width
        height * 2  // Dest Height
      );

      const imageData = croppedCanvas.toDataURL('image/png');

      if (!imageData || imageData === 'data:,') {
        throw new Error('Screenshot ist leer');
      }

      const position = streetViewRef.current.getPosition();
      if (!position) {
        throw new Error('Konnte Position nicht ermitteln');
      }

      setCapturedImage(imageData);

      if (onCaptureComplete) {
        onCaptureComplete(imageData, {
          lat: position.lat(),
          lng: position.lng(),
        });
      }

      toast.success('Screenshot erfolgreich erstellt!', { id: 'capture' });
      cancelCropMode();
    } catch (error) {
      console.error('Error capturing cropped screen:', error);
      toast.error('Fehler beim Erstellen des Screenshots', { id: 'capture' });
    }
  };

  const downloadImage = () => {
    if (!capturedImage) return;

    const link = document.createElement('a');
    link.download = `graffiti-spot-${Date.now()}.png`;
    link.href = capturedImage;
    link.click();
    toast.success('Bild heruntergeladen!');
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
      <div className="flex gap-2 items-center justify-between bg-gradient-to-r from-urban-surface to-gray-900 p-4 rounded-lg border-2 border-urban-border shadow-lg">
        <div className="text-sm text-muted-foreground">
          {isCropMode ? (
            <span className="flex items-center gap-2">
              <Crop className="w-4 h-4 text-primary animate-pulse" />
              <span className="font-bold text-primary">Crop-Modus:</span> Ziehe einen Bereich auf
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Move className="w-4 h-4 text-neon-cyan" />
              <span className="font-bold text-neon-cyan">Navigation:</span> Bewege dich in der Street View
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {!isCropMode ? (
            <>
              <Button onClick={captureFullScreen} className="gap-2 bg-gradient-to-r from-neon-cyan to-primary hover:shadow-neon">
                <Camera className="w-4 h-4" />
                Vollbild Screenshot
              </Button>
              <Button onClick={startCropMode} variant="outline" className="gap-2 border-primary/50 hover:bg-primary/10">
                <Crop className="w-4 h-4" />
                Bereich wählen
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={captureCroppedScreen}
                disabled={!cropArea || Math.abs(cropArea.width) < 50 || Math.abs(cropArea.height) < 50}
                className="gap-2 bg-gradient-to-r from-neon-lime to-neon-cyan text-black hover:shadow-neon"
              >
                <Check className="w-4 h-4" />
                Screenshot erstellen
              </Button>
              <Button onClick={cancelCropMode} variant="outline" className="gap-2 border-destructive/50 hover:bg-destructive/10">
                <X className="w-4 h-4" />
                Abbrechen
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Street View Container */}
      <div
        ref={streetViewContainerRef}
        className={`relative rounded-lg overflow-hidden border-4 transition-all ${
          isCropMode ? 'border-primary shadow-neon' : 'border-urban-border'
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
              mapTypeControl: false,
              zoomControl: true,
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
                linksControl: true,
                panControl: true,
                enableCloseButton: false,
              }}
            />
          </GoogleMap>
        </div>

        {/* Crop Overlay */}
        {isCropMode && cropArea && (
          <div
            className="absolute border-4 border-primary bg-primary/20 pointer-events-none backdrop-blur-sm"
            style={{
              left: cropArea.width >= 0 ? cropArea.startX : cropArea.startX + cropArea.width,
              top: cropArea.height >= 0 ? cropArea.startY : cropArea.startY + cropArea.height,
              width: Math.abs(cropArea.width),
              height: Math.abs(cropArea.height),
              boxShadow: '0 0 30px rgba(255, 20, 147, 0.6)',
            }}
          >
            <div className="absolute -top-10 left-0 bg-gradient-to-r from-primary to-neon-cyan text-white px-3 py-1.5 rounded-lg text-sm font-black shadow-neon">
              {Math.abs(cropArea.width).toFixed(0)} × {Math.abs(cropArea.height).toFixed(0)} px
            </div>
          </div>
        )}

        {/* Dark overlay when in crop mode */}
        {isCropMode && (
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        )}
      </div>

      {/* Captured Image Preview */}
      {capturedImage && (
        <Card className="p-4 bg-gradient-to-br from-gray-900 to-gray-800 border-primary/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary to-neon-cyan">
              Screenshot Preview
            </h3>
            <div className="flex gap-2">
              <Button onClick={downloadImage} size="sm" className="gap-2 bg-gradient-to-r from-neon-lime to-neon-cyan text-black">
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button onClick={() => setCapturedImage(null)} size="sm" variant="outline">
                <X className="w-4 h-4" />
                Schließen
              </Button>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden border-2 border-primary/50">
            <img
              src={capturedImage}
              alt="Captured Street View"
              className="w-full h-auto"
            />
          </div>
        </Card>
      )}

      {/* Location Info */}
      <Card className="p-4 bg-gradient-to-r from-urban-surface to-gray-900 border-urban-border">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground font-bold uppercase">Position:</span>
            <span className="ml-2 font-mono text-neon-cyan">
              {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-neon-cyan/50 hover:bg-neon-cyan/10 hover:border-neon-cyan"
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
            📍 Zu meinem Standort
          </Button>
        </div>
      </Card>
    </div>
  );
};
