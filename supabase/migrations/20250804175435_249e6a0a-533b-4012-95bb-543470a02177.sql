-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'moderator' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$$;

-- Create policies for user_roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin_logs table for audit trail
CREATE TABLE public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    action TEXT NOT NULL,
    target_user_id UUID REFERENCES auth.users(id),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin_logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_logs
CREATE POLICY "Admins can view admin logs"
ON public.admin_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create admin logs"
ON public.admin_logs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to get admin statistics
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE(
    total_users BIGINT,
    active_users_today BIGINT,
    total_conversations BIGINT,
    total_messages BIGINT,
    questions_today BIGINT,
    new_users_today BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    (SELECT COUNT(*) FROM auth.users),
    (SELECT COUNT(DISTINCT user_id) FROM public.user_statistics WHERE last_active_at >= CURRENT_DATE),
    (SELECT COUNT(*) FROM public.conversations),
    (SELECT COUNT(*) FROM public.messages),
    (SELECT SUM(questions_asked) FROM public.user_statistics WHERE updated_at >= CURRENT_DATE),
    (SELECT COUNT(*) FROM auth.users WHERE created_at >= CURRENT_DATE)
$$;

-- Function to get user details for admin
CREATE OR REPLACE FUNCTION public.get_user_details(_user_id UUID)
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    study_level TEXT,
    role app_role,
    questions_asked INTEGER,
    study_sessions INTEGER,
    topics_covered INTEGER,
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    conversation_count BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    p.user_id,
    au.email,
    p.display_name,
    p.avatar_url,
    p.study_level,
    COALESCE(ur.role, 'user'::app_role),
    COALESCE(us.questions_asked, 0),
    COALESCE(us.study_sessions, 0),
    COALESCE(us.topics_covered, 0),
    us.last_active_at,
    au.created_at,
    (SELECT COUNT(*) FROM public.conversations WHERE user_id = _user_id)
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.user_id
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id
  LEFT JOIN public.user_statistics us ON au.id = us.user_id
  WHERE au.id = _user_id
$$;

-- Create trigger to automatically assign 'user' role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();