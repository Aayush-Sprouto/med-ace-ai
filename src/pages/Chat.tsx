import Header from "@/components/Header";
import ChatInterface from "@/components/ChatInterface";
import { SidebarProvider } from "@/components/ui/sidebar";

const Chat = () => {
  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen bg-chat-background w-full">
        <Header />
        <main className="flex-1 overflow-y-hidden">
          <ChatInterface />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Chat;
