import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  Clock, 
  Globe, 
  Heart, 
  MapPin, 
  Shield,
  Smartphone,
  Star,
  Wallet
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Recommendations",
    description: "Get personalized travel suggestions based on your preferences, budget, and travel style using advanced machine learning."
  },
  {
    icon: Clock,
    title: "Instant Planning",
    description: "Plan your entire trip in minutes, not hours. Our AI processes thousands of options to find the perfect match instantly."
  },
  {
    icon: Wallet,
    title: "Budget Optimization",
    description: "Maximize your travel experience within your budget. Find the best deals and optimize your spending automatically."
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Access information for destinations worldwide with real-time availability, pricing, and local insights."
  },
  {
    icon: Heart,
    title: "Personalized Experience",
    description: "The more you use it, the better it gets. Our AI learns your preferences to provide increasingly personalized recommendations."
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Your data is protected with enterprise-grade security. Book with confidence through our trusted platform."
  },
  {
    icon: MapPin,
    title: "Real-time Updates",
    description: "Get live updates on flights, weather, and local events. Stay informed throughout your journey."
  },
  {
    icon: Smartphone,
    title: "Multi-platform Access",
    description: "Access your AI travel assistant on any device. Seamless experience across web, mobile, and chat platforms."
  },
  {
    icon: Star,
    title: "Premium Support",
    description: "24/7 AI assistance with human backup. Get help whenever you need it, wherever you are in the world."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-cream/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
            Why Choose Our AI Assistant?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-sans">
            Discover the advantages of intelligent travel planning with features designed to make your journey 
            seamless and personalized.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-background rounded-lg p-6 shadow-subtle hover:shadow-classic transition-shadow duration-200 border border-border">
                <div className="w-12 h-12 rounded-lg bg-navy flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-sans">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;