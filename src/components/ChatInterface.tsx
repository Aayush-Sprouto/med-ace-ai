import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Send, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useConversations, useMessages } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';

const ChatInterface = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { 
    conversations, 
    loading: conversationsLoading, 
    createConversation, 
    deleteConversation 
  } = useConversations(user?.id);
  
  const { 
    messages, 
    loading: messagesLoading, 
    addMessage, 
    buildCheatSheet 
  } = useMessages(currentConversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewConversation = async () => {
    const conversation = await createConversation();
    if (conversation) {
      setCurrentConversationId(conversation.id);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    const success = await deleteConversation(conversationId);
    if (success) {
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
      }
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed.",
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    let conversationId = currentConversationId;

    // Create new conversation if none exists
    if (!conversationId) {
      const conversation = await createConversation();
      if (!conversation) {
        toast({
          title: "Error",
          description: "Failed to create conversation",
          variant: "destructive",
        });
        return;
      }
      conversationId = conversation.id;
      setCurrentConversationId(conversationId);
    }

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Add user message to database
      await addMessage(userMessage, 'user');

      // Build the cheat sheet with full conversation history + new question
      const conversationHistory = buildCheatSheet();
      const cheatSheet = conversationHistory + '\n\nuser: ' + userMessage;

      // Call the AI chat function
      const response = await fetch('/functions/v1/chat-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cheatSheet,
          userQuestion: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const { response: aiResponse } = await response.json();
      
      // Add AI response to database
      await addMessage(aiResponse, 'assistant');

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar for conversations */}
      <div className="w-80 border-r border-border bg-card/30 flex flex-col">
        <div className="p-4 border-b border-border">
          <Button 
            onClick={handleNewConversation} 
            className="w-full"
            variant="hero"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Conversation
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversationsLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a new chat to begin</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors group hover:bg-accent/50 ${
                    currentConversationId === conversation.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setCurrentConversationId(conversation.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conversation.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conversation.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {currentConversationId ? (
          <>
            <div className="flex-1 p-6 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messagesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Start the conversation</h3>
                      <p className="text-muted-foreground">
                        Ask me anything about medical topics and I'll help you learn!
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <Card className={`max-w-[80%] p-4 ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-card'
                        }`}>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-2 ${
                            message.role === 'user' 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </Card>
                      </div>
                    ))
                  )}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <Card className="p-4 bg-card">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.2s]"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.4s]"></div>
                        </div>
                      </Card>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            <Separator />
            
            <div className="p-6">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
                <div className="flex gap-4">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about medical topics..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    variant="hero"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-medium mb-2">Welcome to MedTutor AI</h3>
              <p className="text-muted-foreground mb-6">
                Select a conversation or start a new one to begin learning
              </p>
              <Button onClick={handleNewConversation} variant="hero">
                <Plus className="w-4 h-4 mr-2" />
                Start New Conversation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;