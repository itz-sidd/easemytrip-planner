import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Hotel, Star, MapPin, Wifi, Car, Waves, Coffee, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Hotel {
  id: string;
  destination_id: string;
  name: string;
  category: string;
  rating?: number;
  price_per_night: number;
  address?: string;
  amenities: any;
  images: any;
  description?: string;
  latitude?: number;
  longitude?: number;
}

interface HotelSearchProps {
  destination: any;
  groupType: string | null;
}

const HotelSearch = ({ destination, groupType }: HotelSearchProps) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    maxPrice: '',
    minRating: '',
    sortBy: 'price'
  });

  const categoryLabels = {
    budget: 'Budget',
    mid_range: 'Mid-Range',
    luxury: 'Luxury',
    special: 'Special'
  };

  const amenityIcons = {
    wifi: Wifi,
    parking: Car,
    pool: Waves,
    restaurant: Coffee
  };

  useEffect(() => {
    fetchHotels();
  }, [destination]);

  useEffect(() => {
    applyFilters();
  }, [hotels, filters]);

  const fetchHotels = async () => {
    if (!destination) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('destination_id', destination.id)
        .order('price_per_night');

      if (error) throw error;
      setHotels(data || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      toast({
        title: "Error",
        description: "Failed to load hotels",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...hotels];

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(hotel => hotel.category === filters.category);
    }

    // Filter by price
    if (filters.maxPrice) {
      filtered = filtered.filter(hotel => hotel.price_per_night <= parseFloat(filters.maxPrice));
    }

    // Filter by rating
    if (filters.minRating) {
      filtered = filtered.filter(hotel => (hotel.rating || 0) >= parseFloat(filters.minRating));
    }

    // Sort
    if (filters.sortBy === 'price') {
      filtered.sort((a, b) => a.price_per_night - b.price_per_night);
    } else if (filters.sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setFilteredHotels(filtered);
  };

  const addSampleHotels = async () => {
    if (!destination) return;

      const sampleHotels = [
      {
        destination_id: destination.id,
        name: 'Grand Plaza Hotel',
        category: 'luxury' as const,
        rating: 4.8,
        price_per_night: 299.99,
        address: `123 Main Street, ${destination.name}`,
        amenities: ['wifi', 'parking', 'pool', 'restaurant', 'spa', 'gym'],
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945'],
        description: 'Luxury hotel with stunning city views and world-class amenities'
      },
      {
        destination_id: destination.id,
        name: 'City Center Inn',
        category: 'mid_range' as const,
        rating: 4.2,
        price_per_night: 129.99,
        address: `456 Central Ave, ${destination.name}`,
        amenities: ['wifi', 'parking', 'restaurant'],
        images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791'],
        description: 'Comfortable mid-range hotel in the heart of the city'
      },
      {
        destination_id: destination.id,
        name: 'Budget Traveler Hostel',
        category: 'budget' as const,
        rating: 3.8,
        price_per_night: 29.99,
        address: `789 Backpacker St, ${destination.name}`,
        amenities: ['wifi', 'shared_kitchen'],
        images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d'],
        description: 'Clean and affordable accommodation for budget travelers'
      },
      {
        destination_id: destination.id,
        name: 'Heritage Palace',
        category: 'special' as const,
        rating: 4.9,
        price_per_night: 450.00,
        address: `1 Royal Road, ${destination.name}`,
        amenities: ['wifi', 'parking', 'pool', 'restaurant', 'spa', 'butler'],
        images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'],
        description: 'Historic palace converted into a luxury hotel with unique architecture'
      }
    ];

    try {
      const { error } = await supabase
        .from('hotels')
        .insert(sampleHotels);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Sample hotels added successfully"
      });
      
      fetchHotels();
    } catch (error) {
      console.error('Error adding hotels:', error);
      toast({
        title: "Error",
        description: "Failed to add sample hotels",
        variant: "destructive"
      });
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  if (!destination) {
    return (
      <div className="text-center py-12">
        <Hotel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Select a destination first</h3>
        <p className="text-muted-foreground">Choose your destination to see hotel options</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 bg-muted rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t"></div>
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Find Your Perfect Stay</h2>
        <p className="text-muted-foreground">Discover hotels in {destination.name} that match your preferences</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="mid_range">Mid-Range</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxPrice">Max Price/Night ($)</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="Any price"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="minRating">Min Rating</Label>
              <Select value={filters.minRating} onValueChange={(value) => setFilters(prev => ({ ...prev, minRating: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Rating</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sortBy">Sort By</Label>
              <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price (Low to High)</SelectItem>
                  <SelectItem value="rating">Rating (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilters({ category: 'all', maxPrice: '', minRating: '', sortBy: 'price' })}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredHotels.length === 0 && hotels.length === 0 && (
        <div className="text-center py-12">
          <Hotel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hotels yet</h3>
          <p className="text-muted-foreground mb-4">Add some sample hotels for {destination.name}</p>
          <Button onClick={addSampleHotels}>
            Add Sample Hotels
          </Button>
        </div>
      )}

      {filteredHotels.length === 0 && hotels.length > 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hotels match your filters</h3>
          <p className="text-muted-foreground">Try adjusting your filter criteria</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((hotel) => (
          <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105">
            {hotel.images?.[0] && (
              <div className="h-48 overflow-hidden">
                <img 
                  src={hotel.images[0]} 
                  alt={hotel.name}
                  className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{hotel.name}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`mb-2 ${
                      hotel.category === 'luxury' ? 'border-yellow-500 text-yellow-600' :
                      hotel.category === 'budget' ? 'border-green-500 text-green-600' :
                      hotel.category === 'special' ? 'border-purple-500 text-purple-600' :
                      'border-blue-500 text-blue-600'
                    }`}
                  >
                    {categoryLabels[hotel.category as keyof typeof categoryLabels]}
                  </Badge>
                  {renderStars(hotel.rating)}
                  {hotel.address && (
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {hotel.address}
                    </CardDescription>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">${hotel.price_per_night}</div>
                  <div className="text-sm text-muted-foreground">per night</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {hotel.description && (
                <p className="text-sm text-muted-foreground mb-3">{hotel.description}</p>
              )}
              {hotel.amenities && Array.isArray(hotel.amenities) && hotel.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {hotel.amenities.slice(0, 4).map((amenity: string) => (
                    <Badge key={amenity} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {hotel.amenities.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{hotel.amenities.length - 4} more
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HotelSearch;