import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Search, Calendar, CheckCircle } from "lucide-react";
import aiAssistantImage from "@/assets/ai-assistant.jpg";

const steps = [
  {
    icon: MessageCircle,
    title: "Start Chatting",
    description: "Simply tell our AI where you want to go, your budget, and preferences. Natural conversation, no complex forms."
  },
  {
    icon: Search,
    title: "AI Analysis",
    description: "Our AI analyzes millions of options, current prices, weather, and reviews to find perfect matches for you."
  },
  {
    icon: Calendar,
    title: "Get Your Itinerary", 
    description: "Receive a personalized itinerary with flights, hotels, activities, and local recommendations tailored to you."
  },
  {
    icon: CheckCircle,
    title: "Book & Go",
    description: "Review, customize, and book everything in one place. Your dream trip is just a few clicks away."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Planning your perfect trip has never been easier. Our AI-powered platform makes it simple 
            in just 4 easy steps.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {index + 1}. {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative">
            <Card className="overflow-hidden shadow-strong border-0">
              <CardContent className="p-0">
                <div 
                  className="h-96 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${aiAssistantImage})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-medium">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-3 h-3 rounded-full bg-accent"></div>
                        <span className="font-medium text-sm">AI Planning in Progress...</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gradient-primary rounded-full w-4/5"></div>
                        <div className="h-2 bg-muted rounded-full w-3/5"></div>
                        <div className="h-2 bg-muted rounded-full w-2/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground rounded-full p-3 shadow-medium">
              <MessageCircle className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <Button variant="hero" size="xl">
            Start Your AI-Powered Journey
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;