import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plane, Calendar, Users, MapPin } from "lucide-react";

interface FlightSearchFormData {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  class: string;
  tripType: string;
}

interface FlightSearchProps {
  destination: string;
  groupType?: string;
}

const FlightSearch = ({ destination, groupType }: FlightSearchProps) => {
  const [searchForm, setSearchForm] = useState<FlightSearchFormData>({
    from: "",
    to: destination || "",
    departDate: new Date().toISOString().split('T')[0],
    returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    passengers: 1,
    class: "economy",
    tripType: "round-trip"
  });
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchForm.from || !searchForm.to) {
      toast.error("Please fill in all required fields", {
        description: "Origin and destination are required for flight search"
      });
      return;
    }

    setLoading(true);
    
    // Simulate API timeout after 15 seconds
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('timeout')), 15000)
    );

    // Simulate API call that will timeout/fail
    const flightSearchPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API not available')), 3000)
    );

    try {
      await Promise.race([flightSearchPromise, timeoutPromise]);
    } catch (error) {
      console.error('Flight search error:', error);
      
      if (error instanceof Error && error.message === 'timeout') {
        toast.error("Flight API timeout - redirecting to EaseMyTrip", {
          description: "Flight booking API is not responding. Redirecting you to EaseMyTrip for flight booking.",
        });
      } else {
        toast.error("Flight API not working - redirecting to EaseMyTrip", {
          description: "Flight booking API is not available. Redirecting you to EaseMyTrip for flight booking.",
        });
      }
      
      // Redirect to EaseMyTrip flights
      setTimeout(() => {
        const easeMyTripUrl = `https://www.easemytrip.com/flights/search?from=${encodeURIComponent(searchForm.from)}&to=${encodeURIComponent(searchForm.to)}&depart=${searchForm.departDate}&return=${searchForm.returnDate}&adults=${searchForm.passengers}&class=${searchForm.class}&trip=${searchForm.tripType}`;
        window.open(easeMyTripUrl, '_blank');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  if (!destination) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Plane className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Search Flights</h3>
          <p className="text-muted-foreground">
            Please select a destination to search for flights
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Searching for flights to {destination}...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Flight Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trip Type */}
          <div>
            <Label>Trip Type</Label>
            <Select value={searchForm.tripType} onValueChange={(value) => setSearchForm(prev => ({ ...prev, tripType: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round-trip">Round Trip</SelectItem>
                <SelectItem value="one-way">One Way</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* From and To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>From</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Origin city"
                  value={searchForm.from}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, from: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>To</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Destination city"
                  value={searchForm.to}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, to: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Departure Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={searchForm.departDate}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, departDate: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            {searchForm.tripType === 'round-trip' && (
              <div>
                <Label>Return Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={searchForm.returnDate}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, returnDate: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Passengers and Class */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Passengers</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="1"
                  max="9"
                  value={searchForm.passengers}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Class</Label>
              <Select value={searchForm.class} onValueChange={(value) => setSearchForm(prev => ({ ...prev, class: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="premium-economy">Premium Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="first">First Class</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSearch} className="w-full" disabled={loading}>
            {loading ? "Searching..." : "Search Flights"}
          </Button>
        </CardContent>
      </Card>

      {/* EaseMyTrip Fallback Section */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-blue-100">
              <Plane className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">
                Having trouble with flight booking APIs?
              </h3>
              <p className="text-blue-700 text-sm mb-4">
                If our booking APIs don't work or take too long to respond, you can directly book flights on EaseMyTrip for competitive prices and excellent service.
              </p>
              <Button 
                onClick={() => {
                  const url = `https://www.easemytrip.com/flights/search?from=${encodeURIComponent(searchForm.from)}&to=${encodeURIComponent(searchForm.to)}&depart=${searchForm.departDate}&return=${searchForm.returnDate}&adults=${searchForm.passengers}&class=${searchForm.class}&trip=${searchForm.tripType}`;
                  window.open(url, '_blank');
                }}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Book Flights on EaseMyTrip
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlightSearch;