import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Clock, Plus, Trash2, Eye, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TouristSpot {
  id: string;
  destination_id: string;
  name: string;
  description?: string;
  category?: string;
  entry_fee?: number;
  opening_hours: any;
  latitude?: number;
  longitude?: number;
  images: any;
  rating?: number;
  visit_duration_minutes?: number;
}

interface LocalTransport {
  id: string;
  destination_id: string;
  type: string;
  name: string;
  base_fare?: number;
  per_km_rate?: number;
  description?: string;
  features: any;
}

interface ItineraryDay {
  day: number;
  date?: string;
  activities: {
    time: string;
    spot_id: string;
    spot_name: string;
    duration: number;
    transport?: string;
    notes?: string;
  }[];
}

interface ItineraryBuilderProps {
  destination: any;
  groupType: string | null;
}

const ItineraryBuilder = ({ destination, groupType }: ItineraryBuilderProps) => {
  const [touristSpots, setTouristSpots] = useState<TouristSpot[]>([]);
  const [localTransport, setLocalTransport] = useState<LocalTransport[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [tripDays, setTripDays] = useState(3);
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    if (destination) {
      fetchTouristSpots();
      fetchLocalTransport();
    }
  }, [destination]);

  useEffect(() => {
    initializeItinerary();
  }, [tripDays]);

  const fetchTouristSpots = async () => {
    try {
      const { data, error } = await supabase
        .from('tourist_spots')
        .select('*')
        .eq('destination_id', destination.id)
        .order('rating', { ascending: false });

      if (error) throw error;
      setTouristSpots(data || []);
    } catch (error) {
      console.error('Error fetching tourist spots:', error);
      toast({
        title: "Error",
        description: "Failed to load tourist spots",
        variant: "destructive"
      });
    }
  };

  const fetchLocalTransport = async () => {
    try {
      const { data, error } = await supabase
        .from('local_transport')
        .select('*')
        .eq('destination_id', destination.id);

      if (error) throw error;
      setLocalTransport(data || []);
    } catch (error) {
      console.error('Error fetching local transport:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeItinerary = () => {
    const days: ItineraryDay[] = [];
    for (let i = 1; i <= tripDays; i++) {
      days.push({
        day: i,
        activities: []
      });
    }
    setItinerary(days);
  };

  const addSampleData = async () => {
    if (!destination) return;

    const sampleSpots = [
      {
        destination_id: destination.id,
        name: 'Historical Museum',
        description: 'Learn about the rich history and culture',
        category: 'Museum',
        entry_fee: 15.00,
        opening_hours: { open: '09:00', close: '17:00' },
        images: ['https://images.unsplash.com/photo-1554907984-15263bfd63bd'],
        rating: 4.5,
        visit_duration_minutes: 120
      },
      {
        destination_id: destination.id,
        name: 'Central Park',
        description: 'Beautiful green space perfect for relaxation',
        category: 'Park',
        entry_fee: 0,
        opening_hours: { open: '06:00', close: '22:00' },
        images: ['https://images.unsplash.com/photo-1441974231531-c6227db76b6e'],
        rating: 4.7,
        visit_duration_minutes: 90
      },
      {
        destination_id: destination.id,
        name: 'Local Market',
        description: 'Experience local culture and cuisine',
        category: 'Market',
        entry_fee: 0,
        opening_hours: { open: '08:00', close: '18:00' },
        images: ['https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a'],
        rating: 4.3,
        visit_duration_minutes: 60
      }
    ];

    const sampleTransport = [
      {
        destination_id: destination.id,
        type: 'cab' as const,
        name: 'City Taxis',
        base_fare: 5.00,
        per_km_rate: 2.50,
        description: 'Convenient door-to-door service',
        features: { gps_tracking: true, cashless: true }
      },
      {
        destination_id: destination.id,
        type: 'metro' as const,
        name: 'Metro System',
        base_fare: 2.00,
        per_km_rate: 0.50,
        description: 'Fast and affordable public transport',
        features: { air_conditioned: true, frequent: true }
      }
    ];

    try {
      const { error: spotsError } = await supabase
        .from('tourist_spots')
        .insert(sampleSpots);

      const { error: transportError } = await supabase
        .from('local_transport')
        .insert(sampleTransport);

      if (spotsError || transportError) throw spotsError || transportError;

      toast({
        title: "Success",
        description: "Sample data added successfully"
      });

      fetchTouristSpots();
      fetchLocalTransport();
    } catch (error) {
      console.error('Error adding sample data:', error);
      toast({
        title: "Error",
        description: "Failed to add sample data",
        variant: "destructive"
      });
    }
  };

  const addActivityToDay = (dayIndex: number) => {
    const newActivity = {
      time: '09:00',
      spot_id: '',
      spot_name: '',
      duration: 120,
      transport: '',
      notes: ''
    };

    setItinerary(prev => prev.map((day, index) => 
      index === dayIndex 
        ? { ...day, activities: [...day.activities, newActivity] }
        : day
    ));
  };

  const removeActivityFromDay = (dayIndex: number, activityIndex: number) => {
    setItinerary(prev => prev.map((day, index) => 
      index === dayIndex 
        ? { ...day, activities: day.activities.filter((_, i) => i !== activityIndex) }
        : day
    ));
  };

  const updateActivity = (dayIndex: number, activityIndex: number, field: string, value: any) => {
    setItinerary(prev => prev.map((day, index) => 
      index === dayIndex 
        ? {
            ...day,
            activities: day.activities.map((activity, i) => 
              i === activityIndex 
                ? { 
                    ...activity, 
                    [field]: value,
                    ...(field === 'spot_id' && value ? {
                      spot_name: touristSpots.find(spot => spot.id === value)?.name || ''
                    } : {})
                  }
                : activity
            )
          }
        : day
    ));
  };

  const generateOptimizedItinerary = () => {
    // Simple algorithm to distribute top-rated spots across days
    const topSpots = touristSpots.slice(0, Math.min(tripDays * 2, touristSpots.length));
    const newItinerary = itinerary.map((day, dayIndex) => ({
      ...day,
      activities: topSpots
        .filter((_, spotIndex) => spotIndex % tripDays === dayIndex)
        .map((spot, activityIndex) => ({
          time: `${9 + activityIndex * 3}:00`,
          spot_id: spot.id,
          spot_name: spot.name,
          duration: spot.visit_duration_minutes || 120,
          transport: localTransport[0]?.name || '',
          notes: ''
        }))
    }));

    setItinerary(newItinerary);
    toast({
      title: "Itinerary Generated",
      description: "Auto-generated itinerary based on top-rated spots"
    });
  };

  if (!destination) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Select a destination first</h3>
        <p className="text-muted-foreground">Choose your destination to start building your itinerary</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-muted rounded"></div>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Build Your Itinerary</h2>
        <p className="text-muted-foreground">Create a day-by-day plan for {destination.name}</p>
      </div>

      {/* Trip Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Trip Configuration</CardTitle>
          <CardDescription>Set up your trip details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="trip-days">Number of Days</Label>
              <Select value={tripDays.toString()} onValueChange={(value) => setTripDays(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(day => (
                    <SelectItem key={day} value={day.toString()}>{day} Day{day > 1 ? 's' : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={generateOptimizedItinerary} variant="outline">
                Auto-Generate
              </Button>
            </div>
            <div className="flex items-end">
              {touristSpots.length === 0 && (
                <Button onClick={addSampleData} variant="outline">
                  Add Sample Data
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tourist Spots Reference */}
      {touristSpots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Available Attractions
            </CardTitle>
            <CardDescription>Popular spots in {destination.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {touristSpots.slice(0, 6).map((spot) => (
                <div key={spot.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{spot.name}</h4>
                    {spot.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs">{spot.rating}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{spot.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">{spot.category}</Badge>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.floor((spot.visit_duration_minutes || 120) / 60)}h
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Itinerary */}
      <div className="space-y-4">
        {itinerary.map((day, dayIndex) => (
          <Card key={day.day}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Day {day.day}
                  {startDate && (
                    <span className="text-sm text-muted-foreground">
                      ({new Date(new Date(startDate).getTime() + (day.day - 1) * 24 * 60 * 60 * 1000).toLocaleDateString()})
                    </span>
                  )}
                </div>
                <Button size="sm" onClick={() => addActivityToDay(dayIndex)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Activity
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {day.activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No activities planned for this day</p>
                  <p className="text-sm">Click "Add Activity" to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {day.activities.map((activity, activityIndex) => (
                    <div key={activityIndex} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                      <div>
                        <Label htmlFor={`time-${dayIndex}-${activityIndex}`}>Time</Label>
                        <Input
                          id={`time-${dayIndex}-${activityIndex}`}
                          type="time"
                          value={activity.time}
                          onChange={(e) => updateActivity(dayIndex, activityIndex, 'time', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`spot-${dayIndex}-${activityIndex}`}>Attraction</Label>
                        <Select 
                          value={activity.spot_id} 
                          onValueChange={(value) => updateActivity(dayIndex, activityIndex, 'spot_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select attraction" />
                          </SelectTrigger>
                          <SelectContent>
                            {touristSpots.map(spot => (
                              <SelectItem key={spot.id} value={spot.id}>{spot.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`duration-${dayIndex}-${activityIndex}`}>Duration (min)</Label>
                        <Input
                          id={`duration-${dayIndex}-${activityIndex}`}
                          type="number"
                          value={activity.duration}
                          onChange={(e) => updateActivity(dayIndex, activityIndex, 'duration', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`transport-${dayIndex}-${activityIndex}`}>Transport</Label>
                        <Select 
                          value={activity.transport} 
                          onValueChange={(value) => updateActivity(dayIndex, activityIndex, 'transport', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select transport" />
                          </SelectTrigger>
                          <SelectContent>
                            {localTransport.map(transport => (
                              <SelectItem key={transport.id} value={transport.name}>{transport.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeActivityFromDay(dayIndex, activityIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ItineraryBuilder;