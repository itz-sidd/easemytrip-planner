import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  MapPin, 
  Plane, 
  Hotel, 
  Search, 
  User, 
  Users, 
  Heart, 
  Baby, 
  PartyPopper,
  DollarSign,
  Settings,
  Utensils,
  Calendar,
  ExternalLink
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TravelerGroup {
  id: string;
  type: string;
  name: string;
  description: string;
  preferences: any;
}

interface UserPreference {
  id?: string;
  user_id: string;
  preferred_group_type?: string;
  budget_range: any;
  preferred_hotel_category?: string;
  transport_preferences: any;
  interests: any;
  dietary_restrictions: any;
  accessibility_needs: any;
}

const ConsolidatedTravelPlanner = () => {
  // State management
  const [step, setStep] = useState(1);
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedGroupType, setSelectedGroupType] = useState<string>("");
  const [groups, setGroups] = useState<TravelerGroup[]>([]);
  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    preferred_group_type: '',
    budget_min: '',
    budget_max: '',
    preferred_hotel_category: '',
    transport_preferences: [] as string[],
    interests: [] as string[],
    dietary_restrictions: [] as string[],
    accessibility_needs: [] as string[],
    departure_date: '',
    return_date: '',
    travelers: '1'
  });

  const iconMap = {
    solo: User,
    student: Users,
    couple: Heart,
    family: Baby,
    group: PartyPopper
  };

  const transportOptions = ['flights', 'railways', 'buses', 'car_rental'];
  const interestOptions = ['culture', 'adventure', 'food', 'nature', 'history', 'nightlife', 'shopping', 'relaxation', 'photography'];
  const dietaryOptions = ['vegetarian', 'vegan', 'gluten_free', 'halal', 'kosher', 'dairy_free'];
  const accessibilityOptions = ['wheelchair_accessible', 'visual_impairment', 'hearing_impairment', 'mobility_assistance', 'service_animal'];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch traveler groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('traveler_groups')
        .select('*')
        .order('created_at');

      if (groupsError) throw groupsError;
      setGroups(groupsData || []);

      // Fetch user preferences
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prefsData, error: prefsError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (prefsError && prefsError.code !== 'PGRST116') throw prefsError;

        if (prefsData) {
          setPreferences(prefsData);
          const budgetRange = prefsData.budget_range as any;
          setFormData(prev => ({
            ...prev,
            preferred_group_type: prefsData.preferred_group_type || '',
            budget_min: budgetRange?.min?.toString() || '',
            budget_max: budgetRange?.max?.toString() || '',
            preferred_hotel_category: prefsData.preferred_hotel_category || '',
            transport_preferences: Array.isArray(prefsData.transport_preferences) ? 
              prefsData.transport_preferences.map(String) : [],
            interests: Array.isArray(prefsData.interests) ? 
              prefsData.interests.map(String) : [],
            dietary_restrictions: Array.isArray(prefsData.dietary_restrictions) ? 
              prefsData.dietary_restrictions.map(String) : [],
            accessibility_needs: Array.isArray(prefsData.accessibility_needs) ? 
              prefsData.accessibility_needs.map(String) : []
          }));
          setSelectedGroupType(prefsData.preferred_group_type || '');
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load travel data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save preferences",
          variant: "destructive"
        });
        return;
      }

      const preferenceData = {
        user_id: user.id,
        preferred_group_type: (formData.preferred_group_type || null) as any,
        budget_range: {
          min: parseFloat(formData.budget_min) || 0,
          max: parseFloat(formData.budget_max) || 10000
        } as any,
        preferred_hotel_category: (formData.preferred_hotel_category || null) as any,
        transport_preferences: formData.transport_preferences as any,
        interests: formData.interests as any,
        dietary_restrictions: formData.dietary_restrictions as any,
        accessibility_needs: formData.accessibility_needs as any
      };

      const { error } = await supabase
        .from('user_preferences')
        .upsert(preferenceData, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Preferences saved successfully"
      });

      setStep(step + 1);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleArrayToggle = (
    field: 'transport_preferences' | 'interests' | 'dietary_restrictions' | 'accessibility_needs',
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const openEaseMyTripFlights = () => {
    const url = `https://www.easemytrip.com/flights/search?from=DEL&to=${encodeURIComponent(searchLocation)}&depart=${formData.departure_date}&return=${formData.return_date}&adults=${formData.travelers}&class=Economy`;
    window.open(url, '_blank');
  };

  const openEaseMyTripHotels = () => {
    const url = `https://www.easemytrip.com/hotels/search?checkin=${formData.departure_date}&checkout=${formData.return_date}&city=${encodeURIComponent(searchLocation)}&rooms=1&adults=${formData.travelers}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="h-10 bg-muted rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Travel Planning Assistant</h1>
          <p className="text-muted-foreground text-lg">Plan your perfect trip with personalized recommendations and EaseMyTrip bookings</p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className={`flex items-center ${num < 4 ? 'flex-1' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {num}
                </div>
                {num < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > num ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Search & Preferences</span>
            <span>Travel Style</span>
            <span>Booking Details</span>
            <span>Book with EaseMyTrip</span>
          </div>
        </div>

        {/* Step 1: Location Search & Preferences */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Location Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Where do you want to go?
                </CardTitle>
                <CardDescription>Search for your destination</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter city, country or destination..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10 text-lg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Budget */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Budget Range
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="budget-min">Min Budget ($)</Label>
                    <Input
                      id="budget-min"
                      type="number"
                      placeholder="0"
                      value={formData.budget_min}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget_min: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget-max">Max Budget ($)</Label>
                    <Input
                      id="budget-max"
                      type="number"
                      placeholder="10000"
                      value={formData.budget_max}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget_max: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Hotel Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hotel className="h-4 w-4" />
                    Hotel Preference
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={formData.preferred_hotel_category} onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_hotel_category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budget">Budget</SelectItem>
                      <SelectItem value="mid_range">Mid-Range</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                      <SelectItem value="special">Special</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Transport */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-4 w-4" />
                    Transport
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {transportOptions.map(transport => (
                      <div key={transport} className="flex items-center space-x-2">
                        <Checkbox
                          id={transport}
                          checked={formData.transport_preferences.includes(transport)}
                          onCheckedChange={() => handleArrayToggle('transport_preferences', transport)}
                        />
                        <Label htmlFor={transport} className="text-sm capitalize">
                          {transport.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Interests */}
            <Card>
              <CardHeader>
                <CardTitle>What interests you?</CardTitle>
                <CardDescription>Select your travel interests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {interestOptions.map(interest => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={formData.interests.includes(interest)}
                        onCheckedChange={() => handleArrayToggle('interests', interest)}
                      />
                      <Label htmlFor={interest} className="text-sm capitalize">
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button onClick={() => setStep(2)} size="lg" disabled={!searchLocation}>
                Continue to Travel Style
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Travel Style Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Choose Your Travel Style</h2>
              <p className="text-muted-foreground">Select the type of travel group that best fits your trip</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => {
                const Icon = iconMap[group.type as keyof typeof iconMap] || User;
                const isSelected = selectedGroupType === group.type;
                
                return (
                  <Card 
                    key={group.id} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                      isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setSelectedGroupType(group.type);
                      setFormData(prev => ({ ...prev, preferred_group_type: group.type }));
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">
                            {group.type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">{group.description}</CardDescription>
                      
                      {group.preferences?.focus && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Key Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {group.preferences.focus.map((feature: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={savePreferences} disabled={!selectedGroupType || saving} size="lg">
                {saving ? 'Saving...' : 'Save & Continue'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Booking Details */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Travel Details</h2>
              <p className="text-muted-foreground">Enter your travel dates and details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Departure Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    type="date"
                    value={formData.departure_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, departure_date: e.target.value }))}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Return Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    type="date"
                    value={formData.return_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, return_date: e.target.value }))}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Travelers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={formData.travelers} onValueChange={(value) => setFormData(prev => ({ ...prev, travelers: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Number of travelers" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'Traveler' : 'Travelers'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Trip Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Trip Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Destination</p>
                    <p className="font-medium">{searchLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Travel Style</p>
                    <p className="font-medium">{groups.find(g => g.type === selectedGroupType)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget Range</p>
                    <p className="font-medium">${formData.budget_min} - ${formData.budget_max}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Travelers</p>
                    <p className="font-medium">{formData.travelers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)} disabled={!formData.departure_date || !formData.return_date} size="lg">
                Continue to Booking
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: EaseMyTrip Booking */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Book with EaseMyTrip</h2>
              <p className="text-muted-foreground">Get the best deals on flights and hotels</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    Book Flights
                  </CardTitle>
                  <CardDescription>Find and book the best flight deals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p><strong>Destination:</strong> {searchLocation}</p>
                    <p><strong>Departure:</strong> {formData.departure_date}</p>
                    <p><strong>Return:</strong> {formData.return_date}</p>
                    <p><strong>Travelers:</strong> {formData.travelers}</p>
                  </div>
                  <Button onClick={openEaseMyTripFlights} className="w-full" size="lg">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Search Flights on EaseMyTrip
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hotel className="h-5 w-5" />
                    Book Hotels
                  </CardTitle>
                  <CardDescription>Find and book the perfect accommodation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p><strong>Location:</strong> {searchLocation}</p>
                    <p><strong>Check-in:</strong> {formData.departure_date}</p>
                    <p><strong>Check-out:</strong> {formData.return_date}</p>
                    <p><strong>Category:</strong> {formData.preferred_hotel_category}</p>
                  </div>
                  <Button onClick={openEaseMyTripHotels} className="w-full" size="lg">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Search Hotels on EaseMyTrip
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Booking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Use the links above to book your flights and hotels on EaseMyTrip. 
                    They offer competitive prices and excellent customer service.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Plan Another Trip
                    </Button>
                    <Button onClick={() => setStep(3)}>
                      Modify Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsolidatedTravelPlanner;