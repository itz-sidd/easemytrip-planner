import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { Settings, DollarSign, Heart, Utensils } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UserPreference {
  id: string;
  user_id: string;
  preferred_group_type?: string;
  budget_range: any;
  preferred_hotel_category?: string;
  transport_preferences: any;
  interests: any;
  dietary_restrictions: any;
  accessibility_needs: any;
}

const UserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    preferred_group_type: '',
    budget_min: '',
    budget_max: '',
    preferred_hotel_category: '',
    transport_preferences: [] as string[],
    interests: [] as string[],
    dietary_restrictions: [] as string[],
    accessibility_needs: [] as string[]
  });

  const transportOptions = [
    'flights', 'railways', 'buses', 'car_rental'
  ];

  const interestOptions = [
    'culture', 'adventure', 'food', 'nature', 'history', 
    'nightlife', 'shopping', 'relaxation', 'photography'
  ];

  const dietaryOptions = [
    'vegetarian', 'vegan', 'gluten_free', 'halal', 'kosher', 'dairy_free'
  ];

  const accessibilityOptions = [
    'wheelchair_accessible', 'visual_impairment', 'hearing_impairment', 
    'mobility_assistance', 'service_animal'
  ];

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  const fetchUserPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences(data);
        const budgetRange = data.budget_range as any;
        const transportPrefs = Array.isArray(data.transport_preferences) 
          ? (data.transport_preferences as any[]).map(String) 
          : [];
        const interests = Array.isArray(data.interests) 
          ? (data.interests as any[]).map(String) 
          : [];
        const dietaryRestrictions = Array.isArray(data.dietary_restrictions) 
          ? (data.dietary_restrictions as any[]).map(String) 
          : [];
        const accessibilityNeeds = Array.isArray(data.accessibility_needs) 
          ? (data.accessibility_needs as any[]).map(String) 
          : [];
        
        setFormData({
          preferred_group_type: data.preferred_group_type || '',
          budget_min: budgetRange?.min?.toString() || '',
          budget_max: budgetRange?.max?.toString() || '',
          preferred_hotel_category: data.preferred_hotel_category || '',
          transport_preferences: transportPrefs,
          interests: interests,
          dietary_restrictions: dietaryRestrictions,
          accessibility_needs: accessibilityNeeds
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load preferences",
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

      fetchUserPreferences();
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

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map(i => (
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
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Your Travel Preferences</h2>
        <p className="text-muted-foreground">Customize your travel experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Basic Preferences
            </CardTitle>
            <CardDescription>Your general travel preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="group-type">Preferred Group Type</Label>
              <Select value={formData.preferred_group_type} onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_group_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select group type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo">Solo Traveler</SelectItem>
                  <SelectItem value="couple">Couple</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="hotel-category">Preferred Hotel Category</Label>
              <Select value={formData.preferred_hotel_category} onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_hotel_category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select hotel category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="mid_range">Mid-Range</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget Range
            </CardTitle>
            <CardDescription>Set your travel budget range per trip</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="budget-min">Minimum Budget ($)</Label>
              <Input
                id="budget-min"
                type="number"
                placeholder="0"
                value={formData.budget_min}
                onChange={(e) => setFormData(prev => ({ ...prev, budget_min: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="budget-max">Maximum Budget ($)</Label>
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

        {/* Transport Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Transport Preferences</CardTitle>
            <CardDescription>Select your preferred modes of transport</CardDescription>
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

        {/* Interests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Interests
            </CardTitle>
            <CardDescription>What activities do you enjoy?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
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

        {/* Dietary Restrictions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Dietary Restrictions
            </CardTitle>
            <CardDescription>Any dietary requirements?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {dietaryOptions.map(dietary => (
                <div key={dietary} className="flex items-center space-x-2">
                  <Checkbox
                    id={dietary}
                    checked={formData.dietary_restrictions.includes(dietary)}
                    onCheckedChange={() => handleArrayToggle('dietary_restrictions', dietary)}
                  />
                  <Label htmlFor={dietary} className="text-sm capitalize">
                    {dietary.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle>Accessibility Needs</CardTitle>
            <CardDescription>Special accessibility requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {accessibilityOptions.map(accessibility => (
                <div key={accessibility} className="flex items-center space-x-2">
                  <Checkbox
                    id={accessibility}
                    checked={formData.accessibility_needs.includes(accessibility)}
                    onCheckedChange={() => handleArrayToggle('accessibility_needs', accessibility)}
                  />
                  <Label htmlFor={accessibility} className="text-sm capitalize">
                    {accessibility.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button onClick={savePreferences} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};

export default UserPreferences;