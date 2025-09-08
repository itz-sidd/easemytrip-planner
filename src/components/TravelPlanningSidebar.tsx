import { useState } from "react";
import { 
  MapPin, 
  Users, 
  Plane, 
  Hotel, 
  Calendar, 
  Settings, 
  Package,
  ChevronRight,
  Home
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import TravelerGroupSelector from "./travel/TravelerGroupSelector";
import DestinationSearch from "./travel/DestinationSearch";
import TransportOptions from "./travel/TransportOptions";
import HotelSearch from "./travel/HotelSearch";
import ItineraryBuilder from "./travel/ItineraryBuilder";
import UserPreferences from "./travel/UserPreferences";
import TravelPackages from "./travel/TravelPackages";

type ActiveSection = 'home' | 'preferences' | 'group' | 'destination' | 'transport' | 'hotels' | 'itinerary' | 'packages';

const travelMenuItems = [
  { id: 'home' as const, title: "Overview", icon: Home },
  { id: 'preferences' as const, title: "Preferences", icon: Settings },
  { id: 'group' as const, title: "Group Type", icon: Users },
  { id: 'destination' as const, title: "Destination", icon: MapPin },
  { id: 'transport' as const, title: "Transport", icon: Plane },
  { id: 'hotels' as const, title: "Hotels", icon: Hotel },
  { id: 'itinerary' as const, title: "Itinerary", icon: Calendar },
  { id: 'packages' as const, title: "Packages", icon: Package },
];

export function TravelPlanningSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [activeSection, setActiveSection] = useState<ActiveSection>('home');
  const [selectedGroupType, setSelectedGroupType] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);

  const renderActiveComponent = () => {
    switch (activeSection) {
      case 'preferences':
        return <UserPreferences />;
      case 'group':
        return (
          <TravelerGroupSelector 
            onGroupSelect={setSelectedGroupType}
            selectedGroup={selectedGroupType}
          />
        );
      case 'destination':
        return (
          <DestinationSearch 
            onDestinationSelect={setSelectedDestination}
            selectedDestination={selectedDestination}
          />
        );
      case 'transport':
        return (
          <TransportOptions 
            destination={selectedDestination}
            groupType={selectedGroupType}
          />
        );
      case 'hotels':
        return (
          <HotelSearch 
            destination={selectedDestination}
            groupType={selectedGroupType}
          />
        );
      case 'itinerary':
        return (
          <ItineraryBuilder 
            destination={selectedDestination}
            groupType={selectedGroupType}
          />
        );
      case 'packages':
        return <TravelPackages />;
      default:
        return (
          <div className="p-4 space-y-4">
            <h3 className="font-semibold text-sidebar-foreground">Travel Planning Assistant</h3>
            <p className="text-sm text-sidebar-foreground/70">
              Use the menu items above to plan your perfect trip. Start with your preferences, 
              select your group type, choose a destination, and continue through each step.
            </p>
            <div className="bg-sidebar-accent rounded-lg p-3">
              <p className="text-xs text-sidebar-accent-foreground">
                💡 Tip: Your selections will be saved and used across all planning modules.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-80"} collapsible="icon">
      <SidebarContent className="bg-sidebar border-sidebar-border">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">
            Travel Planning
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {travelMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => setActiveSection(item.id)}
                    className={`${
                      activeSection === item.id 
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                        : 'hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground'
                    } transition-colors cursor-pointer`}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && (
                      <>
                        <span>{item.title}</span>
                        <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${
                          activeSection === item.id ? 'rotate-90' : ''
                        }`} />
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && activeSection !== 'home' && (
          <>
            <Separator className="bg-sidebar-border" />
            <div className="flex-1 overflow-y-auto p-2">
              {renderActiveComponent()}
            </div>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}