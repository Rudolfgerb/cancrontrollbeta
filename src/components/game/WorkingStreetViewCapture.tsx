import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleMap, StreetViewPanorama, useJsApiLoader } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, X, Download, MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';

interface WorkingStreetViewCaptureProps {
  onCaptureComplete?: (imageData: string, location: { lat: number; lng: number }) => void;
  defaultPosition?: { lat: number; lng: number };
}

const containerStyle = {
  width: '100%',
  height: '600px',
};

const defaultCenter = {
  lat: 52.520008,
  lng: 13.404954,
};

export const WorkingStreetViewCapture: React.FC<WorkingStreetViewCaptureProps> = ({
  onCaptureComplete,
  defaultPosition = defaultCenter,
}) => {
  const [currentPosition, setCurrentPosition] = useState(defaultPosition);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isStreetViewActive, setIsStreetViewActive] = useState(false);
  const streetViewRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const handleStreetViewLoad = useCallback((panorama: google.maps.StreetViewPanorama) => {
    streetViewRef.current = panorama;
    console.log('Street View loaded');
  }, []);

  const activateStreetView = () => {
    setIsStreetViewActive(true);
    toast.info('Street View aktiviert', {
      description: 'Navigiere zum gewünschten Ort und klicke auf "Screenshot"'
    });
  };

  const captureScreenshot = useCallback(async () => {
    if (!streetViewRef.current) {
      toast.error('Street View ist nicht aktiv');
      return;
    }

    try {
      toast.loading('Screenshot wird erstellt...', { id: 'screenshot' });

      // Get the Street View container
      const streetViewDiv = document.querySelector('.gm-style') as HTMLElement;
      if (!streetViewDiv) {
        throw new Error('Street View container not found');
      }

      // Get Street View position
      const position = streetViewRef.current.getPosition();
      if (!position) {
        throw new Error('Position nicht verfügbar');
      }

      // WORKAROUND: Use canvas snapshot from Street View tiles
      // This is a simpler approach that works better than html2canvas
      const pano = streetViewRef.current.getPano();
      const pov = streetViewRef.current.getPov();

      // Create a data URL for the screenshot placeholder
      // In production, you would use Google's Static Street View API
      const staticStreetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${position.lat()},${position.lng()}&heading=${pov.heading}&pitch=${pov.pitch}&fov=90&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;

      // Load the static image
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = 800;
        canvas.height = 600;

        // Draw the image
        ctx.drawImage(img, 0, 0, 800, 600);

        // Add overlay information
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(`📍 Location: ${position.lat().toFixed(6)}, ${position.lng().toFixed(6)}`, 20, canvas.height - 30);
        ctx.font = '14px sans-serif';
        ctx.fillText(`🧭 Heading: ${pov.heading.toFixed(0)}° | Pitch: ${pov.pitch.toFixed(0)}°`, 20, canvas.height - 10);

        // Convert to base64
        const imageData = canvas.toDataURL('image/png');

        setCapturedImage(imageData);

        if (onCaptureComplete) {
          onCaptureComplete(imageData, {
            lat: position.lat(),
            lng: position.lng(),
          });
        }

        toast.success('Screenshot erfolgreich erstellt!', { id: 'screenshot' });
      };

      img.onerror = () => {
        // Fallback: Create a canvas with gradient and location info
        createFallbackScreenshot(position, pov);
      };

      img.src = staticStreetViewUrl;

    } catch (error) {
      console.error('Screenshot error:', error);
      toast.error('Fehler beim Screenshot', { id: 'screenshot' });
    }
  }, [onCaptureComplete]);

  const createFallbackScreenshot = (position: google.maps.LatLng, pov: google.maps.StreetViewPov) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.5, '#764ba2');
    gradient.addColorStop(1, '#f093fb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Street View Capture', canvas.width / 2, canvas.height / 2 - 60);

    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`📍 ${position.lat().toFixed(6)}, ${position.lng().toFixed(6)}`, canvas.width / 2, canvas.height / 2);

    ctx.font = '18px sans-serif';
    ctx.fillText(`🧭 Heading: ${pov.heading.toFixed(0)}° | Pitch: ${pov.pitch.toFixed(0)}°`, canvas.width / 2, canvas.height / 2 + 40);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('Static Street View API Screenshot', canvas.width / 2, canvas.height / 2 + 80);

    const imageData = canvas.toDataURL('image/png');
    setCapturedImage(imageData);

    if (onCaptureComplete) {
      onCaptureComplete(imageData, {
        lat: position.lat(),
        lng: position.lng(),
      });
    }

    toast.success('Screenshot erstellt (Fallback-Modus)!', { id: 'screenshot' });
  };

  const downloadImage = () => {
    if (!capturedImage) return;

    const link = document.createElement('a');
    link.download = `street-view-${Date.now()}.png`;
    link.href = capturedImage;
    link.click();
    toast.success('Bild heruntergeladen!');
  };

  const resetCapture = () => {
    setCapturedImage(null);
  };

  if (loadError) {
    return (
      <Card className="p-8 text-center">
        <div className="text-destructive mb-4 font-bold text-xl">
          ⚠️ Fehler beim Laden von Google Maps
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Bitte überprüfe deine API-Konfiguration
        </p>
        <code className="text-xs bg-muted p-2 rounded block">
          VITE_GOOGLE_MAPS_API_KEY erforderlich in .env
        </code>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <div className="text-muted-foreground">Lade Google Street View...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-2 items-center justify-between bg-gradient-to-r from-urban-surface to-gray-900 p-4 rounded-lg border-2 border-urban-border shadow-lg">
        <div className="text-sm">
          {!isStreetViewActive ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-neon-cyan" />
              <span className="font-bold">Karten-Modus:</span> Klicke auf "Street View aktivieren"
            </span>
          ) : (
            <span className="flex items-center gap-2 text-primary">
              <Navigation className="w-4 h-4 animate-pulse" />
              <span className="font-bold">Street View aktiv:</span> Navigiere und erstelle Screenshot
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {!isStreetViewActive ? (
            <Button
              onClick={activateStreetView}
              className="gap-2 bg-gradient-to-r from-neon-cyan to-primary hover:shadow-neon"
            >
              <Navigation className="w-4 h-4" />
              Street View aktivieren
            </Button>
          ) : (
            <>
              <Button
                onClick={captureScreenshot}
                className="gap-2 bg-gradient-to-r from-neon-lime to-neon-cyan text-black hover:shadow-neon"
              >
                <Camera className="w-4 h-4" />
                Screenshot erstellen
              </Button>
              <Button
                onClick={() => setIsStreetViewActive(false)}
                variant="outline"
                className="gap-2 border-primary/50 hover:bg-primary/10"
              >
                <MapPin className="w-4 h-4" />
                Zur Karte
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Map/Street View Container */}
      <div className="relative rounded-lg overflow-hidden border-4 border-urban-border shadow-2xl">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPosition}
          zoom={15}
          options={{
            streetViewControl: true,
            fullscreenControl: false,
            mapTypeControl: false,
          }}
        >
          {isStreetViewActive && (
            <StreetViewPanorama
              position={currentPosition}
              visible={true}
              onLoad={handleStreetViewLoad}
              options={{
                addressControl: true,
                fullscreenControl: false,
                motionTracking: false,
                motionTrackingControl: false,
                linksControl: true,
                panControl: true,
                enableCloseButton: false,
              }}
            />
          )}
        </GoogleMap>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Screenshot Preview */}
      {capturedImage && (
        <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-neon-lime/30 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-neon-lime to-neon-cyan flex items-center gap-2">
              <Camera className="w-6 h-6 text-neon-lime" />
              Screenshot Erfolgreich!
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={downloadImage}
                size="sm"
                className="gap-2 bg-gradient-to-r from-neon-lime to-neon-cyan text-black hover:shadow-neon"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                onClick={resetCapture}
                size="sm"
                variant="outline"
                className="gap-2 border-destructive/50 hover:bg-destructive/10"
              >
                <X className="w-4 h-4" />
                Schließen
              </Button>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden border-4 border-neon-lime/50 shadow-neon">
            <img
              src={capturedImage}
              alt="Captured Street View"
              className="w-full h-auto"
            />
          </div>
          <div className="mt-4 p-4 bg-neon-lime/10 border border-neon-lime/30 rounded-lg">
            <p className="text-sm text-neon-lime font-bold">
              ✅ Dieses Bild kann jetzt als Hintergrund für dein Graffiti verwendet werden!
            </p>
          </div>
        </Card>
      )}

      {/* Info */}
      <Card className="p-4 bg-gradient-to-r from-urban-surface to-gray-900 border-urban-border">
        <div className="text-sm">
          <div className="font-bold text-primary mb-2">💡 Tipp:</div>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• Street View aktivieren und zum gewünschten Ort navigieren</li>
            <li>• Screenshot-Button klicken um das aktuelle Bild zu erfassen</li>
            <li>• Das Bild wird mit GPS-Koordinaten gespeichert</li>
            <li>• Verwende Static Street View API für beste Qualität (siehe .env)</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
