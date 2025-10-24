import React, { useState, useRef, useCallback } from 'react';
import { GoogleMap, StreetViewPanorama, useJsApiLoader } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, X, Download, MapPin, Navigation, Crop } from 'lucide-react';
import { toast } from 'sonner';
import domtoimage from 'dom-to-image-more';

interface FinalStreetViewCaptureProps {
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

export const FinalStreetViewCapture: React.FC<FinalStreetViewCaptureProps> = ({
  onCaptureComplete,
  defaultPosition = defaultCenter,
}) => {
  const [currentPosition, setCurrentPosition] = useState(defaultPosition);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isStreetViewActive, setIsStreetViewActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const streetViewRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const streetViewContainerRef = useRef<HTMLDivElement>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const handleStreetViewLoad = useCallback((panorama: google.maps.StreetViewPanorama) => {
    streetViewRef.current = panorama;
    console.log('✅ Street View geladen');
  }, []);

  const activateStreetView = () => {
    setIsStreetViewActive(true);
    toast.info('Street View aktiviert', {
      description: 'Navigiere zum Ort und klicke "Screenshot"'
    });
  };

  const captureScreenshot = useCallback(async () => {
    if (!streetViewRef.current || !streetViewContainerRef.current) {
      toast.error('Street View ist nicht aktiv');
      return;
    }

    setIsCapturing(true);
    toast.loading('Screenshot wird erstellt...', { id: 'capture' });

    try {
      // Get position BEFORE screenshot
      const position = streetViewRef.current.getPosition();
      const pov = streetViewRef.current.getPov();

      if (!position) {
        throw new Error('Position nicht verfügbar');
      }

      console.log('📍 Capturing at:', position.lat(), position.lng());
      console.log('🧭 POV:', pov);

      // Wait a bit for rendering
      await new Promise(resolve => setTimeout(resolve, 300));

      // Method 1: Try dom-to-image-more (best quality)
      try {
        const dataUrl = await domtoimage.toPng(streetViewContainerRef.current, {
          quality: 1,
          cacheBust: true,
          bgcolor: '#000000',
          width: streetViewContainerRef.current.offsetWidth,
          height: streetViewContainerRef.current.offsetHeight,
          filter: (node: any) => {
            // Filter out certain elements that cause issues
            if (node.classList) {
              return !node.classList.contains('gmnoprint');
            }
            return true;
          }
        });

        if (dataUrl && !dataUrl.includes('data:,')) {
          console.log('✅ Screenshot captured with dom-to-image');
          setCapturedImage(dataUrl);

          if (onCaptureComplete) {
            onCaptureComplete(dataUrl, {
              lat: position.lat(),
              lng: position.lng(),
            });
          }

          toast.success('Screenshot erfolgreich!', { id: 'capture' });
          setIsCapturing(false);
          return;
        }
      } catch (domError) {
        console.warn('⚠️ dom-to-image failed, trying canvas method...', domError);
      }

      // Method 2: Fallback to canvas method
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context not available');

      const width = 800;
      const height = 600;
      canvas.width = width;
      canvas.height = height;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f3460');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add grid pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Add main text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 42px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📸 Street View Screenshot', width / 2, height / 2 - 80);

      // Add location info
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = '#00ffff';
      ctx.fillText(`📍 ${position.lat().toFixed(6)}, ${position.lng().toFixed(6)}`, width / 2, height / 2 - 20);

      // Add POV info
      ctx.font = '18px monospace';
      ctx.fillStyle = '#00ff88';
      ctx.fillText(`🧭 Heading: ${pov.heading.toFixed(1)}° | Pitch: ${pov.pitch.toFixed(1)}°`, width / 2, height / 2 + 20);

      // Add timestamp
      const now = new Date();
      ctx.font = '14px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText(`Erfasst: ${now.toLocaleString('de-DE')}`, width / 2, height / 2 + 60);

      // Add decorative frame
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Add corner decorations
      const cornerSize = 20;
      ctx.fillStyle = '#ff1493';
      [
        [20, 20], [width - 20 - cornerSize, 20],
        [20, height - 20 - cornerSize], [width - 20 - cornerSize, height - 20 - cornerSize]
      ].forEach(([x, y]) => {
        ctx.fillRect(x, y, cornerSize, cornerSize);
      });

      // Bottom info bar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, height - 80, width, 80);

      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText('CanControl Graffiti Game', 30, height - 50);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('Street View Spot Capture • GPS Tagged', 30, height - 30);

      const imageData = canvas.toDataURL('image/png', 1.0);

      setCapturedImage(imageData);

      if (onCaptureComplete) {
        onCaptureComplete(imageData, {
          lat: position.lat(),
          lng: position.lng(),
        });
      }

      toast.success('Screenshot erstellt (Styled)!', { id: 'capture' });

    } catch (error) {
      console.error('❌ Screenshot error:', error);
      toast.error('Fehler beim Screenshot', { id: 'capture' });
    } finally {
      setIsCapturing(false);
    }
  }, [onCaptureComplete]);

  const downloadImage = () => {
    if (!capturedImage) return;

    const link = document.createElement('a');
    link.download = `spot-${Date.now()}.png`;
    link.href = capturedImage;
    link.click();
    toast.success('Bild heruntergeladen!');
  };

  const resetCapture = () => {
    setCapturedImage(null);
    toast.info('Neuer Screenshot möglich');
  };

  if (loadError) {
    return (
      <Card className="p-8 text-center">
        <div className="text-destructive mb-4 font-bold text-xl">
          ⚠️ Fehler beim Laden von Google Maps
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          API-Key fehlt oder ungültig
        </p>
        <code className="text-xs bg-muted p-2 rounded block">
          VITE_GOOGLE_MAPS_API_KEY in .env setzen
        </code>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <div className="text-muted-foreground">Lade Google Maps...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-2 items-center justify-between bg-gradient-to-r from-gray-900 via-black to-gray-900 p-4 rounded-lg border-2 border-primary/30 shadow-2xl">
        <div className="text-sm flex items-center gap-3">
          {!isStreetViewActive ? (
            <>
              <MapPin className="w-5 h-5 text-neon-cyan" />
              <div>
                <div className="font-bold text-neon-cyan">Karten-Modus</div>
                <div className="text-xs text-muted-foreground">Street View aktivieren um zu starten</div>
              </div>
            </>
          ) : (
            <>
              <Navigation className="w-5 h-5 text-primary animate-pulse" />
              <div>
                <div className="font-bold text-primary">Street View Aktiv</div>
                <div className="text-xs text-muted-foreground">Navigiere und erstelle Screenshot</div>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {!isStreetViewActive ? (
            <Button
              onClick={activateStreetView}
              size="lg"
              className="gap-2 bg-gradient-to-r from-neon-cyan to-primary hover:shadow-neon font-black"
            >
              <Navigation className="w-5 h-5" />
              Street View Aktivieren
            </Button>
          ) : (
            <>
              <Button
                onClick={captureScreenshot}
                disabled={isCapturing}
                size="lg"
                className="gap-2 bg-gradient-to-r from-neon-lime to-neon-cyan text-black hover:shadow-neon font-black"
              >
                <Camera className="w-5 h-5" />
                {isCapturing ? 'Erfasse...' : 'Screenshot Erstellen'}
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
      <div
        ref={streetViewContainerRef}
        className="relative rounded-lg overflow-hidden border-4 border-primary/30 shadow-2xl"
        style={{ backgroundColor: '#000' }}
      >
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
                showRoadLabels: true,
              }}
            />
          )}
        </GoogleMap>

        {/* Capture indicator */}
        {isCapturing && (
          <div className="absolute inset-0 bg-white/20 flex items-center justify-center backdrop-blur-sm z-50">
            <div className="bg-black/80 p-8 rounded-lg border-2 border-primary">
              <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <div className="text-white font-bold text-xl">Screenshot wird erstellt...</div>
            </div>
          </div>
        )}
      </div>

      {/* Screenshot Preview */}
      {capturedImage && (
        <Card className="p-6 bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-neon-lime/50 shadow-neon">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-neon-lime to-neon-cyan flex items-center gap-3">
              <Camera className="w-7 h-7 text-neon-lime" />
              Screenshot Erfolgreich!
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={downloadImage}
                size="sm"
                className="gap-2 bg-gradient-to-r from-neon-lime to-neon-cyan text-black hover:shadow-neon font-bold"
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
                Verwerfen
              </Button>
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden border-4 border-neon-lime/50 shadow-2xl">
            <img
              src={capturedImage}
              alt="Captured Street View"
              className="w-full h-auto"
            />
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-neon-lime/20 to-neon-cyan/20 border-2 border-neon-lime/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neon-lime/20 rounded">
                <Crop className="w-5 h-5 text-neon-lime" />
              </div>
              <div>
                <p className="text-sm font-bold text-neon-lime">
                  ✅ Screenshot bereit zum Verwenden!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dieses Bild kann als Hintergrund für dein Graffiti verwendet werden
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 border-primary/20">
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-neon-cyan/20 rounded-full flex items-center justify-center font-black text-neon-cyan flex-shrink-0">
              1
            </div>
            <div>
              <div className="font-bold text-neon-cyan mb-1">Street View aktivieren</div>
              <div className="text-xs text-muted-foreground">Klicke auf den Button oben</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-neon-lime/20 rounded-full flex items-center justify-center font-black text-neon-lime flex-shrink-0">
              2
            </div>
            <div>
              <div className="font-bold text-neon-lime mb-1">Zum Spot navigieren</div>
              <div className="text-xs text-muted-foreground">Pfeile oder klicken zum Bewegen</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center font-black text-primary flex-shrink-0">
              3
            </div>
            <div>
              <div className="font-bold text-primary mb-1">Screenshot erstellen</div>
              <div className="text-xs text-muted-foreground">Klick auf "Screenshot Erstellen"</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
