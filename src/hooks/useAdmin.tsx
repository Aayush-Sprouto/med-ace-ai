import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface AdminStats {
  total_users: number;
  active_users_today: number;
  total_conversations: number;
  total_messages: number;
  questions_today: number;
  new_users_today: number;
}

export interface UserDetails {
  user_id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  study_level: string;
  role: 'admin' | 'moderator' | 'user';
  questions_asked: number;
  study_sessions: number;
  topics_covered: number;
  last_active_at: string;
  created_at: string;
  conversation_count: number;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_user_id: string;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export const useAdmin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log('Checking admin status for user:', user.id);
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (error) throw error;
        console.log('Admin status result:', data);
        setIsAdmin(data);
        
        // Auto-fetch data when admin status is confirmed
        if (data) {
          console.log('User is admin, fetching data...');
          await Promise.all([
            fetchStats(),
            fetchUsers(), 
            fetchLogs()
          ]);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Fetch admin statistics
  const fetchStats = async () => {
    try {
      console.log('Fetching admin stats...');
      const { data, error } = await supabase.rpc('get_admin_stats');
      if (error) {
        console.error('RPC error:', error);
        throw error;
      }
      console.log('Admin stats response:', data);
      if (data && data.length > 0) {
        setStats(data[0]);
        console.log('Stats set:', data[0]);
      } else {
        console.log('No stats data returned');
        setStats({
          total_users: 0,
          active_users_today: 0,
          total_conversations: 0,
          total_messages: 0,
          questions_today: 0,
          new_users_today: 0
        });
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin statistics",
        variant: "destructive",
      });
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      
      // Fetch profiles first
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, study_level, created_at');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      console.log('Profiles data:', profiles);

      if (!profiles || profiles.length === 0) {
        console.log('No profiles found');
        setUsers([]);
        return;
      }

      // Fetch user roles separately
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
      }

      // Fetch user statistics separately
      const { data: userStats, error: statsError } = await supabase
        .from('user_statistics')
        .select('user_id, questions_asked, study_sessions, topics_covered, last_active_at');

      if (statsError) {
        console.error('Error fetching user statistics:', statsError);
      }

      // Transform and combine data
      const userDetails = profiles.map((profile: any) => {
        const userRole = userRoles?.find(role => role.user_id === profile.user_id);
        const userStat = userStats?.find(stat => stat.user_id === profile.user_id);

        return {
          user_id: profile.user_id,
          email: 'user@example.com', // Default since we can't get email from auth directly
          display_name: profile.display_name || 'Unknown',
          avatar_url: profile.avatar_url || '',
          study_level: profile.study_level || 'Beginner',
          role: (userRole?.role || 'user') as 'admin' | 'moderator' | 'user',
          questions_asked: userStat?.questions_asked || 0,
          study_sessions: userStat?.study_sessions || 0,
          topics_covered: userStat?.topics_covered || 0,
          last_active_at: userStat?.last_active_at || null,
          created_at: profile.created_at,
          conversation_count: 0 // We'll calculate this separately if needed
        };
      });

      console.log('Transformed user details:', userDetails);
      setUsers(userDetails);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
      setUsers([]); // Set empty array on error
    }
  };

  // Fetch admin logs
  const fetchLogs = async () => {
    try {
      console.log('Fetching admin logs...');
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching logs:', error);
        throw error;
      }
      
      console.log('Admin logs data:', data);
      setLogs((data || []).map(log => ({
        id: log.id,
        admin_id: log.admin_id,
        action: log.action,
        target_user_id: log.target_user_id || '',
        details: log.details,
        ip_address: (log.ip_address as string) || null,
        user_agent: log.user_agent || null,
        created_at: log.created_at
      })));
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin logs",
        variant: "destructive",
      });
    }
  };

  // Update user role
  const updateUserRole = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    if (!isAdmin) return;

    try {
      // Delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole,
          assigned_by: user?.id
        });

      if (error) throw error;

      // Log the action
      await logAdminAction('update_user_role', userId, { new_role: newRole });

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });

      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  // Log admin action
  const logAdminAction = async (action: string, targetUserId?: string, details?: any) => {
    if (!isAdmin) return;

    try {
      await supabase
        .from('admin_logs')
        .insert({
          admin_id: user?.id,
          action,
          target_user_id: targetUserId,
          details,
          ip_address: null, // Would need to get from request in real app
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  };

  // Delete user (admin function not available in client, so we'll disable the user instead)
  const deleteUser = async (userId: string) => {
    if (!isAdmin) return;

    try {
      // Instead of actually deleting, we'll remove the user's profile and data
      // First delete related data
      await supabase.from('user_statistics').delete().eq('user_id', userId);
      await supabase.from('user_roles').delete().eq('user_id', userId);
      
      // Delete conversations and messages
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', userId);
      
      if (conversations) {
        for (const conv of conversations) {
          await supabase.from('messages').delete().eq('conversation_id', conv.id);
        }
        await supabase.from('conversations').delete().eq('user_id', userId);
      }
      
      // Finally delete the profile
      const { error } = await supabase.from('profiles').delete().eq('user_id', userId);
      if (error) throw error;

      await logAdminAction('delete_user', userId);

      toast({
        title: "Success",
        description: "User data deleted successfully",
      });

      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user data",
        variant: "destructive",
      });
    }
  };

  return {
    isAdmin,
    loading,
    stats,
    users,
    logs,
    fetchStats,
    fetchUsers,
    fetchLogs,
    updateUserRole,
    deleteUser,
    logAdminAction
  };
};