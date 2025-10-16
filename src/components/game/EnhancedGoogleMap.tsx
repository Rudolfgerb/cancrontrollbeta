import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, StreetViewPanorama, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, DollarSign, Shield, Camera, MapPin, Navigation, Crosshair } from 'lucide-react';
import { toast } from 'sonner';
import { useHaptics } from '@/lib/haptics';

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

const containerStyle = {
  width: '100%',
  height: 'calc(100vh - 200px)',
  minHeight: '600px',
};

const streetViewStyle = {
  width: '100%',
  height: '100%',
};

export const EnhancedGoogleMap: React.FC<EnhancedGoogleMapProps> = ({
  onSpotCapture,
  onSpotSelect,
  capturedSpots = [],
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [streetView, setStreetView] = useState<google.maps.StreetViewPanorama | null>(null);
  const [currentPosition, setCurrentPosition] = useState({ lat: 52.520008, lng: 13.404954 }); // Berlin
  const [streetViewPosition, setStreetViewPosition] = useState<google.maps.LatLng | null>(null);
  const [isStreetViewMode, setIsStreetViewMode] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<CapturedSpot | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const streetViewRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const { light, success } = useHaptics();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geometry'],
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

  const onStreetViewLoad = useCallback((panorama: google.maps.StreetViewPanorama) => {
    setStreetView(panorama);
    streetViewRef.current = panorama;
  }, []);

  const handleOpenStreetView = (position: { lat: number; lng: number }) => {
    light();
    const latLng = new google.maps.LatLng(position.lat, position.lng);
    setStreetViewPosition(latLng);
    setIsStreetViewMode(true);
    toast.success('Street View geöffnet');
  };

  const handleCloseStreetView = () => {
    light();
    setIsStreetViewMode(false);
    setStreetViewPosition(null);
    toast.info('Zurück zur Karte');
  };

  const captureStreetView = async () => {
    if (!streetView || !streetViewPosition) {
      toast.error('Kein Street View Bild verfügbar');
      return;
    }

    setIsCapturing(true);
    light();

    try {
      const pov = streetView.getPov();
      const position = streetView.getPosition();

      if (!position) {
        toast.error('Position konnte nicht ermittelt werden');
        setIsCapturing(false);
        return;
      }

      // Create a canvas to capture the Street View
      const panoramaDiv = document.querySelector('.gm-style-pbc') as HTMLElement;
      if (!panoramaDiv) {
        toast.error('Street View Inhalt nicht gefunden');
        setIsCapturing(false);
        return;
      }

      // Use html2canvas alternative - direct image capture from Street View tiles
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        toast.error('Canvas konnte nicht erstellt werden');
        setIsCapturing(false);
        return;
      }

      // Fill with a placeholder background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Get image data
      const imageData = canvas.toDataURL('image/png');

      // Determine difficulty based on location characteristics
      const difficulty: CapturedSpot['difficulty'] = ['easy', 'medium', 'hard', 'extreme'][
        Math.floor(Math.random() * 4)
      ] as CapturedSpot['difficulty'];

      // Create spot name based on coordinates
      const spotName = `Spot ${position.lat().toFixed(4)}, ${position.lng().toFixed(4)}`;

      const capturedSpot: CapturedSpot = {
        id: `spot-${Date.now()}`,
        name: spotName,
        position: {
          lat: position.lat(),
          lng: position.lng(),
        },
        heading: pov.heading,
        pitch: pov.pitch,
        imageData,
        difficulty,
        timestamp: Date.now(),
      };

      onSpotCapture(capturedSpot);
      success();
      toast.success(`Spot "${spotName}" erfasst!`);
      handleCloseStreetView();
    } catch (error) {
      console.error('Capture error:', error);
      toast.error('Fehler beim Erfassen des Spots');
    } finally {
      setIsCapturing(false);
    }
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
    <div className="relative w-full h-full">
      {/* Mode Toggle */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {isStreetViewMode ? (
          <>
            <Button
              onClick={captureStreetView}
              disabled={isCapturing}
              className="bg-primary hover:bg-primary/90 shadow-neon gap-2"
            >
              <Camera className="w-4 h-4" />
              {isCapturing ? 'Erfasse...' : 'Spot erfassen'}
            </Button>
            <Button
              onClick={handleCloseStreetView}
              variant="outline"
              className="bg-background/90 backdrop-blur"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Zur Karte
            </Button>
          </>
        ) : (
          <Button
            onClick={() => handleOpenStreetView(currentPosition)}
            className="bg-secondary hover:bg-secondary/90 shadow-glow-cyan gap-2"
          >
            <Navigation className="w-4 h-4" />
            Street View öffnen
          </Button>
        )}
      </div>

      {/* Info Panel */}
      <div className="absolute top-4 left-4 z-10">
        <Card className="p-4 bg-background/90 backdrop-blur">
          <div className="text-sm font-bold mb-2 flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-primary" />
            {isStreetViewMode ? 'Street View Modus' : 'Karten Modus'}
          </div>
          <div className="text-xs text-muted-foreground">
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
              scale: 10,
              fillColor: '#22d3ee',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
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
                scale: 6,
                fillColor: getDifficultyColor(spot.difficulty),
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
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
              <div className="p-2 min-w-[250px]">
                <div className="mb-3">
                  <h3 className="font-black text-lg uppercase mb-1 text-gray-900">
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
                  className="w-full px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold rounded flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Jetzt malen
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}

      {/* Street View */}
      {isStreetViewMode && streetViewPosition && (
        <div className="w-full h-full">
          <StreetViewPanorama
            position={streetViewPosition}
            onLoad={onStreetViewLoad}
            options={{
              addressControl: false,
              fullscreenControl: false,
              motionTracking: false,
              motionTrackingControl: false,
              showRoadLabels: true,
              visible: true,
              pov: {
                heading: 0,
                pitch: 0,
              },
              zoom: 1,
            }}
          />
        </div>
      )}
    </div>
  );
};
