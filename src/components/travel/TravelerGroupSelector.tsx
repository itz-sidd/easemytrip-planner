import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, Users, Heart, Baby, PartyPopper } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TravelerGroup {
  id: string;
  type: string;
  name: string;
  description: string;
  preferences: any;
}

interface TravelerGroupSelectorProps {
  onGroupSelect: (groupType: string) => void;
  selectedGroup: string | null;
}

const TravelerGroupSelector = ({ onGroupSelect, selectedGroup }: TravelerGroupSelectorProps) => {
  const [groups, setGroups] = useState<TravelerGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const iconMap = {
    solo: User,
    student: Users,
    couple: Heart,
    family: Baby,
    group: PartyPopper
  };

  useEffect(() => {
    fetchTravelerGroups();
  }, []);

  const fetchTravelerGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('traveler_groups')
        .select('*')
        .order('created_at');

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching traveler groups:', error);
      toast({
        title: "Error",
        description: "Failed to load traveler groups",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Choose Your Travel Style</h2>
        <p className="text-muted-foreground">Select the type of travel group that best fits your trip</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => {
          const Icon = iconMap[group.type as keyof typeof iconMap] || User;
          const isSelected = selectedGroup === group.type;
          
          return (
            <Card 
              key={group.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
              }`}
              onClick={() => onGroupSelect(group.type)}
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

      {selectedGroup && (
        <div className="text-center">
          <Button size="lg" onClick={() => {
            toast({
              title: "Travel Style Selected",
              description: `You've selected ${groups.find(g => g.type === selectedGroup)?.name}`,
            });
          }}>
            Continue with {groups.find(g => g.type === selectedGroup)?.name}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TravelerGroupSelector;