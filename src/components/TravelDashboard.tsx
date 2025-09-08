import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import TravelPlanningApp from "./TravelPlanningApp";

export function TravelDashboard() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth if not logged in (after loading is complete)
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chat
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold text-foreground">Travel Planning Assistant</h1>
              <span className="text-sm text-muted-foreground">Welcome, {user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="text-foreground border-border hover:bg-accent"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                AI Chat
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                className="text-foreground hover:bg-accent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Travel Planning Content */}
      <TravelPlanningApp />
    </div>
  );
}