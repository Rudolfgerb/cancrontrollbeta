import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface SimpleSpotCaptureProps {
  onCaptureComplete?: (imageData: string, location: { lat: number; lng: number }) => void;
}

export const SimpleSpotCapture: React.FC<SimpleSpotCaptureProps> = ({
  onCaptureComplete,
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [manualLat, setManualLat] = useState('52.520008');
  const [manualLng, setManualLng] = useState('13.404954');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Method 1: Upload from device (Screenshot/Camera)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      toast.error('Bitte wähle ein Bild aus');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setCapturedImage(imageData);
      toast.success('Bild hochgeladen!');
    };
    reader.readAsDataURL(file);
  };

  // Method 2: Use device camera directly
  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Method 3: Use native share/screenshot
  const handleNativeScreenshot = async () => {
    try {
      // Check if browser supports screen capture
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        toast.info('📸 Anleitung:', {
          description: '1. Öffne Google Maps in neuem Tab\n2. Gehe zu Street View\n3. Mach Screenshot (Windows: Win+Shift+S, Mac: Cmd+Shift+4)\n4. Lade Screenshot hier hoch',
          duration: 10000,
        });
      } else {
        toast.info('💡 Screenshot machen:', {
          description: 'Mach einen Screenshot von Google Street View und lade ihn hier hoch',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Screen capture error:', error);
    }
  };

  // Get current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.loading('Position wird ermittelt...', { id: 'location' });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setManualLat(position.coords.latitude.toFixed(6));
          setManualLng(position.coords.longitude.toFixed(6));
          toast.success('Position aktualisiert!', { id: 'location' });
        },
        (error) => {
          console.error('Location error:', error);
          toast.error('Position konnte nicht ermittelt werden', { id: 'location' });
        }
      );
    } else {
      toast.error('Geolocation nicht verfügbar');
    }
  };

  const handleConfirm = () => {
    if (!capturedImage) {
      toast.error('Bitte lade zuerst ein Bild hoch');
      return;
    }

    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Ungültige GPS-Koordinaten');
      return;
    }

    if (onCaptureComplete) {
      onCaptureComplete(capturedImage, { lat, lng });
    }

    toast.success('Spot-Bild gespeichert!');
  };

  const handleReset = () => {
    setCapturedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-gray-900 via-black to-gray-900 border-2 border-primary/30">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-primary/20 rounded-lg">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary to-neon-cyan">
              Spot-Bild Erfassen
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Screenshot hochladen oder Foto machen
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg p-4">
          <div className="font-bold text-neon-cyan mb-2 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            So geht's:
          </div>
          <ol className="text-sm text-muted-foreground space-y-2 ml-6 list-decimal">
            <li>Öffne <strong>Google Street View</strong> in einem neuen Tab</li>
            <li>Navigiere zum gewünschten Graffiti-Spot</li>
            <li>Mach einen <strong>Screenshot</strong> (Windows: Win+Shift+S, Mac: Cmd+Shift+4)</li>
            <li>Lade den Screenshot hier hoch mit "Bild hochladen"</li>
          </ol>
        </div>
      </Card>

      {/* Upload Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={() => fileInputRef.current?.click()}
          size="lg"
          className="gap-3 bg-gradient-to-r from-neon-lime to-neon-cyan text-black hover:shadow-neon font-black h-auto py-6 flex-col"
        >
          <Upload className="w-8 h-8" />
          <div>
            <div>Bild hochladen</div>
            <div className="text-xs opacity-80 font-normal">Von Gerät wählen</div>
          </div>
        </Button>

        <Button
          onClick={handleCameraCapture}
          size="lg"
          variant="outline"
          className="gap-3 border-primary/50 hover:bg-primary/10 font-black h-auto py-6 flex-col"
        >
          <Camera className="w-8 h-8" />
          <div>
            <div>Foto machen</div>
            <div className="text-xs opacity-80 font-normal">Mit Kamera</div>
          </div>
        </Button>

        <Button
          onClick={handleNativeScreenshot}
          size="lg"
          variant="outline"
          className="gap-3 border-neon-cyan/50 hover:bg-neon-cyan/10 font-black h-auto py-6 flex-col"
        >
          <ImageIcon className="w-8 h-8" />
          <div>
            <div>Anleitung</div>
            <div className="text-xs opacity-80 font-normal">Screenshot Guide</div>
          </div>
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Image Preview */}
      {capturedImage && (
        <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-neon-lime/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-neon-lime to-neon-cyan">
              ✅ Bild hochgeladen
            </h4>
            <Button
              onClick={handleReset}
              size="sm"
              variant="outline"
              className="gap-2 border-destructive/50 hover:bg-destructive/10"
            >
              <X className="w-4 h-4" />
              Entfernen
            </Button>
          </div>

          <div className="relative rounded-lg overflow-hidden border-4 border-neon-lime/50 shadow-2xl mb-4">
            <img
              src={capturedImage}
              alt="Uploaded spot"
              className="w-full h-auto"
            />
          </div>

          {/* GPS Coordinates */}
          <div className="space-y-4">
            <div>
              <div className="text-sm font-bold text-neon-cyan mb-2 uppercase">GPS Koordinaten</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Latitude</label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Longitude</label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
              <Button
                onClick={handleGetCurrentLocation}
                size="sm"
                variant="outline"
                className="mt-2 gap-2 border-neon-cyan/50 hover:bg-neon-cyan/10"
              >
                📍 Aktuelle Position verwenden
              </Button>
            </div>

            <Button
              onClick={handleConfirm}
              size="lg"
              className="w-full gap-3 bg-gradient-to-r from-neon-lime to-neon-cyan text-black hover:shadow-neon font-black"
            >
              <Check className="w-5 h-5" />
              Bild bestätigen
            </Button>
          </div>
        </Card>
      )}

      {/* Quick Links */}
      <Card className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 border-primary/20">
        <div className="text-sm">
          <div className="font-bold text-primary mb-2">🔗 Schnell-Links:</div>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://www.google.com/maps/@52.520008,13.404954,3a,75y,90h,90t/data=!3m7!1e1"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan/30 rounded text-xs font-bold text-neon-cyan transition-all"
            >
              📍 Google Street View Berlin öffnen
            </a>
            <a
              href="https://www.google.com/maps"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-neon-lime/20 hover:bg-neon-lime/30 border border-neon-lime/30 rounded text-xs font-bold text-neon-lime transition-all"
            >
              🗺️ Google Maps öffnen
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
};
