-- Create admin_settings table to store system configuration
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_model TEXT NOT NULL DEFAULT 'gpt-5-2025-08-07',
  temperature DECIMAL(3,2) NOT NULL DEFAULT 0.7,
  system_prompt TEXT NOT NULL DEFAULT 'You are MedTutor AI, an expert USMLE medical tutor with deep knowledge in all medical fields.',
  max_tokens INTEGER NOT NULL DEFAULT 2048,
  enable_analytics BOOLEAN NOT NULL DEFAULT true,
  allow_guest_access BOOLEAN NOT NULL DEFAULT false,
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  rate_limit_enabled BOOLEAN NOT NULL DEFAULT true,
  max_questions_per_hour INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view and modify settings
CREATE POLICY "Admins can view settings"
ON public.admin_settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create settings"
ON public.admin_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create index for performance
CREATE INDEX idx_admin_settings_created_at ON public.admin_settings(created_at);

-- Insert default settings
INSERT INTO public.admin_settings (ai_model, system_prompt, created_by)
SELECT 'gpt-5-2025-08-07', 'You are MedTutor AI, an expert USMLE medical tutor with deep knowledge in all medical fields.', '92f9dfb6-0bd8-46f2-8db2-404aa8fb1598';