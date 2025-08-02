import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// import { Send, Plus, MessageSquare, Trash2, Edit, Copy, Check, X } from 'lucide-react';
import { Send, Plus, MessageSquare, Trash2, Edit, Copy, Check, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useConversations, useMessages } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';

const ChatInterface = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState('');
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingConversationTitle, setEditingConversationTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { 
    conversations, 
    loading: conversationsLoading, 
    createConversation, 
    deleteConversation,
    updateConversationTitle 
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

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy message.",
        variant: "destructive",
      });
    }
  };

  const startEditingConversation = (conversationId: string, currentTitle: string) => {
    setEditingConversationId(conversationId);
    setEditingConversationTitle(currentTitle);
  };

  const handleUpdateConversationTitle = async () => {
    if (!editingConversationId || !editingConversationTitle.trim()) return;
    
    const success = await updateConversationTitle(editingConversationId, editingConversationTitle.trim());
    if (success) {
      toast({
        title: "Updated",
        description: "Conversation title updated.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update conversation title.",
        variant: "destructive",
      });
    }
    setEditingConversationId(null);
    setEditingConversationTitle('');
  };

  const cancelEditingConversation = () => {
    setEditingConversationId(null);
    setEditingConversationTitle('');
  };

  const generateConversationTitle = (firstMessage: string): string => {
    const title = firstMessage.trim().substring(0, 50);
    return title.length === 50 ? title + '...' : title;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    let conversationId = currentConversationId;

    if (!conversationId) {
      const title = generateConversationTitle(userMessage);
      const conversation = await createConversation(title);
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
    setInput('');
    setIsLoading(true);

    try {
      await addMessage(userMessage, 'user');
      const conversationHistory = buildCheatSheet();
      const cheatSheet = conversationHistory + '\n\nuser: ' + userMessage;

      const response = await fetch(`https://cbjuypyejbmqfeseejgl.supabase.co/functions/v1/chat-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cheatSheet,
          userQuestion: userMessage,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to get AI response: ${response.status} - ${errorText}`);
      }

      const { response: aiResponse } = await response.json();
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
    <div className="relative flex h-full overflow-hidden bg-background">
      
      {/* Backdrop for mobile view, appears when sidebar is open */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
        ></div>
      )}

      {/* Responsive Sidebar (Drawer on mobile, Push on desktop) */}
      <div 
        className={`fixed md:relative z-30 flex h-full w-80 flex-shrink-0 flex-col border-r border-border bg-card/30 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
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
                      {editingConversationId === conversation.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingConversationTitle}
                            onChange={(e) => setEditingConversationTitle(e.target.value)}
                            className="text-sm h-6 p-1"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateConversationTitle();
                              } else if (e.key === 'Escape') {
                                cancelEditingConversation();
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); handleUpdateConversationTitle(); }}>
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); cancelEditingConversation(); }}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium truncate">
                            {conversation.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(conversation.updated_at).toLocaleDateString()}
                          </p>
                        </>
                      )}
                    </div>
                    {editingConversationId !== conversation.id && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); startEditingConversation(conversation.id, conversation.title); }}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conversation.id); }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col max-h-screen">
        
        {/* Always-visible Toggle Button */}
        <Button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          variant="ghost"
          size="sm"
          className={`fixed top-3 left-3 z-50 h-8 w-8 p-0 text-muted-foreground transition-all duration-300 hover:bg-accent hover:text-foreground md:absolute ${
            isSidebarOpen ? 'md:left-80' : 'md:left-3'
          }`}
        >
          {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </Button>
        
        {currentConversationId ? (
          <>
            <div className="flex-1 p-6 pt-14 overflow-y-auto">
              <div className="space-y-4 max-w-4xl mx-auto">
                  {messagesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
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
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                      >
                        <Card className={`max-w-[80%] p-4 relative ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-card'
                        }`}>
                          {message.role === 'assistant' ? (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <p className={`text-xs ${
                              message.role === 'user' 
                                ? 'text-primary-foreground/70' 
                                : 'text-muted-foreground'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 w-6 p-0 ${
                                  message.role === 'user' 
                                    ? 'hover:bg-primary-foreground/20 text-primary-foreground/70' 
                                    : 'hover:bg-accent'
                                }`}
                                onClick={() => handleCopyMessage(message.content)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
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
            </div>

            <Separator />
            
            <div className="p-6">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
                <div className="flex gap-4">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about medical topics..."
                    disabled={isLoading}
                    className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    variant="hero"
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 pt-14">
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
