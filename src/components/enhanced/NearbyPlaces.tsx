import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Utensils, Camera, ShoppingBag, Building2, Star, ExternalLink, Navigation } from 'lucide-react';
import { foursquareService, NearbyPlace } from '@/services/foursquareService';
import { LocationSuggestion } from '@/services/geoapifyService';

interface NearbyPlacesProps {
  destination: LocationSuggestion;
  interests: string[];
  className?: string;
}

interface PlaceCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const placeCategories: PlaceCategory[] = [
  {
    id: 'restaurants',
    name: 'Restaurants',
    icon: <Utensils className="h-4 w-4" />,
    description: 'Local dining and cuisine'
  },
  {
    id: 'attractions',
    name: 'Attractions',
    icon: <Camera className="h-4 w-4" />,
    description: 'Tourist attractions and entertainment'
  },
  {
    id: 'hotels',
    name: 'Hotels',
    icon: <Building2 className="h-4 w-4" />,
    description: 'Accommodation options'
  },
  {
    id: 'shops',
    name: 'Shopping',
    icon: <ShoppingBag className="h-4 w-4" />,
    description: 'Retail and local markets'
  }
];

const NearbyPlaces: React.FC<NearbyPlacesProps> = ({
  destination,
  interests,
  className
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('restaurants');
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPlaces = async (category: string) => {
    setIsLoading(true);
    try {
      const { lat, lng } = destination.coordinates;
      let fetchedPlaces: NearbyPlace[] = [];

      switch (category) {
        case 'restaurants':
          fetchedPlaces = await foursquareService.getRestaurants(lat, lng, 8);
          break;
        case 'attractions':
          fetchedPlaces = await foursquareService.getAttractions(lat, lng, 8);
          break;
        case 'hotels':
          fetchedPlaces = await foursquareService.getHotels(lat, lng, 8);
          break;
        case 'shops':
          fetchedPlaces = await foursquareService.getShops(lat, lng, 8);
          break;
      }

      setPlaces(fetchedPlaces);
    } catch (error) {
      console.error('Error fetching places:', error);
      setPlaces([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (destination) {
      fetchPlaces(selectedCategory);
    }
  }, [destination, selectedCategory]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return distance < 1000 ? `${distance}m` : `${(distance / 1000).toFixed(1)}km`;
  };

  const renderPriceLevel = (level?: number) => {
    if (!level) return null;
    return (
      <div className="flex">
        {[...Array(4)].map((_, i) => (
          <span key={i} className={i < level ? 'text-primary' : 'text-muted-foreground'}>
            ₹
          </span>
        ))}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Nearby Places
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Discover what's around {destination.city || destination.formatted}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Selector */}
        <div className="flex flex-wrap gap-2">
          {placeCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(category.id)}
              className="flex items-center gap-2"
            >
              {category.icon}
              {category.name}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Places List */}
        {!isLoading && places.length > 0 && (
          <div className="space-y-3">
            {places.map((place) => (
              <div
                key={place.id}
                className="flex gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                {/* Place Photo or Icon */}
                <div className="flex-shrink-0">
                  {place.photoUrl ? (
                    <img
                      src={place.photoUrl}
                      alt={place.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : place.categoryIcon ? (
                    <img
                      src={place.categoryIcon}
                      alt={place.category}
                      className="w-16 h-16 object-contain rounded-lg bg-muted p-2"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Place Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm leading-5 truncate">{place.name}</h4>
                    {place.distance && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Navigation className="h-3 w-3" />
                        {formatDistance(place.distance)}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1">{place.category}</p>
                  
                  {place.address && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {place.address}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2">
                    {place.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{place.rating.toFixed(1)}</span>
                      </div>
                    )}
                    
                    {place.priceLevel && (
                      <div className="text-xs">
                        {renderPriceLevel(place.priceLevel)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && places.length === 0 && (
          <div className="text-center py-6">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No {placeCategories.find(c => c.id === selectedCategory)?.name.toLowerCase()} found nearby
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try selecting a different category or check back later
            </p>
          </div>
        )}

        {/* Powered by Foursquare */}
        {places.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Place data provided by Foursquare
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NearbyPlaces;