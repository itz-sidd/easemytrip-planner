import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Plane, 
  Hotel, 
  Calendar,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  IndianRupee
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import LocationSearchWithLeaflet from '@/components/enhanced/LocationSearchWithLeaflet';
import DestinationInsights from '@/components/enhanced/DestinationInsights';
import NearbyPlaces from '@/components/enhanced/NearbyPlaces';
import { LocationSuggestion } from '@/services/geoapifyService';
import { currencyService } from '@/services/currencyService';

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

interface FormData {
  preferred_group_type: string;
  budget_min: string;
  budget_max: string;
  preferred_hotel_category: string;
  transport_preferences: string[];
  interests: string[];
  dietary_restrictions: string[];
  accessibility_needs: string[];
  departure_date: string;
  return_date: string;
  travelers: string;
}

const EnhancedTravelPlanner: React.FC = () => {
  // State management
  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [selectedGroupType, setSelectedGroupType] = useState<string>('');
  const [groups, setGroups] = useState<TravelerGroup[]>([]);
  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(83);
  
  // Form data
  const [formData, setFormData] = useState<FormData>({
    preferred_group_type: '',
    budget_min: '',
    budget_max: '',
    preferred_hotel_category: '',
    transport_preferences: [],
    interests: [],
    dietary_restrictions: [],
    accessibility_needs: [],
    departure_date: '',
    return_date: '',
    travelers: '1'
  });

  const transportOptions = ['flights', 'railways', 'buses', 'car_rental'];
  const interestOptions = ['culture', 'adventure', 'food', 'nature', 'history', 'nightlife', 'shopping', 'relaxation', 'photography'];
  const dietaryOptions = ['vegetarian', 'vegan', 'gluten_free', 'halal', 'kosher', 'dairy_free'];
  const accessibilityOptions = ['wheelchair_accessible', 'visual_impairment', 'hearing_impairment', 'mobility_assistance', 'service_animal'];

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // Fetch exchange rate
      const rate = await currencyService.getExchangeRate();
      setExchangeRate(rate);

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

  const handleLocationSelect = (location: LocationSuggestion) => {
    setSelectedLocation(location);
  };

  const handleArrayToggle = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to save preferences",
          variant: "destructive"
        });
        return;
      }

      const preferenceData = {
        user_id: user.id,
        preferred_group_type: formData.preferred_group_type as 'solo' | 'student' | 'couple' | 'family' | 'group',
        budget_range: {
          min: parseInt(formData.budget_min) || 0,
          max: parseInt(formData.budget_max) || 0
        },
        preferred_hotel_category: formData.preferred_hotel_category as 'budget' | 'mid_range' | 'luxury' | 'special',
        transport_preferences: formData.transport_preferences,
        interests: formData.interests,
        dietary_restrictions: formData.dietary_restrictions,
        accessibility_needs: formData.accessibility_needs
      };

      // Upsert by user_id to avoid unique constraint or missing row issues
      const { data: upserted, error } = await supabase
        .from('user_preferences')
        .upsert(preferenceData, { onConflict: 'user_id' })
        .select()
        .maybeSingle();

      if (error) throw error;
      if (upserted) setPreferences(upserted as unknown as UserPreference);

      toast({
        title: "Success",
        description: "Travel preferences saved successfully",
      });
      
      setStep(2);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: typeof error === 'string' ? error : (error as any)?.message || 'Failed to save preferences',
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const openEaseMyTripFlights = () => {
    if (!selectedLocation) return;
    
    const searchUrl = `https://www.easemytrip.com/flights.html?from=DEL&to=${selectedLocation.city}&class=0&depart=${formData.departure_date}&return=${formData.return_date}&adults=${formData.travelers}&child=0&infant=0&trip=R`;
    window.open(searchUrl, '_blank');
  };

  const openEaseMyTripHotels = () => {
    if (!selectedLocation) return;
    
    const searchUrl = `https://www.easemytrip.com/hotels/?city=${selectedLocation.city}&checkin=${formData.departure_date}&checkout=${formData.return_date}&guest=${formData.travelers}&room=1`;
    window.open(searchUrl, '_blank');
  };

  const formatBudgetINR = (minUSD: number, maxUSD: number) => {
    const minINR = minUSD * exchangeRate;
    const maxINR = maxUSD * exchangeRate;
    return `${currencyService.formatINR(minINR)} - ${currencyService.formatINR(maxINR)}`;
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const resetPlanner = () => {
    setStep(1);
    setSelectedLocation(null);
    setFormData({
      preferred_group_type: '',
      budget_min: '',
      budget_max: '',
      preferred_hotel_category: '',
      transport_preferences: [],
      interests: [],
      dietary_restrictions: [],
      accessibility_needs: [],
      departure_date: '',
      return_date: '',
      travelers: '1'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Enhanced Travel Planner
            </CardTitle>
            <CardDescription>
              Plan your perfect trip with AI-powered destination insights, real-time photos, and local recommendations
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Progress Indicator */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {i}
                  </div>
                  {i < 4 && <div className={`w-12 h-1 mx-2 ${step > i ? 'bg-primary' : 'bg-muted'}`} />}
                </div>
              ))}
            </div>
            <Progress value={(step / 4) * 100} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>Destination & Preferences</span>
              <span>Travel Style</span>
              <span>Trip Details</span>
              <span>Book & Explore</span>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Enhanced Destination Search & Preferences */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Location Search & Basic Preferences */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Where do you want to go?
                  </CardTitle>
                  <CardDescription>
                    Search for your destination and see it on the map
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LocationSearchWithLeaflet
                    onLocationSelect={handleLocationSelect}
                    selectedLocation={selectedLocation}
                    placeholder="Search for cities, countries, or landmarks..."
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    Budget (in INR)
                  </CardTitle>
                  <CardDescription>
                    Set your travel budget range per person
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget_min">Minimum Budget</Label>
                      <Input
                        id="budget_min"
                        type="number"
                        placeholder="10,000"
                        value={formData.budget_min}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget_min: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="budget_max">Maximum Budget</Label>
                      <Input
                        id="budget_max"
                        type="number"
                        placeholder="50,000"
                        value={formData.budget_max}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget_max: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Exchange rate: 1 USD = ₹{exchangeRate.toFixed(2)}</p>
                    {formData.budget_min && formData.budget_max && (
                      <p>
                        USD equivalent: {formatBudgetINR(
                          parseInt(formData.budget_min) / exchangeRate, 
                          parseInt(formData.budget_max) / exchangeRate
                        )}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Travel Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Hotel Category</Label>
                    <Select 
                      value={formData.preferred_hotel_category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_hotel_category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select hotel preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget">Budget (1-2 Star)</SelectItem>
                        <SelectItem value="mid_range">Mid-range (3 Star)</SelectItem>
                        <SelectItem value="luxury">Luxury (4-5 Star)</SelectItem>
                        <SelectItem value="special">Special/Boutique Hotels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Transportation Preferences</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {transportOptions.map((option) => (
                        <Button
                          key={option}
                          variant={formData.transport_preferences.includes(option) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleArrayToggle('transport_preferences', option)}
                          className="justify-start"
                        >
                          {option.replace('_', ' ')}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Travel Interests</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {interestOptions.map((interest) => (
                        <Badge
                          key={interest}
                          variant={formData.interests.includes(interest) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleArrayToggle('interests', interest)}
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Destination Insights */}
            <div className="space-y-6">
              {selectedLocation ? (
                <>
                  <DestinationInsights
                    destination={selectedLocation}
                    interests={formData.interests}
                  />
                  <NearbyPlaces
                    destination={selectedLocation}
                    interests={formData.interests}
                  />
                </>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        Select a destination
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Choose your travel destination to see beautiful photos, nearby places, and local insights
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Travel Style Selection */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Travel Style</CardTitle>
              <CardDescription>
                Select the travel style that best matches your group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <Card 
                    key={group.id} 
                    className={`cursor-pointer transition-all ${
                      selectedGroupType === group.type 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => {
                      setSelectedGroupType(group.type);
                      setFormData(prev => ({ ...prev, preferred_group_type: group.type }));
                    }}
                  >
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {group.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Trip Details */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Trip Details
              </CardTitle>
              <CardDescription>
                Set your travel dates and group size
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="departure_date">Departure Date</Label>
                  <Input
                    id="departure_date"
                    type="date"
                    value={formData.departure_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, departure_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="return_date">Return Date</Label>
                  <Input
                    id="return_date"
                    type="date"
                    value={formData.return_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, return_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="travelers">Number of Travelers</Label>
                  <Select 
                    value={formData.travelers} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, travelers: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Traveler' : 'Travelers'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedLocation && formData.departure_date && formData.return_date && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Trip Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Destination:</span>
                        <span className="font-medium">{selectedLocation.formatted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Travel Style:</span>
                        <span className="font-medium">{groups.find(g => g.type === selectedGroupType)?.name || 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">
                          {Math.ceil((new Date(formData.return_date).getTime() - new Date(formData.departure_date).getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Travelers:</span>
                        <span className="font-medium">{formData.travelers} {formData.travelers === '1' ? 'person' : 'people'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Budget Range:</span>
                        <span className="font-medium">
                          {formData.budget_min && formData.budget_max 
                            ? `${currencyService.formatINR(parseInt(formData.budget_min))} - ${currencyService.formatINR(parseInt(formData.budget_max))} per person`
                            : 'Not set'
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Booking Options */}
        {step === 4 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ready to Book Your Trip!</CardTitle>
                <CardDescription>
                  Your personalized travel plan is ready. Book flights and hotels through our partner EaseMyTrip.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={openEaseMyTripFlights}
                    disabled={!selectedLocation || !formData.departure_date}
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <Plane className="h-6 w-6" />
                    <div>
                      <div className="font-medium">Book Flights</div>
                      <div className="text-xs opacity-80">Search & compare flights</div>
                    </div>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    onClick={openEaseMyTripHotels}
                    disabled={!selectedLocation || !formData.departure_date}
                    variant="outline"
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <Hotel className="h-6 w-6" />
                    <div>
                      <div className="font-medium">Book Hotels</div>
                      <div className="text-xs opacity-80">Find accommodations</div>
                    </div>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {selectedLocation && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DestinationInsights
                  destination={selectedLocation}
                  interests={formData.interests}
                />
                <NearbyPlaces
                  destination={selectedLocation}
                  interests={formData.interests}
                />
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {step === 4 && (
                  <Button
                    variant="outline"
                    onClick={resetPlanner}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Plan Another Trip
                  </Button>
                )}

                {step === 1 && (
                  <Button
                    onClick={savePreferences}
                    disabled={saving || !selectedLocation}
                    className="flex items-center gap-2"
                  >
                    {saving ? 'Saving...' : 'Save & Continue'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}

                {step > 1 && step < 4 && (
                  <Button
                    onClick={nextStep}
                    disabled={step === 2 && !selectedGroupType}
                    className="flex items-center gap-2"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedTravelPlanner;