import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useConversations = (userId: string | undefined) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!userId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
    } else {
      setConversations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConversations();
  }, [userId]);

  const createConversation = async (title: string = 'New Conversation') => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('conversations')
      .insert([{ user_id: userId, title }])
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    await fetchConversations();
    return data;
  };

  const updateConversationTitle = async (conversationId: string, title: string) => {
    const { error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', conversationId);

    if (error) {
      console.error('Error updating conversation:', error);
      return false;
    }

    await fetchConversations();
    return true;
  };

  const deleteConversation = async (conversationId: string) => {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }

    await fetchConversations();
    return true;
  };

  return {
    conversations,
    loading,
    createConversation,
    updateConversationTitle,
    deleteConversation,
    refetch: fetchConversations,
  };
};

export const useMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages((data || []) as Message[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  const addMessage = async (content: string, role: 'user' | 'assistant') => {
    if (!conversationId) return null;

    const { data, error } = await supabase
      .from('messages')
      .insert([{ conversation_id: conversationId, content, role }])
      .select()
      .single();

    if (error) {
      console.error('Error adding message:', error);
      return null;
    }

    await fetchMessages();
    return data;
  };

  // Build the "Cheat Sheet" - full conversation history
  const buildCheatSheet = () => {
    return messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
  };

  return {
    messages,
    loading,
    addMessage,
    buildCheatSheet,
    refetch: fetchMessages,
  };
};