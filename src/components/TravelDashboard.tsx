import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TravelPlanningApp from "./TravelPlanningApp";

export function TravelDashboard() {
  const navigate = useNavigate();

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
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="text-foreground border-border hover:bg-accent"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              AI Chat
            </Button>
          </div>
        </div>
      </header>

      {/* Travel Planning Content */}
      <TravelPlanningApp />
    </div>
  );
}