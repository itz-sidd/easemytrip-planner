import React, { useState, useEffect, useRef } from 'react';

import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, Search } from 'lucide-react';
import { geoapifyService, LocationSuggestion } from '@/services/geoapifyService';
import { cn } from '@/lib/utils';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Lightweight Leaflet map without react-leaflet to avoid context issues
const LeafletMap: React.FC<{
  center: LatLngExpression;
  zoom: number;
  marker?: [number, number] | null;
}> = ({ center, zoom, marker }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = L.map(containerRef.current, {
      zoomControl: true,
    }).setView(center as any, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(center as any, zoom);
  }, [center, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (marker) {
      if (!markerRef.current) {
        markerRef.current = L.marker(marker).addTo(mapRef.current);
      } else {
        markerRef.current.setLatLng(marker);
      }
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [marker]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

interface LocationSearchWithMapProps {
  onLocationSelect: (location: LocationSuggestion) => void;
  selectedLocation?: LocationSuggestion | null;
  placeholder?: string;
  className?: string;
}

const LocationSearchWithMap: React.FC<LocationSearchWithMapProps> = ({
  onLocationSelect,
  selectedLocation,
  placeholder = "Search for a destination...",
  className
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([20.5937, 78.9629]); // India center
  const [mapZoom, setMapZoom] = useState(5);
  const [mounted, setMounted] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (selectedLocation) {
      setQuery(selectedLocation.formatted);
      setMapCenter([selectedLocation.coordinates.lat, selectedLocation.coordinates.lng]);
      setMapZoom(12);
    }
  }, [selectedLocation]);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await geoapifyService.searchLocations(searchQuery, 8);
      console.log('Search results:', results); // Debug log
      setSuggestions(results);
      if (results.length > 0) {
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    setQuery(suggestion.formatted);
    setShowSuggestions(false);
    onLocationSelect(suggestion);
  };

  const handleCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const location = await geoapifyService.getCurrentLocation();
      if (location) {
        handleSuggestionClick(location);
      }
    } catch (error) {
      console.error('Current location error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="pl-10 pr-12"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCurrentLocation}
            disabled={isLoading}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto">
            <CardContent className="p-0">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{suggestion.city || suggestion.formatted}</div>
                    {suggestion.state && suggestion.country && (
                      <div className="text-sm text-muted-foreground truncate">
                        {suggestion.state}, {suggestion.country}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="h-64 w-full rounded-lg overflow-hidden border">
        {mounted ? (
          <LeafletMap
            center={mapCenter}
            zoom={mapZoom}
            marker={selectedLocation ? [selectedLocation.coordinates.lat, selectedLocation.coordinates.lng] : null}
          />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
      </div>
    </div>
  );
};

export default LocationSearchWithMap;