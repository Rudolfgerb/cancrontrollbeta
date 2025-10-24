import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, DollarSign, Shield, Camera } from 'lucide-react';
import { Spot } from '@/contexts/GameContext';

interface GoogleMapViewProps {
  spots: Spot[];
  onSpotSelect: (spot: Spot) => void;
  onOpenStreetView: (spot: Spot) => void;
}

const containerStyle = {
  width: '100%',
  height: '600px',
};

// Berlin center
const defaultCenter = {
  lat: 52.520008,
  lng: 13.404954,
};

// Convert spot difficulty to marker color
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return '#84cc16'; // neon-lime
    case 'medium': return '#22d3ee'; // neon-cyan
    case 'hard': return '#fb923c'; // neon-orange
    case 'extreme': return '#ec4899'; // primary/pink
    default: return '#84cc16';
  }
};

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  spots,
  onSpotSelect,
  onOpenStreetView,
}) => {
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (spot: Spot) => {
    setSelectedSpot(spot);
  };

  const handleInfoWindowClose = () => {
    setSelectedSpot(null);
  };

  const handlePaintSpot = (spot: Spot) => {
    onSpotSelect(spot);
    setSelectedSpot(null);
  };

  const handleOpenStreetView = (spot: Spot) => {
    onOpenStreetView(spot);
    setSelectedSpot(null);
  };

  // Convert spots to map positions (using x,y as relative coordinates around Berlin)
  const getSpotsWithCoordinates = () => {
    return spots.map(spot => ({
      ...spot,
      position: {
        // Spread spots around Berlin area
        // x: 0-100 maps to lng offset, y: 0-100 maps to lat offset
        lat: defaultCenter.lat + ((spot.y - 50) / 100) * 0.1, // ~10km range
        lng: defaultCenter.lng + ((spot.x - 50) / 100) * 0.1,
      }
    }));
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
        <div className="text-muted-foreground">Lade Google Maps...</div>
      </Card>
    );
  }

  const spotsWithCoords = getSpotsWithCoordinates();

  return (
    <div className="w-full rounded-lg overflow-hidden border-2 border-urban-border">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
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
          ],
          streetViewControl: false,
          fullscreenControl: true,
          mapTypeControl: false,
        }}
      >
        {spotsWithCoords.map((spot) => (
          <Marker
            key={spot.id}
            position={spot.position}
            onClick={() => handleMarkerClick(spot)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: spot.painted ? 8 : 12,
              fillColor: spot.painted ? '#84cc16' : getDifficultyColor(spot.difficulty),
              fillOpacity: spot.painted ? 0.6 : 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
          />
        ))}

        {selectedSpot && (
          <InfoWindow
            position={spotsWithCoords.find(s => s.id === selectedSpot.id)?.position || defaultCenter}
            onCloseClick={handleInfoWindowClose}
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

              <div className="flex gap-4 mb-3 text-sm text-gray-700">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-orange-500" />
                  <span className="font-bold">{selectedSpot.fameReward}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="font-bold">{selectedSpot.moneyReward}</span>
                </div>
              </div>

              {selectedSpot.hasGuard && (
                <div className="flex items-center gap-2 text-xs text-red-600 mb-3 bg-red-50 p-2 rounded">
                  <Shield className="w-4 h-4" />
                  <span className="font-bold">Bewacht!</span>
                </div>
              )}

              {selectedSpot.painted && (
                <div className="text-xs text-green-600 mb-3 bg-green-50 p-2 rounded font-bold">
                  ✓ Bereits bemalt
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenStreetView(selectedSpot)}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Street View
                </button>
                {!selectedSpot.painted && (
                  <button
                    onClick={() => handlePaintSpot(selectedSpot)}
                    className="flex-1 px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold rounded"
                  >
                    Malen
                  </button>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};
