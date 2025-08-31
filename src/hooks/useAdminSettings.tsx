import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminSettings {
  aiModel: string;
  temperature: number;
  systemPrompt: string;
  maxTokens: number;
  enableAnalytics: boolean;
  allowGuestAccess: boolean;
  maintenanceMode: boolean;
  rateLimitEnabled: boolean;
  maxQuestionsPerHour: number;
}

const DEFAULT_SETTINGS: AdminSettings = {
  aiModel: 'gpt-5-2025-08-07',
  temperature: 0.7,
  systemPrompt: 'You are MedTutor AI, an expert USMLE medical tutor with deep knowledge in all medical fields. Provide clear, accurate, and helpful responses to medical education questions.',
  maxTokens: 2048,
  enableAnalytics: true,
  allowGuestAccess: false,
  maintenanceMode: false,
  rateLimitEnabled: true,
  maxQuestionsPerHour: 50,
};

export const useAdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Check if settings table exists and get latest settings
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
        console.error('Error loading settings:', error);
        throw error;
      }

      if (data) {
        setSettings({
          aiModel: data.ai_model || DEFAULT_SETTINGS.aiModel,
          temperature: data.temperature || DEFAULT_SETTINGS.temperature,
          systemPrompt: data.system_prompt || DEFAULT_SETTINGS.systemPrompt,
          maxTokens: data.max_tokens || DEFAULT_SETTINGS.maxTokens,
          enableAnalytics: data.enable_analytics ?? DEFAULT_SETTINGS.enableAnalytics,
          allowGuestAccess: data.allow_guest_access ?? DEFAULT_SETTINGS.allowGuestAccess,
          maintenanceMode: data.maintenance_mode ?? DEFAULT_SETTINGS.maintenanceMode,
          rateLimitEnabled: data.rate_limit_enabled ?? DEFAULT_SETTINGS.rateLimitEnabled,
          maxQuestionsPerHour: data.max_questions_per_hour || DEFAULT_SETTINGS.maxQuestionsPerHour,
        });
      }
    } catch (error) {
      console.error('Error loading admin settings:', error);
      // Use default settings if there's an error
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<AdminSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      // Save to database
      const { error } = await supabase
        .from('admin_settings')
        .insert({
          ai_model: updatedSettings.aiModel,
          temperature: updatedSettings.temperature,
          system_prompt: updatedSettings.systemPrompt,
          max_tokens: updatedSettings.maxTokens,
          enable_analytics: updatedSettings.enableAnalytics,
          allow_guest_access: updatedSettings.allowGuestAccess,
          maintenance_mode: updatedSettings.maintenanceMode,
          rate_limit_enabled: updatedSettings.rateLimitEnabled,
          max_questions_per_hour: updatedSettings.maxQuestionsPerHour,
        });

      if (error) {
        console.error('Error saving settings:', error);
        throw error;
      }

      setSettings(updatedSettings);
      
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });

      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    settings,
    loading,
    saveSettings,
    loadSettings,
  };
};