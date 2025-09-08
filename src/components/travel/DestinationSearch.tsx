import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Star, Globe } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Destination {
  id: string;
  name: string;
  country: string;
  state_province?: string;
  description?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
}

interface DestinationSearchProps {
  onDestinationSelect: (destination: Destination) => void;
  selectedDestination: Destination | null;
}

const DestinationSearch = ({ onDestinationSelect, selectedDestination }: DestinationSearchProps) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = destinations.filter(dest => 
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.state_province?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDestinations(filtered);
    } else {
      setFilteredDestinations(destinations);
    }
  }, [searchQuery, destinations]);

  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('name');

      if (error) throw error;
      setDestinations(data || []);
      setFilteredDestinations(data || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      toast({
        title: "Error",
        description: "Failed to load destinations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSampleDestinations = async () => {
    const sampleDestinations = [
      {
        name: "Paris",
        country: "France",
        description: "The City of Light, famous for its art, fashion, gastronomy and culture",
        image_url: "https://images.unsplash.com/photo-1502602898536-47ad22581b52",
        latitude: 48.8566,
        longitude: 2.3522
      },
      {
        name: "Tokyo",
        country: "Japan",
        description: "A bustling metropolis blending traditional and modern culture",
        image_url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
        latitude: 35.6762,
        longitude: 139.6503
      },
      {
        name: "New York",
        country: "United States",
        state_province: "New York",
        description: "The Big Apple, known for its iconic skyline and cultural diversity",
        image_url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9",
        latitude: 40.7128,
        longitude: -74.0060
      },
      {
        name: "Bali",
        country: "Indonesia",
        description: "Tropical paradise known for its beaches, temples, and rice terraces",
        image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
        latitude: -8.3405,
        longitude: 115.0920
      }
    ];

    try {
      const { error } = await supabase
        .from('destinations')
        .insert(sampleDestinations);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Sample destinations added successfully"
      });
      
      fetchDestinations();
    } catch (error) {
      console.error('Error adding sample destinations:', error);
      toast({
        title: "Error",
        description: "Failed to add sample destinations",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
        <h2 className="text-2xl font-semibold mb-2">Where would you like to go?</h2>
        <p className="text-muted-foreground">Search and select your dream destination</p>
      </div>

      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search destinations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredDestinations.length === 0 && destinations.length === 0 && (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No destinations yet</h3>
          <p className="text-muted-foreground mb-4">Add some sample destinations to get started</p>
          <Button onClick={addSampleDestinations}>
            Add Sample Destinations
          </Button>
        </div>
      )}

      {filteredDestinations.length === 0 && destinations.length > 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No destinations found</h3>
          <p className="text-muted-foreground">Try adjusting your search terms</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations.map((destination) => {
          const isSelected = selectedDestination?.id === destination.id;
          
          return (
            <Card 
              key={destination.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 overflow-hidden ${
                isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
              }`}
              onClick={() => onDestinationSelect(destination)}
            >
              {destination.image_url && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={destination.image_url} 
                    alt={destination.name}
                    className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {destination.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      {destination.state_province && `${destination.state_province}, `}
                      {destination.country}
                    </CardDescription>
                  </div>
                  {isSelected && (
                    <Badge className="bg-primary">Selected</Badge>
                  )}
                </div>
              </CardHeader>
              {destination.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{destination.description}</p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {selectedDestination && (
        <div className="text-center">
          <Button size="lg">
            Continue with {selectedDestination.name}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DestinationSearch;