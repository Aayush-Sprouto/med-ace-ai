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
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
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

      // Fetch statistics using raw SQL since user_statistics is a new table
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_user_stats', { user_uuid: user.id })
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        // If function doesn't exist, create default stats
        setStatistics({
          questions_asked: 0,
          study_sessions: 0,
          topics_covered: 0,
          last_active_at: null
        });
      } else {
        setStatistics(statsData || {
          questions_asked: 0,
          study_sessions: 0,
          topics_covered: 0,
          last_active_at: null
        });
      }

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

  const updateProfile = async (updates: Partial<Pick<Profile, 'display_name' | 'study_level'>>) => {
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