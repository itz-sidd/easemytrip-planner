import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Plane, Train, Bus, Navigation, Clock, DollarSign, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TransportOption {
  id: string;
  type: string;
  from_destination_id?: string;
  to_destination_id?: string;
  provider: string;
  price: number;
  duration_minutes?: number;
  departure_time?: string;
  arrival_time?: string;
  features: any;
}

interface TransportOptionsProps {
  destination: any;
  groupType: string | null;
}

const TransportOptions = ({ destination, groupType }: TransportOptionsProps) => {
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<TransportOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    maxPrice: '',
    sortBy: 'price'
  });

  const transportIcons = {
    flight: Plane,
    railway: Train,
    bus: Bus,
    metro: Navigation
  };

  useEffect(() => {
    fetchTransportOptions();
  }, [destination]);

  useEffect(() => {
    applyFilters();
  }, [transportOptions, filters]);

  const fetchTransportOptions = async () => {
    if (!destination) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transport_options')
        .select('*')
        .or(`to_destination_id.eq.${destination.id},from_destination_id.eq.${destination.id}`)
        .order('price');

      if (error) throw error;
      setTransportOptions(data || []);
    } catch (error) {
      console.error('Error fetching transport options:', error);
      toast({
        title: "Error",
        description: "Failed to load transport options",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transportOptions];

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(option => option.type === filters.type);
    }

    // Filter by price
    if (filters.maxPrice) {
      filtered = filtered.filter(option => option.price <= parseFloat(filters.maxPrice));
    }

    // Sort
    if (filters.sortBy === 'price') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'duration') {
      filtered.sort((a, b) => (a.duration_minutes || 0) - (b.duration_minutes || 0));
    }

    setFilteredOptions(filtered);
  };

  const addSampleTransportOptions = async () => {
    if (!destination) return;

    const sampleOptions = [
      {
        type: 'flight' as const,
        to_destination_id: destination.id,
        provider: 'AirAsia',
        price: 299.99,
        duration_minutes: 180,
        departure_time: '08:00',
        arrival_time: '11:00',
        features: { baggage: '20kg', meals: true, wifi: true }
      },
      {
        type: 'flight' as const,
        to_destination_id: destination.id,
        provider: 'Emirates',
        price: 599.99,
        duration_minutes: 165,
        departure_time: '14:30',
        arrival_time: '17:15',
        features: { baggage: '30kg', meals: true, wifi: true, entertainment: true }
      },
      {
        type: 'railway' as const,
        to_destination_id: destination.id,
        provider: 'Express Rail',
        price: 89.99,
        duration_minutes: 360,
        departure_time: '06:00',
        arrival_time: '12:00',
        features: { meals: true, wifi: false, sleeper: true }
      }
    ];

    try {
      const { error } = await supabase
        .from('transport_options')
        .insert(sampleOptions);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Sample transport options added"
      });
      
      fetchTransportOptions();
    } catch (error) {
      console.error('Error adding transport options:', error);
      toast({
        title: "Error",
        description: "Failed to add sample options",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (!destination) {
    return (
      <div className="text-center py-12">
        <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Select a destination first</h3>
        <p className="text-muted-foreground">Choose your destination to see transport options</p>
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
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
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
        <h2 className="text-2xl font-semibold mb-2">Choose Your Transport</h2>
        <p className="text-muted-foreground">Find the best way to reach {destination.name}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="type">Transport Type</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="flight">Flights</SelectItem>
                  <SelectItem value="railway">Railways</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxPrice">Max Price ($)</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="Any price"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="sortBy">Sort By</Label>
              <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price (Low to High)</SelectItem>
                  <SelectItem value="duration">Duration (Shortest)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilters({ type: 'all', maxPrice: '', sortBy: 'price' })}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredOptions.length === 0 && transportOptions.length === 0 && (
        <div className="text-center py-12">
          <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No transport options yet</h3>
          <p className="text-muted-foreground mb-4">Add some sample transport options for {destination.name}</p>
          <Button onClick={addSampleTransportOptions}>
            Add Sample Options
          </Button>
        </div>
      )}

      {filteredOptions.length === 0 && transportOptions.length > 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No options match your filters</h3>
          <p className="text-muted-foreground">Try adjusting your filter criteria</p>
        </div>
      )}

      <div className="space-y-4">
        {filteredOptions.map((option) => {
          const Icon = transportIcons[option.type as keyof typeof transportIcons] || Navigation;
          
          return (
            <Card key={option.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/20">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{option.provider}</CardTitle>
                      <CardDescription>
                        <Badge variant="outline" className="mr-2">
                          {option.type}
                        </Badge>
                        {option.departure_time && option.arrival_time && (
                          <span>{option.departure_time} - {option.arrival_time}</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">${option.price}</div>
                    {option.duration_minutes && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(option.duration_minutes)}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              {option.features && Object.keys(option.features).length > 0 && (
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(option.features).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key}: {String(value)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TransportOptions;