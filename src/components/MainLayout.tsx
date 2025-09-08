import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TravelPlanningSidebar } from "./TravelPlanningSidebar";
import { ChatInterface } from "./ChatInterface";

export function MainLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-chat-bg">
        <TravelPlanningSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-chat-border bg-chat-sidebar px-4">
            <SidebarTrigger className="text-chat-text hover:text-primary transition-colors" />
            <div className="ml-4">
              <span className="text-chat-text font-semibold">AI Travel Assistant</span>
            </div>
          </header>
          
          <main className="flex-1 overflow-hidden">
            <ChatInterface />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}