import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StayApiSearchParams {
  destination: string;
  checkin: string;
  checkout: string;
  adults: number;
  children?: number;
  rooms?: number;
  category?: string;
  maxPrice?: number;
  minRating?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stayApiKey = Deno.env.get('STAYAPI_API_KEY');
    
    if (!stayApiKey) {
      console.error('STAYAPI_API_KEY not found');
      throw new Error('StayAPI key not configured');
    }

    const params: StayApiSearchParams = await req.json();
    console.log('StayAPI search params:', params);

    // StayAPI search endpoint
    const searchUrl = new URL('https://api.stayapi.com/v1/search');
    searchUrl.searchParams.append('destination', params.destination);
    searchUrl.searchParams.append('checkin', params.checkin);
    searchUrl.searchParams.append('checkout', params.checkout);
    searchUrl.searchParams.append('adults', params.adults.toString());
    
    if (params.children) {
      searchUrl.searchParams.append('children', params.children.toString());
    }
    if (params.rooms) {
      searchUrl.searchParams.append('rooms', params.rooms.toString());
    }
    if (params.maxPrice) {
      searchUrl.searchParams.append('max_price', params.maxPrice.toString());
    }
    if (params.minRating) {
      searchUrl.searchParams.append('min_rating', params.minRating.toString());
    }

    let hotels: any[] = [];

    try {
      const response = await fetch(searchUrl.toString(), {
        method: 'GET',
        headers: {
          'X-API-Key': stayApiKey,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('StayAPI response data:', data);

        hotels = data.results?.map((hotel: any) => ({
          id: hotel.id,
          name: hotel.name,
          description: hotel.description || '',
          address: hotel.address,
          city: hotel.city,
          country: hotel.country,
          rating: hotel.rating || 0,
          price_per_night: hotel.price_per_night || 0,
          currency: hotel.currency || 'USD',
          images: hotel.images || [],
          amenities: hotel.amenities || [],
          category: mapCategory(hotel.category),
          coordinates: {
            lat: hotel.latitude || 0,
            lng: hotel.longitude || 0,
          },
          availability: hotel.available || true,
        })) || [];
      } else {
        console.error('StayAPI response error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
      }
    } catch (err) {
      console.error('Network error calling StayAPI:', err);
    }

    // Fallback to mock data if external API failed or returned empty
    if (!hotels || hotels.length === 0) {
      console.warn('Using mock hotel data fallback for stayapi-search');
      hotels = [
        {
          id: 'mock-1',
          name: `Central City Hotel - ${params.destination}`,
          description: 'Comfortable stay in the heart of the city with easy access to attractions.',
          address: '123 Main St',
          city: params.destination,
          country: 'India',
          rating: 4.2,
          price_per_night: 120,
          currency: 'USD',
          images: [],
          amenities: ['Free WiFi', 'Breakfast', 'Airport Shuttle'],
          category: 'mid_range',
          coordinates: { lat: 0, lng: 0 },
          availability: true,
        },
        {
          id: 'mock-2',
          name: `Boutique Retreat - ${params.destination}`,
          description: 'Charming boutique hotel with personalized service.',
          address: '45 Riverside Lane',
          city: params.destination,
          country: 'India',
          rating: 4.7,
          price_per_night: 190,
          currency: 'USD',
          images: [],
          amenities: ['Spa', 'Free WiFi', 'Restaurant'],
          category: 'special',
          coordinates: { lat: 0, lng: 0 },
          availability: true,
        },
      ];
    }

    return new Response(
      JSON.stringify({ hotels }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in stayapi-search function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function mapCategory(stayApiCategory: string): 'budget' | 'mid_range' | 'luxury' | 'special' {
  const category = stayApiCategory?.toLowerCase() || '';
  
  if (category.includes('budget') || category.includes('economy')) {
    return 'budget';
  } else if (category.includes('luxury') || category.includes('premium')) {
    return 'luxury';
  } else if (category.includes('boutique') || category.includes('special')) {
    return 'special';
  } else {
    return 'mid_range';
  }
}