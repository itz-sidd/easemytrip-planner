import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Camera, MapPin, Users, Star, ExternalLink } from 'lucide-react';
import { unsplashService, DestinationPhoto } from '@/services/unsplashService';
import { LocationSuggestion } from '@/services/geoapifyService';

interface DestinationInsightsProps {
  destination: LocationSuggestion;
  interests: string[];
  className?: string;
}

const DestinationInsights: React.FC<DestinationInsightsProps> = ({
  destination,
  interests,
  className
}) => {
  const [photos, setPhotos] = useState<DestinationPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<DestinationPhoto | null>(null);

  useEffect(() => {
    const fetchDestinationPhotos = async () => {
      setIsLoading(true);
      try {
        const fetchedPhotos = await unsplashService.getDestinationPhotos(
          destination.city || destination.formatted,
          interests,
          6
        );
        setPhotos(fetchedPhotos);
        if (fetchedPhotos.length > 0) {
          setSelectedPhoto(fetchedPhotos[0]);
        }
      } catch (error) {
        console.error('Error fetching destination photos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDestinationPhotos();
  }, [destination, interests]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="grid grid-cols-3 gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          {destination.city || destination.formatted}
        </CardTitle>
        {destination.country && (
          <p className="text-sm text-muted-foreground">{destination.country}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Photo */}
        {selectedPhoto && (
          <div className="relative">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.altText}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              <div className="flex items-center gap-1">
                <Camera className="h-3 w-3" />
                Photo by {selectedPhoto.photographer}
              </div>
            </div>
          </div>
        )}

        {/* Photo Thumbnails */}
        {photos.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {photos.slice(0, 5).map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedPhoto?.id === photo.id 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-transparent hover:border-border'
                }`}
              >
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.altText}
                  className="w-full h-full object-cover"
                />
                {index === 4 && photos.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-medium">
                    +{photos.length - 4}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Destination Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Lat: {destination.coordinates.lat.toFixed(4)}, 
              Lng: {destination.coordinates.lng.toFixed(4)}
            </span>
          </div>

          {interests.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Your Travel Interests</h4>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Camera className="h-4 w-4" />
                Photos Found
              </div>
              <div className="font-semibold">{photos.length}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4" />
                Country
              </div>
              <div className="font-semibold text-xs">
                {destination.countryCode?.toUpperCase() || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* View More Photos Link */}
        {photos.length > 0 && (
          <div className="pt-2 border-t">
            <a
              href={`https://unsplash.com/s/photos/${encodeURIComponent(destination.city || destination.formatted)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View more photos on Unsplash
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DestinationInsights;