import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send,
  Image,
  Video,
  Music,
  BarChart3,
  MapPin,
  Calendar,
  DollarSign,
  Plane,
  Hotel,
  Users
} from "lucide-react";

export const ChatInterface = () => {
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [hasStartedChat, setHasStartedChat] = useState(false);

  const chatHistory = [
    { title: "Plan a 3-day trip", subtitle: "A 3-day trip to see the northern lights in Norway..." },
    { title: "Ideas for a customer loyalty program", subtitle: "Here are seven ideas for a customer loyalty..." },
    { title: "Help me pick", subtitle: "Here are some gift ideas for your fishing-loving..." }
  ];

  const tabs = [
    { name: "All", icon: null },
    { name: "Text", icon: null },
    { name: "Image", icon: Image },
    { name: "Video", icon: Video },
    { name: "Music", icon: Music },
    { name: "Analytics", icon: BarChart3 }
  ];

  const featureCards = [
    {
      icon: MapPin,
      title: "Plan Your Trip",
      description: "AI-powered travel planning with personalized recommendations.",
    },
    {
      icon: Hotel,
      title: "Find Hotels",
      description: "Discover perfect accommodations for your journey.",
    },
    {
      icon: Plane,
      title: "Book Transport",
      description: "Compare flights, trains, and other transport options.",
    },
    {
      icon: Calendar,
      title: "Create Itinerary",
      description: "Build detailed day-by-day travel schedules.",
    },
    {
      icon: Users,
      title: "Group Travel",
      description: "Plan trips for families, couples, or friend groups.",
    },
    {
      icon: DollarSign,
      title: "Budget Planning",
      description: "Manage travel expenses and find deals within your budget.",
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      setHasStartedChat(true);
      console.log('Send message:', message);
      setMessage("");
    }
  };

  return (
    <div className="h-full bg-chat-bg text-chat-text flex flex-col overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-chat-border bg-chat-sidebar">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-semibold text-chat-text">AI Travel Assistant</h2>
              <span className="text-xs text-primary bg-primary/20 px-2 py-1 rounded">GPT 4</span>
            </div>
          </div>
        </div>

        {/* Welcome Area */}
        <div className="flex-1 flex flex-col justify-center items-center p-4 animate-fade-in overflow-y-auto">
          {!hasStartedChat && (
            <>
              <div className="max-w-2xl text-center mb-6">
                <h1 className="text-4xl font-bold mb-4 animate-scale-in text-chat-text">
                  Plan your perfect trip with AI
                </h1>
                <p className="text-chat-text-muted text-base mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  I'm your AI travel assistant. Ask me anything about destinations, planning, bookings, 
                  or use the sidebar to access detailed planning tools for a step-by-step experience.
                </p>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 w-full max-w-6xl">
                {featureCards.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div 
                      key={feature.title}
                      className="flex flex-col gap-3 p-4 rounded-lg bg-chat-card/30 hover:bg-chat-card/50 transition-all duration-300 cursor-pointer group animate-scale-in border border-chat-border/30 hover:border-primary/30"
                      style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                        <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-chat-text text-sm mb-1 group-hover:text-primary transition-colors">{feature.title}</h3>
                        <p className="text-xs text-chat-text-muted">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          
          {hasStartedChat && (
            <div className="w-full max-w-4xl">
              {/* Chat messages would go here */}
              <div className="text-center text-chat-text-muted">
                Chat conversation will appear here...
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-chat-border bg-chat-sidebar flex-shrink-0">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === tab.name 
                      ? 'bg-primary text-white' 
                      : 'bg-chat-card text-chat-text-muted hover:bg-chat-hover hover:text-chat-text'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Input */}
          <div className="relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me about travel destinations, planning tips, or anything travel-related..."
              className="bg-chat-card border-chat-border text-chat-text pr-12 py-4 text-base focus:border-primary transition-all duration-200"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button 
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary-light transition-all duration-200 hover:scale-110"
              disabled={!message.trim()}
              onClick={handleSendMessage}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-chat-text-muted mt-2 text-center">
            AI can make mistakes. Always verify travel information and bookings independently.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;