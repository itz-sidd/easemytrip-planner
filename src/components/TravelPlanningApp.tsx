import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TravelerGroupSelector from "./travel/TravelerGroupSelector";
import DestinationSearch from "./travel/DestinationSearch";
import TransportOptions from "./travel/TransportOptions";
import HotelSearch from "./travel/HotelSearch";
import ItineraryBuilder from "./travel/ItineraryBuilder";
import UserPreferences from "./travel/UserPreferences";
import TravelPackages from "./travel/TravelPackages";
import { MapPin, Users, Plane, Hotel, Calendar, Settings, Package } from "lucide-react";

const TravelPlanningApp = () => {
  const [selectedGroupType, setSelectedGroupType] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Travel Planning Assistant</h1>
          <p className="text-muted-foreground text-lg">Plan your perfect trip with personalized recommendations</p>
        </div>

        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="group" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Group Type
            </TabsTrigger>
            <TabsTrigger value="destination" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Destination
            </TabsTrigger>
            <TabsTrigger value="transport" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Transport
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center gap-2">
              <Hotel className="h-4 w-4" />
              Hotels
            </TabsTrigger>
            <TabsTrigger value="itinerary" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Itinerary
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Packages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preferences">
            <UserPreferences />
          </TabsContent>

          <TabsContent value="group">
            <TravelerGroupSelector 
              onGroupSelect={setSelectedGroupType}
              selectedGroup={selectedGroupType}
            />
          </TabsContent>

          <TabsContent value="destination">
            <DestinationSearch 
              onDestinationSelect={setSelectedDestination}
              selectedDestination={selectedDestination}
            />
          </TabsContent>

          <TabsContent value="transport">
            <TransportOptions 
              destination={selectedDestination}
              groupType={selectedGroupType}
            />
          </TabsContent>

          <TabsContent value="hotels">
            <HotelSearch 
              destination={selectedDestination}
              groupType={selectedGroupType}
            />
          </TabsContent>

          <TabsContent value="itinerary">
            <ItineraryBuilder 
              destination={selectedDestination}
              groupType={selectedGroupType}
            />
          </TabsContent>

          <TabsContent value="packages">
            <TravelPackages />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TravelPlanningApp;