import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Hotel, Star, MapPin, Wifi, Car, Waves, Coffee, Filter, Calendar, Users } from "lucide-react";
import { stayApiService, type Hotel as StayApiHotel, type HotelSearchParams, type BookingDetails } from "@/services/stayApiService";

interface BookingFormData {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

interface HotelSearchProps {
  destination: string;
  groupType?: string;
}

const HotelSearch = ({ destination, groupType }: HotelSearchProps) => {
  const [hotels, setHotels] = useState<StayApiHotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<StayApiHotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<StayApiHotel | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    adults: 1,
    children: 0,
    rooms: 1,
  });
  const [filters, setFilters] = useState({
    category: '',
    maxPrice: '',
    minRating: '',
    sortBy: 'price'
  });

  useEffect(() => {
    fetchHotels();
  }, [destination, bookingForm.checkIn, bookingForm.checkOut, bookingForm.adults, bookingForm.children, bookingForm.rooms]);

  useEffect(() => {
    applyFilters();
  }, [hotels, filters]);

  const fetchHotels = async () => {
    if (!destination) return;
    
    setLoading(true);
    try {
      const searchParams: HotelSearchParams = {
        destination,
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        adults: bookingForm.adults,
        children: bookingForm.children,
        rooms: bookingForm.rooms,
        category: filters.category || undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        minRating: filters.minRating ? parseFloat(filters.minRating) : undefined,
      };

      const hotelResults = await stayApiService.searchHotels(searchParams);
      setHotels(hotelResults);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      toast.error("Failed to load hotels", {
        description: "Please check your search parameters and try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...hotels];

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(hotel => hotel.category === filters.category);
    }

    // Filter by max price
    if (filters.maxPrice) {
      filtered = filtered.filter(hotel => hotel.price_per_night <= parseFloat(filters.maxPrice));
    }

    // Filter by minimum rating
    if (filters.minRating) {
      filtered = filtered.filter(hotel => (hotel.rating || 0) >= parseFloat(filters.minRating));
    }

    // Sort results
    if (filters.sortBy === 'price') {
      filtered.sort((a, b) => a.price_per_night - b.price_per_night);
    } else if (filters.sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setFilteredHotels(filtered);
  };

  const handleBooking = async (hotel: StayApiHotel) => {
    setSelectedHotel(hotel);
    setIsBookingOpen(true);
  };

  const processBooking = async () => {
    if (!selectedHotel) return;

    try {
      const bookingDetails: BookingDetails = {
        hotelId: selectedHotel.id,
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        guests: {
          adults: bookingForm.adults,
          children: bookingForm.children,
        },
        rooms: bookingForm.rooms,
        totalPrice: selectedHotel.price_per_night * calculateNights(),
        currency: selectedHotel.currency,
      };

      const result = await stayApiService.bookHotel(bookingDetails);
      
      toast.success("Hotel booked successfully!", {
        description: `Confirmation: ${result.confirmationNumber}`,
      });
      
      setIsBookingOpen(false);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error("Booking failed", {
        description: "Please try again or contact support",
      });
    }
  };

  const calculateNights = () => {
    const checkIn = new Date(bookingForm.checkIn);
    const checkOut = new Date(bookingForm.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (!destination) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Hotel className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Search Hotels</h3>
          <p className="text-muted-foreground">
            Please select a destination to search for hotels
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
          <p>Searching for hotels in {destination}...</p>
        </CardContent>
      </Card>
    );
  }

  if (hotels.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Hotel className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No hotels found</h3>
          <p className="text-muted-foreground">
            No hotels found in {destination}. Try adjusting your search criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (filteredHotels.length === 0) {
    return (
      <div className="space-y-6">
        {/* Search and Filter section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hotel className="h-5 w-5" />
              Hotel Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Booking Form */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label>Check-in</Label>
                <Input
                  type="date"
                  value={bookingForm.checkIn}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, checkIn: e.target.value }))}
                />
              </div>
              <div>
                <Label>Check-out</Label>
                <Input
                  type="date"
                  value={bookingForm.checkOut}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, checkOut: e.target.value }))}
                />
              </div>
              <div>
                <Label>Adults</Label>
                <Input
                  type="number"
                  min="1"
                  value={bookingForm.adults}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, adults: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Children</Label>
                <Input
                  type="number"
                  min="0"
                  value={bookingForm.children}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, children: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Rooms</Label>
                <Input
                  type="number"
                  min="1"
                  value={bookingForm.rooms}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, rooms: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all' ? '' : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      <SelectItem value="budget">Budget</SelectItem>
                      <SelectItem value="mid_range">Mid Range</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                      <SelectItem value="special">Special/Boutique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Max Price per Night</Label>
                  <Input
                    type="number"
                    placeholder="Enter max price"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label>Min Rating</Label>
                  <Select value={filters.minRating} onValueChange={(value) => setFilters(prev => ({ ...prev, minRating: value === 'any' ? '' : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any rating</SelectItem>
                      <SelectItem value="1">1+ Stars</SelectItem>
                      <SelectItem value="2">2+ Stars</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Sort By</Label>
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
              </div>
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({ category: '', maxPrice: '', minRating: '', sortBy: 'price' })}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Filter className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No hotels match your filters</h3>
            <p className="text-muted-foreground">
              Try adjusting your filter criteria to see more results.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hotel className="h-5 w-5" />
            Hotel Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Booking Form */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Check-in</Label>
              <Input
                type="date"
                value={bookingForm.checkIn}
                onChange={(e) => setBookingForm(prev => ({ ...prev, checkIn: e.target.value }))}
              />
            </div>
            <div>
              <Label>Check-out</Label>
              <Input
                type="date"
                value={bookingForm.checkOut}
                onChange={(e) => setBookingForm(prev => ({ ...prev, checkOut: e.target.value }))}
              />
            </div>
            <div>
              <Label>Adults</Label>
              <Input
                type="number"
                min="1"
                value={bookingForm.adults}
                onChange={(e) => setBookingForm(prev => ({ ...prev, adults: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <Label>Children</Label>
              <Input
                type="number"
                min="0"
                value={bookingForm.children}
                onChange={(e) => setBookingForm(prev => ({ ...prev, children: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <Label>Rooms</Label>
              <Input
                type="number"
                min="1"
                value={bookingForm.rooms}
                onChange={(e) => setBookingForm(prev => ({ ...prev, rooms: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="mid_range">Mid Range</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                    <SelectItem value="special">Special/Boutique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Max Price per Night</Label>
                <Input
                  type="number"
                  placeholder="Enter max price"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                />
              </div>
              
              <div>
                <Label>Min Rating</Label>
                <Select value={filters.minRating} onValueChange={(value) => setFilters(prev => ({ ...prev, minRating: value === 'any' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any rating</SelectItem>
                    <SelectItem value="1">1+ Stars</SelectItem>
                    <SelectItem value="2">2+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Sort By</Label>
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
            </div>
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setFilters({ category: '', maxPrice: '', minRating: '', sortBy: 'price' })}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hotels grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((hotel) => (
          <Card key={hotel.id} className="overflow-hidden">
            <div className="relative">
              {hotel.images && hotel.images.length > 0 ? (
                <img 
                  src={hotel.images[0]} 
                  alt={hotel.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <Hotel className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <Badge className="absolute top-2 right-2 bg-white text-black">
                {hotel.category.replace('_', ' ')}
              </Badge>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{hotel.name}</h3>
                  <div className="flex items-center">
                    {renderStars(hotel.rating || 0)}
                    <span className="ml-1 text-sm text-gray-600">({hotel.rating || 0})</span>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {hotel.address}
                </div>
                
                <div className="text-2xl font-bold text-green-600">
                  ${hotel.price_per_night}
                  <span className="text-sm font-normal text-gray-600">/{hotel.currency} per night</span>
                </div>
                
                <p className="text-sm text-gray-700 line-clamp-2">
                  {hotel.description}
                </p>
                
                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {hotel.amenities.slice(0, 4).map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {amenity.includes('wifi') || amenity.includes('WiFi') ? (
                          <Wifi className="h-3 w-3 mr-1" />
                        ) : amenity.includes('parking') ? (
                          <Car className="h-3 w-3 mr-1" />
                        ) : amenity.includes('pool') ? (
                          <Waves className="h-3 w-3 mr-1" />
                        ) : amenity.includes('coffee') || amenity.includes('breakfast') ? (
                          <Coffee className="h-3 w-3 mr-1" />
                        ) : null}
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <Button 
                  className="w-full mt-3" 
                  onClick={() => handleBooking(hotel)}
                >
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book {selectedHotel?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Check-in</Label>
                <Input
                  type="date"
                  value={bookingForm.checkIn}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, checkIn: e.target.value }))}
                />
              </div>
              <div>
                <Label>Check-out</Label>
                <Input
                  type="date"
                  value={bookingForm.checkOut}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, checkOut: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Adults</Label>
                <Input
                  type="number"
                  min="1"
                  value={bookingForm.adults}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, adults: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Children</Label>
                <Input
                  type="number"
                  min="0"
                  value={bookingForm.children}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, children: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Rooms</Label>
                <Input
                  type="number"
                  min="1"
                  value={bookingForm.rooms}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, rooms: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            {selectedHotel && (
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span>Price per night:</span>
                  <span>${selectedHotel.price_per_night}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of nights:</span>
                  <span>{calculateNights()}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${selectedHotel.price_per_night * calculateNights()}</span>
                </div>
              </div>
            )}

            <Button onClick={processBooking} className="w-full">
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HotelSearch;