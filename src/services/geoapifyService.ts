interface GeoapifyFeature {
  properties: {
    formatted: string;
    city?: string;
    state?: string;
    country?: string;
    country_code?: string;
    lat: number;
    lon: number;
    place_id: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface GeoapifyResponse {
  features: GeoapifyFeature[];
}

interface LocationSuggestion {
  id: string;
  formatted: string;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

class GeoapifyService {
  private readonly apiKey: string = ''; // Will be fetched from Supabase Edge Function
  private readonly baseUrl = 'https://api.geoapify.com/v1';

  async searchLocations(query: string, limit: number = 5): Promise<LocationSuggestion[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      // Use Supabase Edge Function to make the API call with the secret key
      const response = await fetch('/api/geoapify-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, limit })
      });

      if (!response.ok) {
        throw new Error('Failed to search locations');
      }

      const data: GeoapifyResponse = await response.json();
      
      return data.features.map(feature => ({
        id: feature.properties.place_id,
        formatted: feature.properties.formatted,
        city: feature.properties.city,
        state: feature.properties.state,
        country: feature.properties.country,
        countryCode: feature.properties.country_code,
        coordinates: {
          lat: feature.properties.lat,
          lng: feature.properties.lon
        }
      }));
    } catch (error) {
      console.error('Error searching locations:', error);
      return [];
    }
  }

  async getCurrentLocation(): Promise<LocationSuggestion | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch('/api/geoapify-reverse', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ lat: latitude, lng: longitude })
            });

            if (!response.ok) {
              resolve(null);
              return;
            }

            const data: GeoapifyResponse = await response.json();
            if (data.features.length > 0) {
              const feature = data.features[0];
              resolve({
                id: feature.properties.place_id,
                formatted: feature.properties.formatted,
                city: feature.properties.city,
                state: feature.properties.state,
                country: feature.properties.country,
                countryCode: feature.properties.country_code,
                coordinates: {
                  lat: feature.properties.lat,
                  lng: feature.properties.lon
                }
              });
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error('Error reverse geocoding:', error);
            resolve(null);
          }
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }
}

export const geoapifyService = new GeoapifyService();
export type { LocationSuggestion };