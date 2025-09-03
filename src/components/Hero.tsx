import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Plane } from "lucide-react";
import heroImage from "@/assets/hero-travel.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-background/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-primary-foreground">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Plan Your Perfect Trip with 
              <span className="text-accent block">AI Intelligence</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8 max-w-2xl">
              Experience the future of travel planning with our AI-powered chatbot. Get personalized recommendations, 
              instant bookings, and 24/7 assistance for your perfect journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="accent" size="xl" className="group">
                Start Planning Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="xl" className="bg-background/10 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground hover:bg-background/20">
                Watch Demo
                <Plane className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center justify-center lg:justify-start space-x-8 mt-12">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-foreground">500K+</div>
                <div className="text-sm text-primary-foreground/80">Trips Planned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-foreground">4.9★</div>
                <div className="text-sm text-primary-foreground/80">User Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-foreground">24/7</div>
                <div className="text-sm text-primary-foreground/80">AI Support</div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-accent rounded-3xl transform rotate-6 opacity-20"></div>
              <div className="relative bg-background/10 backdrop-blur-md rounded-3xl p-8 shadow-strong border border-primary-foreground/20">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2"></div>
                    <div>
                      <p className="text-primary-foreground font-medium">AI Assistant:</p>
                      <p className="text-primary-foreground/80 text-sm">I can help you plan your perfect trip! Where would you like to go?</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground mt-2"></div>
                    <div>
                      <p className="text-primary-foreground font-medium">You:</p>
                      <p className="text-primary-foreground/80 text-sm">I want to visit Japan for 7 days with a budget of $3000</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2"></div>
                    <div>
                      <p className="text-primary-foreground font-medium">AI Assistant:</p>
                      <p className="text-primary-foreground/80 text-sm">Perfect! I've found amazing deals for Tokyo and Kyoto. Here's your personalized itinerary...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;