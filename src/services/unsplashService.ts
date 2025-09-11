interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description?: string;
  description?: string;
  user: {
    name: string;
    username: string;
  };
}

interface UnsplashResponse {
  results: UnsplashPhoto[];
  total: number;
}

interface DestinationPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  altText: string;
  photographer: string;
  photographerUsername: string;
}

class UnsplashService {
  private readonly baseUrl = 'https://api.unsplash.com';

  async getDestinationPhotos(
    destination: string, 
    interests: string[] = [], 
    count: number = 6
  ): Promise<DestinationPhoto[]> {
    try {
      // Create search query combining destination with interests
      const interestTerms = interests.length > 0 ? interests.join(' ') : 'travel tourism';
      const searchQuery = `${destination} ${interestTerms}`;

      // Use Supabase Edge Function to make the API call with the secret key
      const response = await fetch('/api/unsplash-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          query: searchQuery, 
          per_page: count,
          orientation: 'landscape'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch destination photos');
      }

      const data: UnsplashResponse = await response.json();
      
      return data.results.map(photo => ({
        id: photo.id,
        url: photo.urls.regular,
        thumbnailUrl: photo.urls.small,
        altText: photo.alt_description || photo.description || `${destination} travel photo`,
        photographer: photo.user.name,
        photographerUsername: photo.user.username
      }));
    } catch (error) {
      console.error('Error fetching destination photos:', error);
      return [];
    }
  }

  async getHeroPhoto(destination: string): Promise<DestinationPhoto | null> {
    try {
      const photos = await this.getDestinationPhotos(destination, ['landscape', 'cityscape'], 1);
      return photos.length > 0 ? photos[0] : null;
    } catch (error) {
      console.error('Error fetching hero photo:', error);
      return null;
    }
  }
}

export const unsplashService = new UnsplashService();
export type { DestinationPhoto };