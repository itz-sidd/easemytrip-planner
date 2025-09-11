interface FoursquareVenue {
  fsq_id: string;
  name: string;
  categories: Array<{
    id: number;
    name: string;
    icon: {
      prefix: string;
      suffix: string;
    };
  }>;
  location: {
    address?: string;
    locality?: string;
    region?: string;
    country?: string;
    formatted_address?: string;
  };
  geocodes: {
    main: {
      latitude: number;
      longitude: number;
    };
  };
  distance?: number;
  rating?: number;
  price?: number;
  photos?: Array<{
    id: string;
    prefix: string;
    suffix: string;
    width: number;
    height: number;
  }>;
}

interface FoursquareResponse {
  results: FoursquareVenue[];
  context: {
    geo_bounds: {
      circle: {
        center: {
          latitude: number;
          longitude: number;
        };
        radius: number;
      };
    };
  };
}

interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  categoryIcon?: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distance?: number;
  rating?: number;
  priceLevel?: number;
  photoUrl?: string;
}

class FoursquareService {
  private readonly baseUrl = 'https://api.foursquare.com/v3';

  async getNearbyPlaces(
    lat: number, 
    lng: number, 
    categories: string[] = [], 
    radius: number = 5000,
    limit: number = 20
  ): Promise<NearbyPlace[]> {
    try {
      // Use Supabase Edge Function to make the API call with the secret key
      const response = await fetch('/api/foursquare-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          lat, 
          lng, 
          categories: categories.join(','),
          radius,
          limit
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch nearby places');
      }

      const data: FoursquareResponse = await response.json();
      
      return data.results.map(venue => ({
        id: venue.fsq_id,
        name: venue.name,
        category: venue.categories[0]?.name || 'Place',
        categoryIcon: venue.categories[0]?.icon ? 
          `${venue.categories[0].icon.prefix}64${venue.categories[0].icon.suffix}` : undefined,
        address: venue.location.formatted_address || venue.location.address || '',
        coordinates: {
          lat: venue.geocodes.main.latitude,
          lng: venue.geocodes.main.longitude
        },
        distance: venue.distance,
        rating: venue.rating,
        priceLevel: venue.price,
        photoUrl: venue.photos?.[0] ? 
          `${venue.photos[0].prefix}300x200${venue.photos[0].suffix}` : undefined
      }));
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      return [];
    }
  }

  async getRestaurants(lat: number, lng: number, limit: number = 10): Promise<NearbyPlace[]> {
    return this.getNearbyPlaces(lat, lng, ['13065'], 2000, limit); // Restaurant category
  }

  async getAttractions(lat: number, lng: number, limit: number = 10): Promise<NearbyPlace[]> {
    return this.getNearbyPlaces(lat, lng, ['16000'], 5000, limit); // Arts & Entertainment category
  }

  async getHotels(lat: number, lng: number, limit: number = 10): Promise<NearbyPlace[]> {
    return this.getNearbyPlaces(lat, lng, ['19014'], 3000, limit); // Hotel category
  }

  async getShops(lat: number, lng: number, limit: number = 10): Promise<NearbyPlace[]> {
    return this.getNearbyPlaces(lat, lng, ['17000'], 2000, limit); // Retail category
  }
}

export const foursquareService = new FoursquareService();
export type { NearbyPlace };