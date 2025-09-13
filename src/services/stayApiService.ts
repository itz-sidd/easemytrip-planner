import { supabase } from "@/integrations/supabase/client";

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  price_per_night: number;
  currency: string;
  images: string[];
  amenities: string[];
  category: 'budget' | 'mid_range' | 'luxury' | 'special';
  coordinates: {
    lat: number;
    lng: number;
  };
  availability: boolean;
}

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  rooms?: number;
  category?: string;
  maxPrice?: number;
  minRating?: number;
}

export interface BookingDetails {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
  };
  rooms: number;
  totalPrice: number;
  currency: string;
}

class StayApiService {
  async searchHotels(params: HotelSearchParams): Promise<Hotel[]> {
    try {
      const { data, error } = await supabase.functions.invoke('stayapi-search', {
        body: {
          destination: params.destination,
          checkin: params.checkIn,
          checkout: params.checkOut,
          adults: params.adults,
          children: params.children || 0,
          rooms: params.rooms || 1,
          category: params.category,
          maxPrice: params.maxPrice,
          minRating: params.minRating
        }
      });

      if (error) {
        console.error('StayAPI search error:', error);
        throw error;
      }

      return data?.hotels || [];
    } catch (error) {
      console.error('Hotel search failed:', error);
      throw error;
    }
  }

  async getHotelDetails(hotelId: string): Promise<Hotel | null> {
    try {
      const { data, error } = await supabase.functions.invoke('stayapi-details', {
        body: { hotelId }
      });

      if (error) {
        console.error('StayAPI details error:', error);
        throw error;
      }

      return data?.hotel || null;
    } catch (error) {
      console.error('Hotel details fetch failed:', error);
      throw error;
    }
  }

  async bookHotel(bookingDetails: BookingDetails): Promise<{ bookingId: string; confirmationNumber: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('stayapi-booking', {
        body: bookingDetails
      });

      if (error) {
        console.error('StayAPI booking error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Hotel booking failed:', error);
      throw error;
    }
  }

  async checkAvailability(hotelId: string, checkIn: string, checkOut: string, rooms: number = 1): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('stayapi-availability', {
        body: {
          hotelId,
          checkin: checkIn,
          checkout: checkOut,
          rooms
        }
      });

      if (error) {
        console.error('StayAPI availability error:', error);
        return false;
      }

      return data?.available || false;
    } catch (error) {
      console.error('Availability check failed:', error);
      return false;
    }
  }
}

export const stayApiService = new StayApiService();