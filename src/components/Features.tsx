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
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Why Choose Our AI Trip Planner?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Experience the next generation of travel planning with features designed to make your journey seamless, 
            personalized, and unforgettable.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="group hover:shadow-medium transition-all duration-300 border-0 shadow-soft">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;