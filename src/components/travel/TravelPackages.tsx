import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Package, Plus, Edit, Trash2, Calendar, DollarSign, MapPin, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TravelPackage {
  id: string;
  user_id: string;
  destination_id: string;
  traveler_group_type: string;
  name: string;
  description?: string;
  total_days: number;
  total_price?: number;
  itinerary: any;
  included_hotels: any;
  included_transport: any;
  status: string;
  created_at: string;
  updated_at: string;
  destinations?: {
    name: string;
    country: string;
  };
}

const TravelPackages = () => {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TravelPackage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    destination_id: '',
    traveler_group_type: '',
    total_days: 3,
    total_price: '',
    status: 'draft'
  });

  const statusColors = {
    draft: 'bg-gray-500',
    active: 'bg-green-500',
    completed: 'bg-blue-500',
    cancelled: 'bg-red-500'
  };

  const groupTypeLabels = {
    solo: 'Solo Traveler',
    student: 'Student',
    couple: 'Couple',
    family: 'Family',
    group: 'Group'
  };

  useEffect(() => {
    fetchPackages();
    fetchDestinations();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('travel_packages')
        .select(`
          *,
          destinations (
            name,
            country
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "Failed to load travel packages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('id, name, country')
        .order('name');

      if (error) throw error;
      setDestinations(data || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      destination_id: '',
      traveler_group_type: '',
      total_days: 3,
      total_price: '',
      status: 'draft'
    });
    setEditingPackage(null);
  };

  const handleCreatePackage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to create packages",
          variant: "destructive"
        });
        return;
      }

      const packageData = {
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        destination_id: formData.destination_id,
        traveler_group_type: formData.traveler_group_type as any,
        total_days: formData.total_days,
        total_price: formData.total_price ? parseFloat(formData.total_price) : null,
        status: formData.status,
        itinerary: [],
        included_hotels: [],
        included_transport: []
      };

      const { error } = await supabase
        .from('travel_packages')
        .insert(packageData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Travel package created successfully"
      });

      setIsCreateDialogOpen(false);
      resetForm();
      fetchPackages();
    } catch (error) {
      console.error('Error creating package:', error);
      toast({
        title: "Error",
        description: "Failed to create travel package",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage) return;

    try {
      const packageData = {
        name: formData.name,
        description: formData.description,
        destination_id: formData.destination_id,
        traveler_group_type: formData.traveler_group_type as any,
        total_days: formData.total_days,
        total_price: formData.total_price ? parseFloat(formData.total_price) : null,
        status: formData.status
      };

      const { error } = await supabase
        .from('travel_packages')
        .update(packageData)
        .eq('id', editingPackage.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Travel package updated successfully"
      });

      setEditingPackage(null);
      resetForm();
      fetchPackages();
    } catch (error) {
      console.error('Error updating package:', error);
      toast({
        title: "Error",
        description: "Failed to update travel package",
        variant: "destructive"
      });
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      const { error } = await supabase
        .from('travel_packages')
        .delete()
        .eq('id', packageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Travel package deleted successfully"
      });

      fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: "Error",
        description: "Failed to delete travel package",
        variant: "destructive"
      });
    }
  };

  const startEditing = (pkg: TravelPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      destination_id: pkg.destination_id,
      traveler_group_type: pkg.traveler_group_type,
      total_days: pkg.total_days,
      total_price: pkg.total_price?.toString() || '',
      status: pkg.status
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">My Travel Packages</h2>
          <p className="text-muted-foreground">Manage your travel plans and itineraries</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Travel Package</DialogTitle>
              <DialogDescription>
                Create a new travel package to organize your trip
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="package-name">Package Name</Label>
                <Input
                  id="package-name"
                  placeholder="e.g., European Adventure"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="package-description">Description</Label>
                <Textarea
                  id="package-description"
                  placeholder="Describe your travel package"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="package-destination">Destination</Label>
                <Select value={formData.destination_id} onValueChange={(value) => setFormData(prev => ({ ...prev, destination_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map(dest => (
                      <SelectItem key={dest.id} value={dest.id}>
                        {dest.name}, {dest.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="package-group-type">Group Type</Label>
                <Select value={formData.traveler_group_type} onValueChange={(value) => setFormData(prev => ({ ...prev, traveler_group_type: value }))}>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="package-days">Total Days</Label>
                  <Input
                    id="package-days"
                    type="number"
                    min="1"
                    value={formData.total_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_days: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="package-price">Total Price ($)</Label>
                  <Input
                    id="package-price"
                    type="number"
                    placeholder="Optional"
                    value={formData.total_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_price: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreatePackage} className="flex-1">
                  Create Package
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {packages.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No travel packages yet</h3>
          <p className="text-muted-foreground mb-4">Create your first travel package to get started</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Package
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{pkg.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mb-2">
                      <MapPin className="h-3 w-3" />
                      {pkg.destinations?.name}, {pkg.destinations?.country}
                    </CardDescription>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`text-white ${statusColors[pkg.status as keyof typeof statusColors]}`}
                      >
                        {pkg.status}
                      </Badge>
                      <Badge variant="outline">
                        {groupTypeLabels[pkg.traveler_group_type as keyof typeof groupTypeLabels]}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => startEditing(pkg)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeletePackage(pkg.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {pkg.description && (
                  <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {pkg.total_days} day{pkg.total_days > 1 ? 's' : ''}
                  </div>
                  {pkg.total_price && (
                    <div className="flex items-center gap-1 font-medium text-primary">
                      <DollarSign className="h-3 w-3" />
                      {pkg.total_price}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Created {new Date(pkg.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPackage} onOpenChange={(open) => !open && setEditingPackage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Travel Package</DialogTitle>
            <DialogDescription>
              Update your travel package details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-package-name">Package Name</Label>
              <Input
                id="edit-package-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-package-description">Description</Label>
              <Textarea
                id="edit-package-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-package-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-package-days">Total Days</Label>
                <Input
                  id="edit-package-days"
                  type="number"
                  min="1"
                  value={formData.total_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_days: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-package-price">Total Price ($)</Label>
                <Input
                  id="edit-package-price"
                  type="number"
                  value={formData.total_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_price: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdatePackage} className="flex-1">
                Update Package
              </Button>
              <Button variant="outline" onClick={() => setEditingPackage(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TravelPackages;