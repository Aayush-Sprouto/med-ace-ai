import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  study_level: string | null;
  created_at: string;
  updated_at: string;
}

interface UserStatistics {
  questions_asked: number;
  study_sessions: number;
  topics_covered: number;
  last_active_at: string | null;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics>({
    questions_asked: 0,
    study_sessions: 0,
    topics_covered: 0,
    last_active_at: null
  });
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      // Calculate statistics from conversations and messages
      const { data: conversationsData } = await supabase
        .from('conversations')
        .select('id, created_at')
        .eq('user_id', user.id);

      const { data: messagesData } = await supabase
        .from('messages')
        .select('conversation_id, role')
        .in('conversation_id', conversationsData?.map(c => c.id) || []);

      const questionsAsked = messagesData?.filter(m => m.role === 'user').length || 0;
      const studySessions = conversationsData?.length || 0;
      const topicsCovered = Math.min(Math.floor(questionsAsked / 5), 10); // Estimate topics based on questions

      setStatistics({
        questions_asked: questionsAsked,
        study_sessions: studySessions,
        topics_covered: topicsCovered,
        last_active_at: conversationsData?.[0]?.created_at || null
      });

      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Pick<Profile, 'display_name' | 'study_level' | 'avatar_url'>>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    statistics,
    loading,
    updateProfile,
    refetchProfile: fetchProfile
  };
};