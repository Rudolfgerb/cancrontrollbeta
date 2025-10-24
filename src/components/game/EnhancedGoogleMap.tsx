import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, StreetViewPanorama, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Star, DollarSign, Shield, Camera, MapPin, Navigation, Crosshair, Crop, Check, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useHaptics } from '@/lib/haptics';
import { useIsMobile } from '@/hooks/use-mobile';
import html2canvas from 'html2canvas';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop/types';

interface CapturedSpot {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  heading: number;
  pitch: number;
  imageData: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  timestamp: number;
  userId?: string;
}

interface EnhancedGoogleMapProps {
  onSpotCapture: (spot: CapturedSpot) => void;
  onSpotSelect: (spot: CapturedSpot) => void;
  capturedSpots: CapturedSpot[];
}

const streetViewStyle = {
  width: '100%',
  height: '100%',
};

// Define libraries as constant to prevent reload warnings
const libraries: ('places' | 'geometry')[] = ['places', 'geometry'];

export const EnhancedGoogleMap: React.FC<EnhancedGoogleMapProps> = ({
  onSpotCapture,
  onSpotSelect,
  capturedSpots = [],
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [streetView, setStreetView] = useState<google.maps.StreetViewPanorama | null>(null);
  const [currentPosition, setCurrentPosition] = useState({ lat: 52.520008, lng: 13.404954 }); // Berlin
  const [streetViewPosition, setStreetViewPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isStreetViewMode, setIsStreetViewMode] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<CapturedSpot | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [spotName, setSpotName] = useState('');
  const [spotDescription, setSpotDescription] = useState('');
  const [riskLevel, setRiskLevel] = useState(5);
  const [showStartSpotDialog, setShowStartSpotDialog] = useState(false);
  const [showCancelConfirmDialog, setShowCancelConfirmDialog] = useState(false);
  const streetViewRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const streetViewContainerRef = useRef<HTMLDivElement | null>(null);
  const { light, success } = useHaptics();
  const isMobile = useIsMobile();

  // Dynamic container style based on device
  const containerStyle = {
    width: '100%',
    height: isMobile
      ? 'calc(100vh - 180px)' // Account for header + bottom nav on mobile
      : 'calc(100vh - 200px)',
    minHeight: isMobile ? '500px' : '600px',
  };

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentPosition(pos);
          if (map) {
            map.setCenter(pos);
          }
        },
        () => {
          console.log('Using default location: Berlin');
        }
      );
    }
  }, [map]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Initialize Street View manually when container is ready
  useEffect(() => {
    if (isStreetViewMode && streetViewPosition && streetViewContainerRef.current && isLoaded && !streetViewRef.current) {
      console.log('Initializing Street View manually');

      try {
        const panorama = new google.maps.StreetViewPanorama(
          streetViewContainerRef.current,
          {
            position: streetViewPosition,
            addressControl: !isMobile, // Hide on mobile to save space
            fullscreenControl: !isMobile, // Hide on mobile
            motionTracking: false,
            motionTrackingControl: false,
            showRoadLabels: true,
            linksControl: true,
            panControl: isMobile, // Show pan control on mobile for easier navigation
            zoomControl: true,
            pov: {
              heading: 0,
              pitch: 0,
            },
            controlSize: isMobile ? 32 : 40, // Smaller controls on mobile
          }
        );

        streetViewRef.current = panorama;
        setStreetView(panorama);
        console.log('Street View initialized successfully');
      } catch (error) {
        console.error('Error initializing Street View:', error);
        toast.error('Fehler beim Laden von Street View');
        setIsStreetViewMode(false);
      }
    }
  }, [isStreetViewMode, streetViewPosition, isLoaded]);

  // Cleanup Street View on unmount or mode change
  useEffect(() => {
    return () => {
      if (streetViewRef.current) {
        streetViewRef.current = null;
        setStreetView(null);
      }
    };
  }, [isStreetViewMode]);

  const handleOpenStreetView = (position: { lat: number; lng: number }) => {
    light();
    console.log('Opening Street View at:', position);

    // Check if Street View is available at this location
    const streetViewService = new google.maps.StreetViewService();
    streetViewService.getPanorama(
      { location: position, radius: 50 },
      (data, status) => {
        if (status === google.maps.StreetViewStatus.OK && data && data.location) {
          console.log('Street View available at:', data.location.latLng?.toJSON());
          const pos = data.location.latLng;
          if (pos) {
            setStreetViewPosition({ lat: pos.lat(), lng: pos.lng() });
            setIsStreetViewMode(true);
            toast.success('Street View geöffnet');
          }
        } else {
          console.error('Street View not available:', status);
          toast.error('Kein Street View an dieser Position verfügbar');
        }
      }
    );
  };

  const handleCloseStreetView = () => {
    light();
    setIsStreetViewMode(false);
    setStreetViewPosition(null);
    toast.info('Zurück zur Karte');
  };

  const captureStreetView = async () => {
    if (!streetView) {
      toast.error('Street View nicht verfügbar');
      return;
    }

    setIsCapturing(true);
    light();

    try {
      // Get current position and POV from Street View
      const position = streetView.getPosition();
      const pov = streetView.getPov();

      if (!position) {
        throw new Error('Position nicht verfügbar');
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

      // Use Static Street View API to get actual image
      const params = new URLSearchParams({
        size: '800x600',
        location: `${position.lat()},${position.lng()}`,
        heading: pov.heading.toString(),
        pitch: pov.pitch.toString(),
        fov: '90',
        key: apiKey,
      });

      const staticUrl = `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;

      // Load the image
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Fehler beim Laden des Bildes'));
        img.src = staticUrl;
      });

      // Convert to canvas and then to base64
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context nicht verfügbar');
      }

      ctx.drawImage(img, 0, 0);
      const imageData = canvas.toDataURL('image/png');

      setCapturedImage(imageData);
      setShowCropDialog(true);
      toast.success('Screenshot erfasst! Jetzt zuschneiden');
    } catch (error) {
      console.error('Screenshot error:', error);
      toast.error('Fehler beim Screenshot. Versuche es erneut.');
    } finally {
      setIsCapturing(false);
    }
  };

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = () => {
    // Show warning dialog instead of directly creating the spot
    setShowStartSpotDialog(true);
  };

  const createCroppedImage = async () => {
    if (!capturedImage || !croppedAreaPixels || !streetView) {
      return;
    }

    try {
      const image = new Image();
      image.src = capturedImage;
      await new Promise((resolve) => { image.onload = resolve; });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      const croppedImageData = canvas.toDataURL('image/png');

      const pov = streetView.getPov();
      const position = streetView.getPosition();

      if (!position) {
        toast.error('Position nicht verfügbar');
        return;
      }

      // Map risk level (1-10) to difficulty
      const difficultyMap: CapturedSpot['difficulty'][] = ['easy', 'easy', 'easy', 'medium', 'medium', 'medium', 'hard', 'hard', 'extreme', 'extreme'];
      const difficulty = difficultyMap[Math.min(riskLevel - 1, 9)];

      const finalSpotName = spotName.trim() || `Spot ${position.lat().toFixed(4)}, ${position.lng().toFixed(4)}`;

      const capturedSpot: CapturedSpot = {
        id: `spot-${Date.now()}`,
        name: finalSpotName,
        position: {
          lat: position.lat(),
          lng: position.lng(),
        },
        heading: pov.heading,
        pitch: pov.pitch,
        imageData: croppedImageData,
        difficulty,
        timestamp: Date.now(),
      };

      onSpotCapture(capturedSpot);
      success();
      toast.success(`Spot "${finalSpotName}" erfasst!`);

      // Reset states
      setShowCropDialog(false);
      setShowStartSpotDialog(false);
      setCapturedImage(null);
      setSpotName('');
      setSpotDescription('');
      setRiskLevel(5);
      handleCloseStreetView();
    } catch (error) {
      console.error('Crop error:', error);
      toast.error('Fehler beim Zuschneiden');
    }
  };

  const handleCancelCrop = () => {
    if (spotName.trim() || spotDescription.trim() || riskLevel !== 5) {
      // Show confirmation dialog if user has made changes
      setShowCancelConfirmDialog(true);
    } else {
      // Directly cancel if no changes
      setShowCropDialog(false);
      setCapturedImage(null);
    }
  };

  const confirmCancelCrop = () => {
    setShowCropDialog(false);
    setShowCancelConfirmDialog(false);
    setCapturedImage(null);
    setSpotName('');
    setSpotDescription('');
    setRiskLevel(5);
    toast.info('Spot-Erfassung abgebrochen');
  };

  const handleMarkerClick = (spot: CapturedSpot) => {
    light();
    setSelectedSpot(spot);
  };

  const handlePaintSpot = (spot: CapturedSpot) => {
    light();
    onSpotSelect(spot);
    setSelectedSpot(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#84cc16'; // neon-lime
      case 'medium': return '#22d3ee'; // neon-cyan
      case 'hard': return '#fb923c'; // neon-orange
      case 'extreme': return '#ec4899'; // primary/pink
      default: return '#84cc16';
    }
  };

  if (loadError) {
    return (
      <Card className="p-8 text-center">
        <div className="text-destructive mb-4 text-xl font-bold">
          ⚠️ Fehler beim Laden von Google Maps
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Bitte überprüfe deine API-Konfiguration in der .env Datei
        </p>
        <code className="text-xs bg-muted p-2 rounded block">
          VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
        </code>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <div className="text-muted-foreground">Lade Google Maps...</div>
      </Card>
    );
  }

  return (
    <div
      className="relative w-full"
      style={{
        height: isMobile ? 'calc(100vh - 180px)' : 'calc(100vh - 200px)',
        minHeight: isMobile ? '500px' : '600px',
      }}
    >
      {/* Mode Toggle */}
      <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} z-20 flex gap-2 flex-wrap justify-end`}>
        {isStreetViewMode ? (
          <>
            <Button
              onClick={captureStreetView}
              disabled={isCapturing}
              className={`bg-primary hover:bg-primary/90 shadow-neon gap-2 ${
                isMobile ? 'h-12 px-4 text-sm' : 'h-10 px-4'
              }`}
            >
              <Camera className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />
              {isCapturing ? 'Erfasse...' : isMobile ? 'Erfassen' : 'Spot erfassen'}
            </Button>
            <Button
              onClick={handleCloseStreetView}
              variant="outline"
              className={`bg-background/90 backdrop-blur ${
                isMobile ? 'h-12 px-4 text-sm' : 'h-10 px-4'
              }`}
            >
              <MapPin className={isMobile ? 'w-5 h-5 mr-2' : 'w-4 h-4 mr-2'} />
              {isMobile ? 'Karte' : 'Zur Karte'}
            </Button>
          </>
        ) : (
          <Button
            onClick={() => handleOpenStreetView(currentPosition)}
            className={`bg-secondary hover:bg-secondary/90 shadow-glow-cyan gap-2 ${
              isMobile ? 'h-12 px-4 text-sm' : 'h-10 px-4'
            }`}
          >
            <Navigation className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />
            {isMobile ? 'Street View' : 'Street View öffnen'}
          </Button>
        )}
      </div>

      {/* Info Panel */}
      <div className={`absolute ${isMobile ? 'top-2 left-2' : 'top-4 left-4'} z-20`}>
        <Card className={`${isMobile ? 'p-3' : 'p-4'} bg-background/90 backdrop-blur`}>
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold mb-2 flex items-center gap-2`}>
            <Crosshair className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-primary`} />
            {isStreetViewMode ? 'Street View Modus' : 'Karten Modus'}
          </div>
          <div className={`text-xs text-muted-foreground ${isMobile ? 'hidden sm:block' : ''}`}>
            {isStreetViewMode ? (
              'Navigiere zu einem Ort und erfasse ihn als Spot'
            ) : (
              <>
                <div>Erfasste Spots: {capturedSpots.length}</div>
                <div className="mt-1">Klicke auf Street View zum Erfassen</div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Map View */}
      {!isStreetViewMode && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPosition}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={(e) => {
            if (e.latLng) {
              handleOpenStreetView({
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
              });
            }
          }}
          options={{
            styles: [
              {
                featureType: 'all',
                elementType: 'geometry',
                stylers: [{ color: '#242f3e' }]
              },
              {
                featureType: 'all',
                elementType: 'labels.text.stroke',
                stylers: [{ color: '#242f3e' }]
              },
              {
                featureType: 'all',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#746855' }]
              },
              {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#17263c' }]
              },
              {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#38414e' }]
              },
            ],
            streetViewControl: true,
            fullscreenControl: true,
            mapTypeControl: false,
            zoomControl: true,
          }}
        >
          {/* User's current position */}
          <Marker
            position={currentPosition}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: isMobile ? 12 : 10,
              fillColor: '#22d3ee',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: isMobile ? 4 : 3,
            }}
            title="Deine Position"
          />

          {/* Captured spots */}
          {capturedSpots.map((spot) => (
            <Marker
              key={spot.id}
              position={spot.position}
              onClick={() => handleMarkerClick(spot)}
              icon={{
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                scale: isMobile ? 8 : 6,
                fillColor: getDifficultyColor(spot.difficulty),
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: isMobile ? 3 : 2,
                rotation: spot.heading,
              }}
            />
          ))}

          {/* InfoWindow for selected spot */}
          {selectedSpot && (
            <InfoWindow
              position={selectedSpot.position}
              onCloseClick={() => setSelectedSpot(null)}
            >
              <div className={`p-2 ${isMobile ? 'min-w-[200px]' : 'min-w-[250px]'}`}>
                <div className="mb-3">
                  <h3 className={`font-black ${isMobile ? 'text-base' : 'text-lg'} uppercase mb-1 text-gray-900`}>
                    {selectedSpot.name}
                  </h3>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-bold text-white ${
                    selectedSpot.difficulty === 'easy' ? 'bg-green-500' :
                    selectedSpot.difficulty === 'medium' ? 'bg-cyan-500' :
                    selectedSpot.difficulty === 'hard' ? 'bg-orange-500' :
                    'bg-pink-500'
                  }`}>
                    {selectedSpot.difficulty.toUpperCase()}
                  </div>
                </div>

                <div className="text-xs text-gray-600 mb-3">
                  Erfasst: {new Date(selectedSpot.timestamp).toLocaleString('de-DE')}
                </div>

                <button
                  onClick={() => handlePaintSpot(selectedSpot)}
                  className={`w-full px-3 ${isMobile ? 'py-3 min-h-[48px]' : 'py-2'} bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold rounded flex items-center justify-center gap-2 touch-manipulation`}
                >
                  <Camera className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />
                  Jetzt malen
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}

      {/* Street View */}
      {isStreetViewMode && streetViewPosition && isLoaded && (
        <div
          ref={streetViewContainerRef}
          style={{
            width: '100%',
            height: isMobile ? 'calc(100vh - 180px)' : 'calc(100vh - 200px)',
            minHeight: isMobile ? '500px' : '600px',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
          }}
        />
      )}

      {/* Crop Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className={`${isMobile ? 'max-w-full h-full' : 'sm:max-w-4xl'} max-h-[95vh] overflow-auto`}>
          <DialogHeader>
            <DialogTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} font-black uppercase flex items-center gap-2`}>
              <Crop className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
              {isMobile ? 'Spot konfigurieren' : 'Spot Zuschneiden & Konfigurieren'}
            </DialogTitle>
            <DialogDescription className={isMobile ? 'text-xs' : ''}>
              Schneide den Screenshot zu und konfiguriere den Spot
            </DialogDescription>
          </DialogHeader>

          <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
            {/* Crop Area */}
            {capturedImage && (
              <div className={`relative w-full ${isMobile ? 'h-[250px]' : 'h-[400px]'} bg-black rounded-lg overflow-hidden`}>
                <Cropper
                  image={capturedImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 3}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
            )}

            {/* Zoom Control */}
            <div className="space-y-2">
              <Label className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold uppercase`}>Zoom</Label>
              <Slider
                value={[zoom]}
                onValueChange={([value]) => setZoom(value)}
                min={1}
                max={3}
                step={0.1}
                className={`w-full ${isMobile ? 'h-10' : ''}`}
              />
            </div>

            {/* Spot Name */}
            <div className="space-y-2">
              <Label htmlFor="spotName" className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold uppercase`}>
                Spot Name *
              </Label>
              <Input
                id="spotName"
                value={spotName}
                onChange={(e) => setSpotName(e.target.value)}
                placeholder="z.B. East Side Gallery, Hauptbahnhof..."
                className={`font-mono ${isMobile ? 'h-12 text-base' : ''}`}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="spotDescription" className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold uppercase`}>
                Beschreibung (Optional)
              </Label>
              <Textarea
                id="spotDescription"
                value={spotDescription}
                onChange={(e) => setSpotDescription(e.target.value)}
                placeholder="Besonderheiten, Tipps, Zugänglichkeit..."
                rows={isMobile ? 2 : 3}
                className={isMobile ? 'text-base' : ''}
              />
            </div>

            {/* Risk Level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold uppercase`}>Risiko Level</Label>
                <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-black`}>
                  <span className={
                    riskLevel <= 3 ? 'text-neon-lime' :
                    riskLevel <= 6 ? 'text-neon-cyan' :
                    riskLevel <= 8 ? 'text-neon-orange' :
                    'text-destructive'
                  }>
                    {riskLevel}/10
                  </span>
                </div>
              </div>
              <Slider
                value={[riskLevel]}
                onValueChange={([value]) => setRiskLevel(value)}
                min={1}
                max={10}
                step={1}
                className={`w-full ${isMobile ? 'h-10' : ''}`}
              />
              <div className={`flex justify-between ${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>
                <span>🟢 Easy</span>
                <span>🟡 Medium</span>
                <span>🟠 Hard</span>
                <span>🔴 Extreme</span>
              </div>
            </div>
          </div>

          <DialogFooter className={`${isMobile ? 'flex-col gap-2' : 'flex gap-2'}`}>
            <Button
              variant="outline"
              onClick={handleCancelCrop}
              className={`gap-2 ${isMobile ? 'w-full h-12 min-h-[48px]' : ''}`}
            >
              <X className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />
              Abbrechen
            </Button>
            <Button
              onClick={handleCropConfirm}
              disabled={!spotName.trim()}
              className={`gap-2 bg-primary hover:bg-primary/90 ${isMobile ? 'w-full h-12 min-h-[48px]' : ''}`}
            >
              <Check className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />
              Spot erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Spot Warning Dialog */}
      <Dialog open={showStartSpotDialog} onOpenChange={setShowStartSpotDialog}>
        <DialogContent className={isMobile ? 'max-w-full' : 'sm:max-w-md'}>
          <DialogHeader>
            <DialogTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} font-black uppercase text-orange-500 flex items-center gap-2`}>
              <AlertTriangle className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} />
              ⚠️ WARNUNG
            </DialogTitle>
            <DialogDescription className={`${isMobile ? 'text-sm' : 'text-base'} pt-4`}>
              Sobald Sie den Spot betreten, gibt es kein Zurück mehr!
              <br /><br />
              Wollen Sie den Spot jetzt beginnen?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={`${isMobile ? 'flex-col gap-2' : 'flex gap-2 sm:gap-2'}`}>
            <Button
              variant="outline"
              onClick={() => {
                setShowStartSpotDialog(false);
                handleCloseStreetView();
                setShowCropDialog(false);
                setCapturedImage(null);
                setSpotName('');
                setSpotDescription('');
                setRiskLevel(5);
              }}
              className={`gap-2 ${isMobile ? 'w-full h-12 min-h-[48px]' : ''}`}
            >
              <MapPin className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />
              Zurück zur Karte
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowStartSpotDialog(false)}
              className={`gap-2 ${isMobile ? 'w-full h-12 min-h-[48px]' : ''}`}
            >
              <X className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />
              Nein
            </Button>
            <Button
              onClick={createCroppedImage}
              className={`gap-2 bg-green-600 hover:bg-green-700 ${isMobile ? 'w-full h-12 min-h-[48px]' : ''}`}
            >
              <Check className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />
              Ja, Spot starten!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelConfirmDialog} onOpenChange={setShowCancelConfirmDialog}>
        <DialogContent className={isMobile ? 'max-w-full' : 'sm:max-w-md'}>
          <DialogHeader>
            <DialogTitle className={`${isMobile ? 'text-lg' : 'text-xl'} font-black uppercase flex items-center gap-2`}>
              <AlertTriangle className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-yellow-500`} />
              Änderungen verwerfen?
            </DialogTitle>
            <DialogDescription className={`${isMobile ? 'text-sm' : 'text-base'} pt-2`}>
              Sind Sie sich sicher, dass Sie verlassen wollen ohne zu speichern?
              <br />
              <span className="text-destructive font-bold">Alle Änderungen gehen verloren!</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={`${isMobile ? 'flex-col gap-2' : 'flex gap-2 sm:gap-2'}`}>
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirmDialog(false)}
              className={`gap-2 ${isMobile ? 'w-full h-12 min-h-[48px]' : ''}`}
            >
              <X className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />
              Zurück
            </Button>
            <Button
              onClick={confirmCancelCrop}
              variant="destructive"
              className={`gap-2 ${isMobile ? 'w-full h-12 min-h-[48px]' : ''}`}
            >
              <Check className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />
              Ja, verwerfen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
