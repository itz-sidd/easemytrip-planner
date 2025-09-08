import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageCircle, Users, Calendar, MapPin, Plane, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ChatDashboard() {
  const [message, setMessage] = useState("");
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth if not logged in (after loading is complete)
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const chatHistory: Array<{ type: "user" | "assistant"; content: string }> = [];

  const tabs = [
    { id: "general", label: "General", icon: MessageCircle },
    { id: "travel", label: "Travel", icon: Plane },
    { id: "support", label: "Support", icon: Users },
  ];

  const featureCards = [
    {
      title: "AI Travel Planning",
      description: "Get personalized travel recommendations and itineraries",
      icon: MapPin,
      action: "Open Travel Planner",
      onClick: () => navigate("/travel")
    },
    {
      title: "Quick Questions",
      description: "Ask me anything about destinations, weather, or travel tips",
      icon: MessageCircle,
      action: "Start Chatting",
      onClick: () => setHasStartedChat(true)
    },
    {
      title: "Trip Assistance",
      description: "Get help with booking, itineraries, and travel logistics",
      icon: Calendar,
      action: "Get Help",
      onClick: () => setHasStartedChat(true)
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      setHasStartedChat(true);
      setMessage("");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-chat-bg flex items-center justify-center">
        <div className="text-chat-text">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-chat-bg text-chat-text">
      {/* Header */}
      <header className="border-b border-chat-border bg-chat-sidebar">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-chat-text">AI Assistant</h1>
              <span className="text-sm text-chat-secondary">Welcome, {user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate("/travel")}
                className="text-chat-text border-chat-border hover:bg-chat-hover"
              >
                <Plane className="h-4 w-4 mr-2" />
                Travel Planner
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                className="text-chat-text hover:bg-chat-hover"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto max-w-4xl h-[calc(100vh-80px)] flex flex-col">
        {/* Chat Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {!hasStartedChat ? (
            <div className="text-center space-y-8 py-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-chat-text">
                  How can I help you today?
                </h2>
                <p className="text-lg text-chat-secondary max-w-2xl mx-auto">
                  I'm your AI assistant, ready to help with questions, travel planning, and more. 
                  Choose a category below or start typing your question.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {featureCards.map((card, index) => (
                  <Card 
                    key={index} 
                    className="bg-chat-sidebar border-chat-border hover:bg-chat-hover transition-colors cursor-pointer group"
                    onClick={card.onClick}
                  >
                    <CardHeader className="pb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                        <card.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-chat-text text-lg">{card.title}</CardTitle>
                      <CardDescription className="text-chat-secondary">
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <span className="text-primary text-sm font-medium">{card.action} →</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      msg.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-chat-sidebar text-chat-text border border-chat-border"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-chat-border bg-chat-sidebar p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 bg-chat-bg">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 data-[state=active]:bg-chat-sidebar data-[state=active]:text-primary"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                <div className="flex gap-3">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Ask me anything about ${tab.label.toLowerCase()}...`}
                    className="flex-1 bg-chat-bg border-chat-border text-chat-text placeholder:text-chat-secondary"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}