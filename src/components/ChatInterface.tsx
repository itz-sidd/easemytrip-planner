import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Users,
  Bot,
  User,
  Loader2
} from "lucide-react";
import { aiTravelService } from "@/services/aiTravelService";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export const ChatInterface = () => {
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const handleSendMessage = async () => {
    if (message.trim() && !isLoading) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: message.trim(),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setHasStartedChat(true);
      setIsLoading(true);
      
      const currentMessage = message.trim();
      setMessage("");

      try {
        console.log('Sending message to AI:', currentMessage);
        
        // Create a simple conversational prompt for the AI
        const conversationalPrompt = {
          preferred_group_type: 'solo',
          budget_range: { min: 1000, max: 5000 },
          interests: ['conversation'],
          user_message: currentMessage
        };

        // Call the AI service with a more general approach
        const response = await aiTravelService.generatePersonalizedTravelGuide(conversationalPrompt);
        
        console.log('AI response received:', response);

        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: response.generatedGuide,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        toast({
          title: "Error",
          description: "Failed to get AI response. Please try again.",
          variant: "destructive",
        });

        // Provide a fallback response for simple greetings
        let fallbackResponse = "Hello! I'm your AI travel assistant. I can help you plan trips, find destinations, book hotels, and much more. What would you like to know about travel?";
        
        if (currentMessage.toLowerCase().includes('hey') || currentMessage.toLowerCase().includes('hello') || currentMessage.toLowerCase().includes('hi')) {
          fallbackResponse = "Hey there! 👋 I'm your AI travel assistant. I'm here to help you plan amazing trips! You can ask me about:\n\n• Destination recommendations\n• Hotel and flight bookings\n• Budget planning\n• Itinerary creation\n• Travel tips and advice\n\nWhat can I help you with today?";
        }

        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: fallbackResponse,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
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
            <ScrollArea className="w-full max-w-4xl h-full px-4">
              <div className="space-y-4 pb-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.type === 'user' 
                          ? 'bg-primary text-white' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {msg.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        msg.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm">
                          {msg.content}
                        </div>
                        <div className="text-xs mt-1 opacity-70">
                          {msg.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-lg p-3 bg-muted text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
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
              disabled={!message.trim() || isLoading}
              onClick={handleSendMessage}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
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