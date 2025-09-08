-- Create enum types for better data consistency
CREATE TYPE public.traveler_group_type AS ENUM ('solo', 'student', 'couple', 'family', 'group');
CREATE TYPE public.transport_type AS ENUM ('flight', 'railway', 'bus', 'metro');
CREATE TYPE public.hotel_category AS ENUM ('budget', 'mid_range', 'luxury', 'special');
CREATE TYPE public.local_transport_type AS ENUM ('cab', 'bike', 'metro', 'tuk_tuk', 'bus');

-- Create destinations table
CREATE TABLE public.destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  state_province TEXT,
  description TEXT,
  image_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create traveler groups table for personalization
CREATE TABLE public.traveler_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type traveler_group_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transport options table
CREATE TABLE public.transport_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type transport_type NOT NULL,
  from_destination_id UUID REFERENCES public.destinations(id),
  to_destination_id UUID REFERENCES public.destinations(id),
  provider TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER,
  departure_time TIME,
  arrival_time TIME,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hotels table
CREATE TABLE public.hotels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id UUID REFERENCES public.destinations(id) NOT NULL,
  name TEXT NOT NULL,
  category hotel_category NOT NULL,
  rating DECIMAL(2, 1) CHECK (rating >= 1 AND rating <= 5),
  price_per_night DECIMAL(10, 2) NOT NULL,
  address TEXT,
  amenities JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tourist spots table
CREATE TABLE public.tourist_spots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id UUID REFERENCES public.destinations(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  entry_fee DECIMAL(10, 2) DEFAULT 0,
  opening_hours JSONB,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  images JSONB DEFAULT '[]',
  rating DECIMAL(2, 1) CHECK (rating >= 1 AND rating <= 5),
  visit_duration_minutes INTEGER DEFAULT 120,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create local transport options table
CREATE TABLE public.local_transport (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id UUID REFERENCES public.destinations(id) NOT NULL,
  type local_transport_type NOT NULL,
  name TEXT NOT NULL,
  base_fare DECIMAL(10, 2),
  per_km_rate DECIMAL(10, 2),
  description TEXT,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create travel packages table
CREATE TABLE public.travel_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  destination_id UUID REFERENCES public.destinations(id) NOT NULL,
  traveler_group_type traveler_group_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  total_days INTEGER NOT NULL,
  total_price DECIMAL(12, 2),
  itinerary JSONB NOT NULL DEFAULT '[]',
  included_hotels JSONB DEFAULT '[]',
  included_transport JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user preferences table
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  preferred_group_type traveler_group_type,
  budget_range JSONB DEFAULT '{"min": 0, "max": 10000}',
  preferred_hotel_category hotel_category,
  transport_preferences JSONB DEFAULT '[]',
  interests JSONB DEFAULT '[]',
  dietary_restrictions JSONB DEFAULT '[]',
  accessibility_needs JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traveler_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourist_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_transport ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access on reference data
CREATE POLICY "Anyone can view destinations" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Anyone can view traveler groups" ON public.traveler_groups FOR SELECT USING (true);
CREATE POLICY "Anyone can view transport options" ON public.transport_options FOR SELECT USING (true);
CREATE POLICY "Anyone can view hotels" ON public.hotels FOR SELECT USING (true);
CREATE POLICY "Anyone can view tourist spots" ON public.tourist_spots FOR SELECT USING (true);
CREATE POLICY "Anyone can view local transport" ON public.local_transport FOR SELECT USING (true);

-- Create RLS policies for user-specific data
CREATE POLICY "Users can view their own travel packages" ON public.travel_packages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own travel packages" ON public.travel_packages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own travel packages" ON public.travel_packages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own travel packages" ON public.travel_packages FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON public.destinations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transport_options_updated_at BEFORE UPDATE ON public.transport_options FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON public.hotels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tourist_spots_updated_at BEFORE UPDATE ON public.tourist_spots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_travel_packages_updated_at BEFORE UPDATE ON public.travel_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial traveler group types
INSERT INTO public.traveler_groups (type, name, description, preferences) VALUES
('solo', 'Solo Traveler', 'Adventure, budget stays, flexible itineraries', '{"focus": ["adventure", "budget", "flexibility"], "accommodation": ["hostels", "budget_hotels"], "activities": ["hiking", "cultural_sites", "local_experiences"]}'),
('student', 'Student Group/Individual', 'Affordable travel, group discounts, hostels', '{"focus": ["budget", "group_discounts", "social"], "accommodation": ["hostels", "dorms"], "activities": ["museums", "nightlife", "group_tours"]}'),
('couple', 'Couples', 'Romantic getaways, cozy hotels, unique experiences', '{"focus": ["romance", "unique_experiences", "privacy"], "accommodation": ["boutique_hotels", "resorts"], "activities": ["romantic_dinners", "spa", "scenic_views"]}'),
('family', 'Family (3-12 members)', 'Family-friendly stays, safe transport, kid-friendly activities', '{"focus": ["family_friendly", "safety", "convenience"], "accommodation": ["family_rooms", "resorts"], "activities": ["theme_parks", "educational", "outdoor_activities"]}'),
('group', 'Group (friends/professionals)', 'Nightlife, team trips, large tour packages', '{"focus": ["group_activities", "nightlife", "team_building"], "accommodation": ["group_bookings", "party_friendly"], "activities": ["nightlife", "adventure_sports", "group_tours"]}');

-- Create indexes for better performance
CREATE INDEX idx_destinations_country ON public.destinations(country);
CREATE INDEX idx_transport_options_route ON public.transport_options(from_destination_id, to_destination_id, type);
CREATE INDEX idx_hotels_destination ON public.hotels(destination_id, category);
CREATE INDEX idx_tourist_spots_destination ON public.tourist_spots(destination_id);
CREATE INDEX idx_travel_packages_user ON public.travel_packages(user_id);
CREATE INDEX idx_user_preferences_user ON public.user_preferences(user_id);