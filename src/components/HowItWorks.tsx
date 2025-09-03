import { Button } from "@/components/ui/button";
import { MessageCircle, Search, Calendar, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    title: "Tell Us Your Plans",
    description: "Simply describe where you want to go, your budget, travel dates, and preferences. Our AI understands natural language."
  },
  {
    icon: Search,
    title: "AI Searches & Analyzes",
    description: "Our intelligent system searches thousands of options, compares prices, and analyzes reviews to find the best matches."
  },
  {
    icon: Calendar,
    title: "Get Custom Itinerary", 
    description: "Receive a detailed, personalized travel plan with flights, accommodations, activities, and local recommendations."
  },
  {
    icon: CheckCircle,
    title: "Review & Book",
    description: "Review your options, make adjustments if needed, and book everything seamlessly through our secure platform."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-sans">
            Planning your perfect trip is simple with our AI-powered platform. Just four easy steps 
            to your dream vacation.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex items-start space-x-4 p-6 rounded-lg bg-cream/40 shadow-subtle">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center shadow-classic">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-semibold text-navy mr-2">STEP {index + 1}</span>
                    </div>
                    <h3 className="text-xl font-serif font-semibold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed font-sans">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-16">
          <Button variant="classic" size="xl" className="font-semibold">
            Start Your Journey Today
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;