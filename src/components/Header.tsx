import { Button } from "@/components/ui/button";
import { MessageCircle, Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-primary">EaseMyTrip</h1>
                <p className="text-xs text-muted-foreground">AI Trip Planner</p>
              </div>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">
              How it Works
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">
              About
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              Sign In
            </Button>
            <Button variant="hero" size="sm">
              Try AI Planner
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;