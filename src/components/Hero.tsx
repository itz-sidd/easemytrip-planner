import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Users, Award } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-16 pb-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center space-x-2 bg-cream rounded-full px-4 py-2 mb-8">
            <Award className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-navy">Trusted by 500,000+ Travelers</span>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
            Your Personal AI Travel 
            <span className="text-primary block">Planning Assistant</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed font-sans">
            Experience effortless travel planning with our intelligent AI assistant. Get personalized 
            recommendations, compare prices, and book your perfect trip—all through simple conversation.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="classic" size="xl" className="font-semibold">
              Start Planning Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="xl">
              Watch How It Works
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-navy mb-1">500K+</div>
              <div className="text-sm text-muted-foreground">Happy Travelers</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-navy mb-1">4.9/5</div>
              <div className="text-sm text-muted-foreground">Customer Rating</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-navy mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">AI Support</div>
            </div>
          </div>

          {/* Features List */}
          <div className="max-w-2xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Instant personalized recommendations</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Best price guarantees</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Real-time booking & updates</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Secure payment processing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="w-24 h-1 bg-primary mx-auto mt-16"></div>
    </section>
  );
};

export default Hero;