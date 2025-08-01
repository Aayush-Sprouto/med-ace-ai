import Header from "@/components/Header";
import ChatInterface from "@/components/ChatInterface";

const Chat = () => {
  return (
    <div className="flex flex-col h-screen bg-chat-background">
      <Header />
      <main className="flex-1 overflow-y-hidden">
        <ChatInterface />
      </main>
    </div>
  );
};

export default Chat;
