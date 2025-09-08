import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  Search, 
  Plus, 
  MoreHorizontal,
  FolderOpen,
  Bookmark,
  Image,
  Video,
  Music,
  BarChart3,
  Send,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign
} from "lucide-react";

const ChatInterface = () => {
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("All");

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
      icon: Bookmark,
      title: "Saved Prompt Templates",
      description: "Users can save and reuse prompt templates for faster responses.",
    },
    {
      icon: Image,
      title: "Media Type Selector",
      description: "Users select media type for tailored interactions.",
    },
    {
      icon: MapPin,
      title: "Multilingual Support",
      description: "Chrome language for better interaction.",
    }
  ];

  return (
    <div className="h-screen bg-chat-bg text-chat-text flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-chat-sidebar border-r border-chat-border flex flex-col animate-slide-in-left">
        {/* Header */}
        <div className="p-4 border-b border-chat-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              My Trips
            </h1>
            <MoreHorizontal className="h-5 w-5 text-chat-text-muted cursor-pointer hover:text-chat-text transition-colors" />
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-chat-text-muted" />
            <Input 
              placeholder="Search trips..." 
              className="bg-chat-card border-chat-border text-chat-text pl-10 focus:border-primary"
            />
          </div>
        </div>

        {/* Folders */}
        <div className="p-4 border-b border-chat-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-chat-text-muted">Folders</span>
            <FolderOpen className="h-4 w-4 text-chat-text-muted" />
          </div>
          <div className="space-y-1">
            {["Work chats", "Life chats", "Projects chats", "Clients chats"].map((folder, index) => (
              <div 
                key={folder}
                className="flex items-center justify-between p-2 rounded-md hover:bg-chat-hover cursor-pointer transition-all duration-200 animate-fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-4 w-4 text-chat-text-muted" />
                  <span className="text-sm">{folder}</span>
                </div>
                <MoreHorizontal className="h-4 w-4 text-chat-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="mb-3">
            <span className="text-sm font-medium text-chat-text-muted">Chats</span>
          </div>
          <div className="space-y-2">
            {chatHistory.map((chat, index) => (
              <div 
                key={chat.title}
                className="p-3 rounded-md hover:bg-chat-hover cursor-pointer transition-all duration-200 group animate-fade-in hover:scale-[1.02]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">{chat.title}</h4>
                <p className="text-xs text-chat-text-muted line-clamp-2">{chat.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button className="w-full bg-primary hover:bg-primary-light transition-all duration-200 hover:scale-105">
            <Plus className="h-4 w-4 mr-2" />
            New chat
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-chat-border bg-chat-sidebar">
          <div className="flex items-center gap-3">
            <button className="text-chat-text-muted hover:text-chat-text">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="font-semibold text-chat-text">Name chat</h2>
              <span className="text-xs text-primary bg-primary/20 px-2 py-1 rounded">GPT 3.5</span>
            </div>
          </div>
        </div>

        {/* Welcome Area */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 animate-fade-in">
          <div className="max-w-2xl text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 animate-scale-in text-chat-text">
              How can I help you today?
            </h1>
            <p className="text-chat-text-muted text-base mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              This code will display a prompt asking the user for their name, and then it will
              display a greeting message with the name entered by the user.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8 w-full max-w-4xl">
            {featureCards.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.title}
                  className="bg-chat-card border border-chat-border rounded-lg p-6 hover:bg-chat-hover transition-all duration-300 cursor-pointer group animate-scale-in hover:scale-105"
                  style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
                >
                  <Icon className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-sm text-chat-text-muted">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-chat-border bg-chat-sidebar">
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
              placeholder="What do you have in mind?"
              className="bg-chat-card border-chat-border text-chat-text pr-12 py-4 text-base focus:border-primary transition-all duration-200"
              onKeyPress={(e) => e.key === 'Enter' && message.trim() && console.log('Send message:', message)}
            />
            <Button 
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary-light transition-all duration-200 hover:scale-110"
              disabled={!message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-chat-text-muted mt-2 text-center">
            This product can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;